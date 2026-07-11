// Fetches three additional commodity categories from UN Comtrade, using the same
// corrected extraction (server-side motCode=0&partner2Code=0 filters, C00 customs-regime
// row) and resumable-checkpoint pattern as fetch-trade-corrected.mjs:
//
//   ores: HS 26 (metal ores - iron, copper, nickel, lithium...)
//   agri: HS 10+12+15 (cereals, oilseeds, animal/vegetable fats incl. palm oil)
//   gold: HS 71 (precious metals & stones)
//
// Exporter sets are the plausible large exporters per category among our 25 countries.
// Pairs touching US/FR/IN/CH/NO are skipped outright: those five are structurally
// excluded from the Comtrade free tier (zero records as reporter or partner, verified),
// so querying them only burns quota.
//
// agri sums the per-chapter aggregate rows (one C00 row per chapter) into one value.
//
// Writes results to output/commodities-extra.json on every checkpoint, so
// build-flows.mjs can pick up partial data at any time. Re-run to resume.
//
// Run with: node scripts/fetch-commodities-extra.mjs

import { readFile, writeFile } from "node:fs/promises";

const countries = [
  { id: "US", m49: 840 }, { id: "CN", m49: 156 }, { id: "JP", m49: 392 },
  { id: "DE", m49: 276 }, { id: "GB", m49: 826 }, { id: "FR", m49: 250 },
  { id: "CA", m49: 124 }, { id: "IN", m49: 356 }, { id: "BR", m49: 76 },
  { id: "SA", m49: 682 }, { id: "AE", m49: 784 }, { id: "RU", m49: 643 },
  { id: "KR", m49: 410 }, { id: "SG", m49: 702 }, { id: "CH", m49: 756 },
  { id: "NL", m49: 528 }, { id: "MX", m49: 484 }, { id: "ID", m49: 360 },
  { id: "VN", m49: 704 }, { id: "NG", m49: 566 }, { id: "ZA", m49: 710 },
  { id: "AU", m49: 36 }, { id: "QA", m49: 634 }, { id: "NO", m49: 578 },
  { id: "KE", m49: 404 },
];

// Structurally excluded from the free tier - verified zero records in any role.
const EXCLUDED = new Set(["US", "FR", "IN", "CH", "NO"]);

const CATEGORIES = {
  ores: { cmdCode: "26", exporters: ["AU", "BR", "ZA", "CA", "ID", "RU"] },
  agri: { cmdCode: "10,12,15", exporters: ["BR", "RU", "CA", "AU", "ID", "VN"] },
  gold: { cmdCode: "71", exporters: ["AE", "ZA", "AU", "GB", "SG", "CA"] },
};

const BASE_DELAY_MS = 800;
const CHECKPOINT_PATH = new URL("./output/commodities-extra-checkpoint.json", import.meta.url);
const RESULTS_PATH = new URL("./output/commodities-extra.json", import.meta.url);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function loadCheckpoint() {
  try {
    return JSON.parse(await readFile(CHECKPOINT_PATH, "utf8"));
  } catch {
    return { ores: {}, agri: {}, gold: {} };
  }
}

async function saveCheckpointAndResults(cp) {
  await writeFile(CHECKPOINT_PATH, JSON.stringify(cp, null, 2));
  const results = {};
  for (const cat of Object.keys(CATEGORIES)) {
    results[cat] = [];
    for (const [key, val] of Object.entries(cp[cat] ?? {})) {
      if (!val) continue;
      const [source, target] = key.split("-");
      results[cat].push({ source, target, usd: val.usd, period: val.period });
    }
  }
  await writeFile(RESULTS_PATH, JSON.stringify(results, null, 2));
}

/** Sums the true aggregate row per HS chapter (C00 regime preferred, else max). */
function extractCategoryTotal(rows) {
  if (!rows || rows.length === 0) return null;
  const byChapter = new Map();
  for (const r of rows) {
    const list = byChapter.get(r.cmdCode) ?? [];
    list.push(r);
    byChapter.set(r.cmdCode, list);
  }
  let usd = 0;
  let period = null;
  for (const chapterRows of byChapter.values()) {
    const c00 = chapterRows.find((r) => r.customsCode === "C00");
    const row =
      c00 ??
      chapterRows.reduce((max, r) => (r.primaryValue > max.primaryValue ? r : max), chapterRows[0]);
    if (row?.primaryValue) {
      usd += row.primaryValue;
      period = String(row.refYear ?? row.period);
    }
  }
  return usd > 0 ? { usd, period } : null;
}

