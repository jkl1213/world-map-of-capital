// One-off ETL script: pulls real bilateral figures for our 25 tracked countries from
// free public APIs (IMF CPIS via DBnomics, BIS locational banking stats via DBnomics,
// UN Comtrade) and writes them to scripts/output/real-flows.json for the app to consume.
//
// Run with: node scripts/fetch-real-data.mjs

import { writeFile, mkdir } from "node:fs/promises";

const countries = [
  { id: "US", iso2: "US", m49: 840 },
  { id: "CN", iso2: "CN", m49: 156 },
  { id: "JP", iso2: "JP", m49: 392 },
  { id: "DE", iso2: "DE", m49: 276 },
  { id: "GB", iso2: "GB", m49: 826 },
  { id: "FR", iso2: "FR", m49: 250 },
  { id: "CA", iso2: "CA", m49: 124 },
  { id: "IN", iso2: "IN", m49: 356 },
  { id: "BR", iso2: "BR", m49: 76 },
  { id: "SA", iso2: "SA", m49: 682 },
  { id: "AE", iso2: "AE", m49: 784 },
  { id: "RU", iso2: "RU", m49: 643 },
  { id: "KR", iso2: "KR", m49: 410 },
  { id: "SG", iso2: "SG", m49: 702 },
  { id: "CH", iso2: "CH", m49: 756 },
  { id: "NL", iso2: "NL", m49: 528 },
  { id: "MX", iso2: "MX", m49: 484 },
  { id: "ID", iso2: "ID", m49: 360 },
  { id: "VN", iso2: "VN", m49: 704 },
  { id: "NG", iso2: "NG", m49: 566 },
  { id: "ZA", iso2: "ZA", m49: 710 },
  { id: "AU", iso2: "AU", m49: 36 },
  { id: "QA", iso2: "QA", m49: 634 },
  { id: "NO", iso2: "NO", m49: 578 },
  { id: "KE", iso2: "KE", m49: 404 },
];

const COMMODITY_EXPORTERS = ["SA", "AE", "RU", "NO", "QA", "AU"];

// ---------- generic helpers ----------

async function fetchJsonWithRetry(url, { timeoutMs = 12000, retries = 1 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) {
        if (res.status === 429 && attempt < retries) {
          await new Promise((r) => setTimeout(r, 800));
          continue;
        }
        return null;
      }
      return await res.json();
    } catch {
      clearTimeout(timer);
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 500));
        continue;
      }
      return null;
    }
  }
  return null;
}

function lastObservation(dbnomicsJson) {
  const doc = dbnomicsJson?.series?.docs?.[0];
  if (!doc || !doc.period?.length) return null;
  // walk backwards to find the last non-null value
  for (let i = doc.value.length - 1; i >= 0; i--) {
    if (doc.value[i] !== null && doc.value[i] !== undefined) {
      return { period: doc.period[i], value: doc.value[i] };
    }
  }
  return null;
}

// ---------- concurrency-limited task queue ----------

