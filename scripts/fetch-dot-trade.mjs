// Fetches total merchandise trade (goods exports, FOB) for all 600 directed pairs among
// the 25 tracked countries from IMF Direction of Trade Statistics (DOT) via DBnomics.
//
// Replaces UN Comtrade as the "trade" asset class source: Comtrade's free preview tier
// turned out to structurally exclude the US, France, India, Switzerland and Norway
// entirely (verified: zero records as reporter OR partner, for any pair, even after
// exhausting retries - not a rate-limit issue, a tier-gating one). DOT is a single-value
// time series per pair (same shape as the CPIS/BIS fetchers already used here) so it
// doesn't have Comtrade's disaggregated-rows extraction hazard either.
//
// Commodity (HS27 mineral fuel exports) still comes from Comtrade separately, since DOT
// has no product-level breakdown.
//
// Run with: node scripts/fetch-dot-trade.mjs

import { writeFile } from "node:fs/promises";

const countries = [
  "US", "CN", "JP", "DE", "GB", "FR", "CA", "IN", "BR", "SA", "AE", "RU",
  "KR", "SG", "CH", "NL", "MX", "ID", "VN", "NG", "ZA", "AU", "QA", "NO", "KE",
];

async function fetchJsonWithRetry(url, { timeoutMs = 15000, retries = 2 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) {
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, 1000));
          continue;
        }
        return null;
      }
      return await res.json();
    } catch {
      clearTimeout(timer);
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 800));
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
  for (let i = doc.value.length - 1; i >= 0; i--) {
    if (doc.value[i] !== null && doc.value[i] !== undefined) {
      return { period: doc.period[i], value: doc.value[i] };
    }
  }
  return null;
}

async function fetchDot(reporter, counterpart) {
  const seriesCode = `A.${reporter}.TXG_FOB_USD.${counterpart}`;
  const url = `https://api.db.nomics.world/v22/series/IMF/DOT/${seriesCode}?observations=1&format=json`;
  const json = await fetchJsonWithRetry(url);
  const obs = lastObservation(json);
  if (!obs) return null;
  return { period: obs.period, usd: obs.value * 1e6 }; // DOT values are in millions USD
}

async function runPool(tasks, concurrency, onProgress) {
  const results = new Array(tasks.length);
  let cursor = 0;
  let completed = 0;
  async function worker() {
    for (;;) {
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

async function main() {
  const pairs = [];
  for (const a of countries) for (const b of countries) if (a !== b) pairs.push([a, b]);

  console.log(`Fetching DOT exports for ${pairs.length} pairs...`);
  const tasks = pairs.map(([a, b]) => async () => {
    const r = await fetchDot(a, b);
    return r ? { source: a, target: b, ...r } : null;
  });
  const results = await runPool(tasks, 8, (c, t) => console.log(`  ${c}/${t}`));

  const resolved = results.filter(Boolean);
  console.log(`Resolved: ${resolved.length}/${pairs.length}`);

  const outPath = new URL("./output/dot-trade.json", import.meta.url);
  await writeFile(outPath, JSON.stringify(resolved, null, 2));
  console.log(`Written to ${outPath.pathname}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