async function fetchOnce(reporterM49, partnerM49, flowCode, cmdCode) {
  const url = `https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=${reporterM49}&partnerCode=${partnerM49}&period=2023&cmdCode=${cmdCode}&flowCode=${flowCode}&motCode=0&partner2Code=0`;
  try {
    const res = await fetch(url);
    if (res.status === 429) return { status: "RATE_LIMITED" };
    if (res.status === 403) return { status: "QUOTA_EXCEEDED" };
    if (!res.ok) return { status: "ERROR" };
    const json = await res.json();
    const total = extractCategoryTotal(json?.data);
    if (!total) return { status: "NO_DATA" };
    return { status: "OK", ...total };
  } catch {
    return { status: "ERROR" };
  }
}

/** Retries 429/403/network errors indefinitely with backoff; null only on confirmed empty. */
async function fetchWithRetry(reporterM49, partnerM49, flowCode, cmdCode, label) {
  let rateLimitBackoff = 2000;
  let quotaBackoff = 60000;
  let errorBackoff = 3000;
  for (;;) {
    const r = await fetchOnce(reporterM49, partnerM49, flowCode, cmdCode);
    if (r.status === "OK") return { period: r.period, usd: r.usd };
    if (r.status === "NO_DATA") return null;
    if (r.status === "RATE_LIMITED") {
      console.log(`  [${label}] rate limited, backing off ${rateLimitBackoff}ms`);
      await sleep(rateLimitBackoff);
      rateLimitBackoff = Math.min(rateLimitBackoff * 1.6, 30000);
      continue;
    }
    if (r.status === "QUOTA_EXCEEDED") {
      console.log(`  [${label}] quota exceeded, waiting ${Math.round(quotaBackoff / 1000)}s`);
      await sleep(quotaBackoff);
      quotaBackoff = Math.min(quotaBackoff * 1.5, 600000);
      continue;
    }
    console.log(`  [${label}] transient error, retrying in ${errorBackoff}ms`);
    await sleep(errorBackoff);
    errorBackoff = Math.min(errorBackoff * 1.4, 20000);
  }
}

/** Importer's mirror report preferred, exporter self-report fallback. */
async function fetchTradeFlow(exp, imp, cmdCode, label) {
  const mirror = await fetchWithRetry(imp.m49, exp.m49, "M", cmdCode, `${label} mirror`);
  if (mirror) return mirror;
  return fetchWithRetry(exp.m49, imp.m49, "X", cmdCode, `${label} self`);
}

async function main() {
  const cp = await loadCheckpoint();
  for (const cat of Object.keys(CATEGORIES)) cp[cat] ??= {};

  const jobs = [];
  for (const [cat, { cmdCode, exporters }] of Object.entries(CATEGORIES)) {
    for (const expId of exporters) {
      const exp = countries.find((c) => c.id === expId);
      for (const imp of countries) {
        if (imp.id === expId) continue;
        jobs.push({ cat, cmdCode, exp, imp });
      }
    }
  }

  let processed = Object.values(cp).reduce((n, m) => n + Object.keys(m).length, 0);
  console.log(`Resuming: ${processed}/${jobs.length} pairs already checkpointed`);

  let sinceCheckpoint = 0;
  for (const { cat, cmdCode, exp, imp } of jobs) {
    const key = `${exp.id}-${imp.id}`;
    if (cp[cat][key] !== undefined) continue;

    if (EXCLUDED.has(exp.id) || EXCLUDED.has(imp.id)) {
      cp[cat][key] = null; // structurally unavailable in free tier, don't burn quota
      processed++;
      continue;
    }

    const result = await fetchTradeFlow(exp, imp, cmdCode, `${cat} ${key}`);
    cp[cat][key] = result;
    processed++;
    sinceCheckpoint++;
    if (sinceCheckpoint >= 5) {
      await saveCheckpointAndResults(cp);
      sinceCheckpoint = 0;
      console.log(`Progress: ${processed}/${jobs.length}`);
    }
    await sleep(BASE_DELAY_MS);
  }

  await saveCheckpointAndResults(cp);
  const counts = {};
  for (const cat of Object.keys(CATEGORIES)) {
    counts[cat] = Object.values(cp[cat]).filter(Boolean).length;
  }
  console.log("ALL DONE:", counts, `(${processed}/${jobs.length} pairs)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
