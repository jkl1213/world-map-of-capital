// Fetches bond/equity (IMF CPIS), banking (BIS LBS) and trade (IMF DOT) data for the
// 2026-07 country expansion (25 -> 53 countries), via DBnomics. Only pairs involving at
// least one NEW country are fetched - the original 600 pairs already live in
// output/real-flows.json and are not touched.
//
// Reporter-side skips (verified structural gaps, not worth the requests):
//   - CPIS: AE, QA, VN, NG, KE never report outbound holdings
//   - BIS LBS: only reporting jurisdictions have outbound claims
//
// Resumable: checkpoints to output/expansion-checkpoint.json, results written to
// output/expansion-flows.json on every save so build-flows.mjs can merge partial data.
//
// Run with: node scripts/fetch-expansion.mjs

import { readFile, writeFile } from "node:fs/promises";

const ORIGINAL = [
  "US", "CN", "JP", "DE", "GB", "FR", "CA", "IN", "BR", "SA", "AE", "RU",
  "KR", "SG", "CH", "NL", "MX", "ID", "VN", "NG", "ZA", "AU", "QA", "NO", "KE",
];
const NEW = [
  "IT", "ES", "SE", "BE", "IE", "AT", "LU", "DK", "FI", "GR", "HK", "PH", "CL",
  "TR", "PL", "PT", "CZ", "HU", "TH", "MY", "AR", "CO", "EG", "IL", "PK", "NZ", "KW", "KZ",
];
const ALL = [...ORIGINAL, ...NEW];

// countries that never report to CPIS (no outbound bond/equity series)
const CPIS_NON_REPORTERS = new Set(["AE", "QA", "VN", "NG", "KE"]);
// BIS LBS reporting jurisdictions among our 53 (others have no outbound banking series)
const BIS_REPORTERS = new Set([
  "US", "JP", "DE", "GB", "FR", "CA", "KR", "SG", "CH", "NL", "MX", "ZA", "AU",
  "IT", "ES", "SE", "BE", "IE", "AT", "LU", "DK", "FI", "GR", "HK", "PH", "CL",
]);

const CHECKPOINT_PATH = new URL("./output/expansion-checkpoint.json", import.meta.url);
const RESULTS_PATH = new URL("./output/expansion-flows.json", import.meta.url);
const CONCURRENCY = 8;

async function fetchJsonWithRetry(url, { timeoutMs = 15000, retries = 3 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (res.status === 404) return { notFound: true };
      if (!res.ok) {
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
          continue;
        }
        return null;
      }
      return await res.json();
    } catch {
      clearTimeout(timer);
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
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

// value multipliers: CPIS series are in raw USD, BIS and DOT in millions
const FETCHERS = {
  bond: async (rep, cp) => {
    const j = await fetchJsonWithRetry(
      `https://api.db.nomics.world/v22/series/IMF/CPIS/B.${rep}.I_A_D_T_T_BP6_USD.T.T.${cp}?observations=1&format=json`
    );
    if (j === null) return { transient: true };
    const obs = lastObservation(j);
    return obs ? { period: obs.period, usd: obs.value } : null;
  },
  equity: async (rep, cp) => {
    const j = await fetchJsonWithRetry(
      `https://api.db.nomics.world/v22/series/IMF/CPIS/B.${rep}.I_A_E_T_T_BP6_USD.T.T.${cp}?observations=1&format=json`
    );
    if (j === null) return { transient: true };
    const obs = lastObservation(j);
    return obs ? { period: obs.period, usd: obs.value } : null;
  },
  banking: async (rep, cp) => {
    const j = await fetchJsonWithRetry(
      `https://api.db.nomics.world/v22/series/BIS/WS_LBS_D_PUB/Q.S.C.A.TO1.A.5J.A.${rep}.A.${cp}.N?observations=1&format=json`
    );
    if (j === null) return { transient: true };
    const obs = lastObservation(j);
    return obs ? { period: obs.period, usd: obs.value * 1e6 } : null;
  },
  trade: async (rep, cp) => {
    const j = await fetchJsonWithRetry(
      `https://api.db.nomics.world/v22/series/IMF/DOT/A.${rep}.TXG_FOB_USD.${cp}?observations=1&format=json`
    );
    if (j === null) return { transient: true };
    const obs = lastObservation(j);
    return obs ? { period: obs.period, usd: obs.value * 1e6 } : null;
  },
};

function reporterSkipped(cls, rep) {
  if ((cls === "bond" || cls === "equity") && CPIS_NON_REPORTERS.has(rep)) return true;
  if (cls === "banking" && !BIS_REPORTERS.has(rep)) return true;
  return false;
}

async function loadCheckpoint() {
  try {
    return JSON.parse(await readFile(CHECKPOINT_PATH, "utf8"));
  } catch {
    return { bond: {}, equity: {}, banking: {}, trade: {} };
  }
}

async function saveCheckpointAndResults(cp) {
  await writeFile(CHECKPOINT_PATH, JSON.stringify(cp));
  const results = {};
  for (const cls of Object.keys(FETCHERS)) {
    results[cls] = [];
    for (const [key, val] of Object.entries(cp[cls] ?? {})) {
      if (!val) continue;
      const [source, target] = key.split("-");
      results[cls].push({ source, target, usd: val.usd, period: val.period });
    }
  }
  await writeFile(RESULTS_PATH, JSON.stringify(results, null, 2));
}

async function main() {
  const cp = await loadCheckpoint();
  for (const cls of Object.keys(FETCHERS)) cp[cls] ??= {};

  const newSet = new Set(NEW);
  const jobs = [];
  for (const cls of Object.keys(FETCHERS)) {
    for (const a of ALL) {
      for (const b of ALL) {
        if (a === b) continue;
        if (!newSet.has(a) && !newSet.has(b)) continue; // original pairs already fetched
        const key = `${a}-${b}`;
        if (cp[cls][key] !== undefined) continue;
        if (reporterSkipped(cls, a)) {
          cp[cls][key] = null;
          continue;
        }
        jobs.push({ cls, a, b, key });
      }
    }
  }

  console.log(`Jobs to fetch: ${jobs.length}`);
  let done = 0;
  let sinceSave = 0;
  let cursor = 0;

  async function worker() {
    for (;;) {
      const i = cursor++;
      if (i >= jobs.length) return;
      const { cls, a, b, key } = jobs[i];
      const r = await FETCHERS[cls](a, b);
      if (r && r.transient) {
        // persistent failure after retries - leave unkeyed so a re-run retries it
        console.log(`  TRANSIENT ${cls} ${key} (re-run to retry)`);
      } else {
        cp[cls][key] = r;
      }
      done++;
      sinceSave++;
      if (sinceSave >= 200) {
        sinceSave = 0;
        await saveCheckpointAndResults(cp);
        console.log(`Progress: ${done}/${jobs.length}`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  await saveCheckpointAndResults(cp);

  const counts = {};
  for (const cls of Object.keys(FETCHERS)) {
    counts[cls] = Object.values(cp[cls]).filter(Boolean).length;
  }
  console.log("DONE:", counts);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
