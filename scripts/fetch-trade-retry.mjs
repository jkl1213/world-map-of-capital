// Retries ONLY the trade + commodity portions (bond/equity/banking already succeeded),
// paced slowly and single-attempt (no mirror fallback) to avoid re-tripping UN Comtrade's
// free anonymous rate limit. Merges results into the existing scripts/output/real-flows.json.
//
// Run with: node scripts/fetch-trade-retry.mjs

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

const COMMODITY_EXPORTERS = ["SA", "AE", "RU", "NO", "QA", "AU"];
const DELAY_MS = 550;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchComtrade(reporterM49, partnerM49, flowCode, cmdCode) {
  const url = `https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=${reporterM49}&partnerCode=${partnerM49}&period=2023&cmdCode=${cmdCode}&flowCode=${flowCode}`;
  try {
    const res = await fetch(url);
    if (res.status === 403) return "QUOTA_EXCEEDED";
    if (!res.ok) return null;
    const json = await res.json();
    const rec = json?.data?.[0];
    if (!rec || !rec.primaryValue) return null;
    return { period: String(rec.refYear ?? rec.period), usd: rec.primaryValue };
  } catch {
    return null;
  }
}

async function main() {
  const outPath = new URL("./output/real-flows.json", import.meta.url);
  const existing = JSON.parse(await readFile(outPath, "utf8"));

  const orderedPairs = [];
  for (const a of countries) {
    for (const b of countries) {
      if (a.id !== b.id) orderedPairs.push([a, b]);
    }
  }
  const commodityPairs = [];
  for (const expId of COMMODITY_EXPORTERS) {
    const exp = countries.find((c) => c.id === expId);
    for (const c of countries) {
      if (c.id !== expId) commodityPairs.push([exp, c]);
    }
  }

  const tradeResults = [];
  let quotaHit = false;

  console.log(`Retrying trade: ${orderedPairs.length} pairs, paced at ${DELAY_MS}ms`);
  for (let i = 0; i < orderedPairs.length; i++) {
    if (quotaHit) break;
    const [a, b] = orderedPairs[i];
    // importer's mirror report only (single attempt, no fallback, to conserve quota)
    const r = await fetchComtrade(b.m49, a.m49, "M", "TOTAL");
    if (r === "QUOTA_EXCEEDED") {
      console.log(`Quota hit again at trade pair ${i}/${orderedPairs.length}`);
      quotaHit = true;
      break;
    }
    if (r) tradeResults.push({ source: a.id, target: b.id, ...r });
    if (i % 50 === 0) console.log(`  trade: ${i}/${orderedPairs.length} (${tradeResults.length} hits)`);
    await sleep(DELAY_MS);
  }

  const commodityResults = [];
  if (!quotaHit) {
    console.log(`Retrying commodity: ${commodityPairs.length} pairs`);
    for (let i = 0; i < commodityPairs.length; i++) {
      if (quotaHit) break;
      const [a, b] = commodityPairs[i];
      const r = await fetchComtrade(b.m49, a.m49, "M", "27");
      if (r === "QUOTA_EXCEEDED") {
        console.log(`Quota hit again at commodity pair ${i}/${commodityPairs.length}`);
        quotaHit = true;
        break;
      }
      if (r) commodityResults.push({ source: a.id, target: b.id, ...r });
      if (i % 30 === 0) console.log(`  commodity: ${i}/${commodityPairs.length} (${commodityResults.length} hits)`);
      await sleep(DELAY_MS);
    }
  }

  // merge: prefer new results, keep any old ones not re-covered (e.g. if we stopped early)
  const mergedTrade = [...tradeResults];
  const seenTrade = new Set(tradeResults.map((r) => `${r.source}-${r.target}`));
  for (const old of existing.trade ?? []) {
    if (!seenTrade.has(`${old.source}-${old.target}`)) mergedTrade.push(old);
  }

  const mergedCommodity = [...commodityResults];
  const seenCommodity = new Set(commodityResults.map((r) => `${r.source}-${r.target}`));
  for (const old of existing.commodity ?? []) {
    if (!seenCommodity.has(`${old.source}-${old.target}`)) mergedCommodity.push(old);
  }

  existing.trade = mergedTrade;
  existing.commodity = mergedCommodity;
  existing.fetchedAt = new Date().toISOString();

  await writeFile(outPath, JSON.stringify(existing, null, 2));
  console.log(`\nDone. trade=${mergedTrade.length} commodity=${mergedCommodity.length}. quotaHit=${quotaHit}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