async function runPool(tasks, concurrency, onProgress) {
  const results = new Array(tasks.length);
  let cursor = 0;
  let completed = 0;

  async function worker() {
    while (true) {
      const i = cursor++;
      if (i >= tasks.length) return;
      try {
        results[i] = await tasks[i]();
      } catch {
        results[i] = null;
      }
      completed++;
      if (onProgress && completed % 50 === 0) onProgress(completed, tasks.length);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  if (onProgress) onProgress(tasks.length, tasks.length);
  return results;
}

// ---------- source-specific fetchers ----------

async function fetchCpis(reporterIso2, counterpartIso2, indicatorCode) {
  const seriesCode = `B.${reporterIso2}.${indicatorCode}.T.T.${counterpartIso2}`;
  const url = `https://api.db.nomics.world/v22/series/IMF/CPIS/${seriesCode}?observations=1&format=json`;
  const json = await fetchJsonWithRetry(url);
  const obs = lastObservation(json);
  if (!obs) return null;
  return { period: obs.period, usd: obs.value };
}

async function fetchBisBanking(repIso2, cpIso2) {
  const seriesCode = `Q.S.C.A.TO1.A.5J.A.${repIso2}.A.${cpIso2}.N`;
  const url = `https://api.db.nomics.world/v22/series/BIS/WS_LBS_D_PUB/${seriesCode}?observations=1&format=json`;
  const json = await fetchJsonWithRetry(url);
  const obs = lastObservation(json);
  if (!obs) return null;
  return { period: obs.period, usd: obs.value * 1e6 }; // BIS LBS values are in millions
}

async function fetchComtrade(reporterM49, partnerM49, flowCode, cmdCode = "TOTAL") {
  const url = `https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=${reporterM49}&partnerCode=${partnerM49}&period=2023&cmdCode=${cmdCode}&flowCode=${flowCode}`;
  const json = await fetchJsonWithRetry(url);
  const rec = json?.data?.[0];
  if (!rec || !rec.primaryValue) return null;
  return { period: String(rec.refYear ?? rec.period), usd: rec.primaryValue };
}

/** exports from `from` to `to`, preferring the importer's mirror report (more reliable), falling back to the exporter's self-report. */
async function fetchTradeFlow(from, to, cmdCode = "TOTAL") {
  const mirror = await fetchComtrade(to.m49, from.m49, "M", cmdCode); // to reports imports from `from`
  if (mirror) return mirror;
  return fetchComtrade(from.m49, to.m49, "X", cmdCode); // from self-reports exports to `to`
}

// ---------- main ----------

async function main() {
  const outDir = new URL("./output/", import.meta.url);
  await mkdir(outDir, { recursive: true });

  const orderedPairs = [];
  for (const a of countries) {
    for (const b of countries) {
      if (a.id !== b.id) orderedPairs.push([a, b]);
    }
  }

  console.log(`Ordered pairs: ${orderedPairs.length}`);

  // ---- CPIS: debt securities (bonds) ----
  console.log("Fetching CPIS debt securities (bonds)...");
  const bondTasks = orderedPairs.map(([a, b]) => async () => {
    const r = await fetchCpis(a.iso2, b.iso2, "I_A_D_T_T_BP6_USD");
    return r ? { source: a.id, target: b.id, ...r } : null;
  });
  const bondResults = await runPool(bondTasks, 6, (c, t) =>
    console.log(`  bonds: ${c}/${t}`)
  );

  // ---- CPIS: equity ----
  console.log("Fetching CPIS equity...");
  const equityTasks = orderedPairs.map(([a, b]) => async () => {
    const r = await fetchCpis(a.iso2, b.iso2, "I_A_E_T_T_BP6_USD");
    return r ? { source: a.id, target: b.id, ...r } : null;
  });
  const equityResults = await runPool(equityTasks, 6, (c, t) =>
    console.log(`  equity: ${c}/${t}`)
  );

  // ---- BIS: locational banking claims ----
  console.log("Fetching BIS banking claims...");
  const bankingTasks = orderedPairs.map(([a, b]) => async () => {
    const r = await fetchBisBanking(a.iso2, b.iso2);
    return r ? { source: a.id, target: b.id, ...r } : null;
  });
  const bankingResults = await runPool(bankingTasks, 6, (c, t) =>
    console.log(`  banking: ${c}/${t}`)
  );

  // ---- Comtrade: total trade ----
  console.log("Fetching Comtrade total trade...");
  const tradeTasks = orderedPairs.map(([a, b]) => async () => {
    const r = await fetchTradeFlow(a, b, "TOTAL");
    return r ? { source: a.id, target: b.id, ...r } : null;
  });
  const tradeResults = await runPool(tradeTasks, 6, (c, t) =>
    console.log(`  trade: ${c}/${t}`)
  );

  // ---- Comtrade: mineral fuels (HS 27) for known commodity exporters ----
  console.log("Fetching Comtrade mineral fuels (commodity) ...");
  const commodityPairs = [];
  for (const expId of COMMODITY_EXPORTERS) {
    const exp = countries.find((c) => c.id === expId);
    for (const c of countries) {
      if (c.id !== expId) commodityPairs.push([exp, c]);
    }
  }
  const commodityTasks = commodityPairs.map(([a, b]) => async () => {
    const r = await fetchTradeFlow(a, b, "27");
    return r ? { source: a.id, target: b.id, ...r } : null;
  });
  const commodityResults = await runPool(commodityTasks, 6, (c, t) =>
    console.log(`  commodity: ${c}/${t}`)
  );

  const output = {
    fetchedAt: new Date().toISOString(),
    bond: bondResults.filter(Boolean),
    equity: equityResults.filter(Boolean),
    banking: bankingResults.filter(Boolean),
    trade: tradeResults.filter(Boolean),
    commodity: commodityResults.filter(Boolean),
  };

  const outPath = new URL("./real-flows.json", outDir);
  await writeFile(outPath, JSON.stringify(output, null, 2));

  console.log("\nDone. Counts:");
  for (const key of ["bond", "equity", "banking", "trade", "commodity"]) {
    console.log(`  ${key}: ${output[key].length}`);
  }
  console.log(`Written to ${outPath.pathname}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
