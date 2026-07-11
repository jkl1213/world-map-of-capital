// Corrected, resumable UN Comtrade trade + commodity fetcher.
//
// Bug this replaces: the original fetcher took `data[0]` from Comtrade's TOTAL query,
// assuming a single row. In reality Comtrade returns the total split across many rows
// (by transport mode, sub-partner, customs procedure) - sometimes 500+ rows - and data[0]
// is often an arbitrary tiny fragment. Verified undercounts of 600x-8000x on real pairs.
//
// Fix: pass motCode=0&partner2Code=0 as server-side query filters so Comtrade itself
// returns only the already-aggregated rows (usually 1-4, one per customsCode regime)
// instead of every disaggregated combination. This also sidesteps a second failure mode:
// client-side filtering over an unfiltered response silently truncates at ~500 rows for
// reporters that split trade into many partner2Code (country-of-origin) buckets and never
// publish a partner2Code=0 rollup row at all (verified on Germany) - the true aggregate
// exists on the server but was getting cut off before it appeared in the page. The true
// total among the filtered rows is the one with customsCode='C00' (general trade system).
//
// Resumable: progress is checkpointed to output/trade-checkpoint.json after every few
// requests, keyed by pair, so if the free API's rate limit/quota kills a run partway,
// re-running this script picks up only the pairs still marked "pending" instead of
// re-fetching everything. Retries 429s and 403s indefinitely with backoff rather than
// giving up - intended to be run (and re-run) until every pair is resolved.
//
// Run with: node scripts/fetch-trade-corrected.mjs

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
const BASE_DELAY_MS = 800;
const CHECKPOINT_PATH = new URL("./output/trade-checkpoint.json", import.meta.url);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function loadCheckpoint() {
  try {
    return JSON.parse(await readFile(CHECKPOINT_PATH, "utf8"));
  } catch {
    return { trade: {}, commodity: {} };
  }
}

async function saveCheckpoint(cp) {
  await writeFile(CHECKPOINT_PATH, JSON.stringify(cp, null, 2));
}

/** Picks the true grand-total row out of the (server-filtered, already small) response set. */
function extractTotal(rows) {
  if (!rows || rows.length === 0) return null;
  const c00 = rows.find((r) => r.customsCode === "C00");
  if (c00) return c00;
  return rows.reduce((max, r) => (r.primaryValue > max.primaryValue ? r : max), rows[0]);
}

async function fetchOnce(reporterM49, partnerM49, flowCode, cmdCode) {
  const url = `https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=${reporterM49}&partnerCode=${partnerM49}&period=2023&cmdCode=${cmdCode}&flowCode=${flowCode}&motCode=0&partner2Code=0`;
  try {
    const res = await fetch(url);
    if (res.status === 429) return { status: "RATE_LIMITED" };
    if (res.status === 403) return { status: "QUOTA_EXCEEDED" };
    if (!res.ok) return { status: "ERROR" };
    const json = await res.json();
    const rows = json?.data;
    if (!rows || rows.length === 0) return { status: "NO_DATA" };
    const row = extractTotal(rows);
    if (!row || !row.primaryValue) return { status: "NO_DATA" };
    return { status: "OK", period: String(row.refYear ?? row.period), usd: row.primaryValue };
  } catch {
    return { status: "ERROR" };
  }
}

/** Retries 429/403/network errors indefinitely with backoff. Returns null only on a
 * confirmed empty result (count=0), never gives up on transient failures. */
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

/** importer's mirror report preferred (more reliable), falls back to exporter self-report. */
async function fetchTradeFlow(a, b, cmdCode, label) {
  const mirror = await fetchWithRetry(b.m49, a.m49, "M", cmdCode, `${label} mirror`);
  if (mirror) return mirror;
  const self = await fetchWithRetry(a.m49, b.m49, "X", cmdCode, `${label} self`);
  return self;
}

async function main() {
  const cp = await loadCheckpoint();
  cp.trade ??= {};
  cp.commodity ??= {};

  const tradePairs = [];
  for (const a of countries) for (const b of countries) if (a.id !== b.id) tradePairs.push([a, b]);

  const commodityPairs = [];
  for (const expId of COMMODITY_EXPORTERS) {
    const exp = countries.find((c) => c.id === expId);
    for (const c of countries) if (c.id !== expId) commodityPairs.push([exp, c]);
  }

  const totalCount = tradePairs.length + commodityPairs.length;
  let processed = Object.keys(cp.trade).length + Object.keys(cp.commodity).length;
  console.log(`Resuming: ${processed}/${totalCount} pairs already checkpointed`);

  let sinceCheckpoint = 0;

  for (const [a, b] of tradePairs) {
    const key = `${a.id}-${b.id}`;
    if (cp.trade[key] !== undefined) continue;
    const result = await fetchTradeFlow(a, b, "TOTAL", `trade ${key}`);
    cp.trade[key] = result;
    processed++;
    sinceCheckpoint++;
    if (sinceCheckpoint >= 5) {
      await saveCheckpoint(cp);
      sinceCheckpoint = 0;
      console.log(`Progress: ${processed}/${totalCount}`);
    }
    await sleep(BASE_DELAY_MS);
  }

  for (const [a, b] of commodityPairs) {
    const key = `${a.id}-${b.id}`;
    if (cp.commodity[key] !== undefined) continue;
    const result = await fetchTradeFlow(a, b, "27", `commodity ${key}`);
    cp.commodity[key] = result;
    processed++;
    sinceCheckpoint++;
    if (sinceCheckpoint >= 5) {
      await saveCheckpoint(cp);
      sinceCheckpoint = 0;
      console.log(`Progress: ${processed}/${totalCount}`);
    }
    await sleep(BASE_DELAY_MS);
  }

  await saveCheckpoint(cp);
  console.log(`ALL DONE: ${processed}/${totalCount}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
