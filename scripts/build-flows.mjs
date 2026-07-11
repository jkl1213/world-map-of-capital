// Transforms scripts/output/real-flows.json into src/data/realFlows.generated.json
// in the app's Flow[] shape, applying a small materiality floor per asset class to
// drop near-zero/reporting-artifact values (not a top-N cut - keeps all real pairs
// above the floor).
//
// Run with: node scripts/build-flows.mjs

import { readFile, writeFile } from "node:fs/promises";

const countryNames = {
  US: "the United States", CN: "China", JP: "Japan", DE: "Germany", GB: "the United Kingdom",
  FR: "France", CA: "Canada", IN: "India", BR: "Brazil", SA: "Saudi Arabia",
  AE: "the United Arab Emirates", RU: "Russia", KR: "South Korea", SG: "Singapore",
  CH: "Switzerland", NL: "the Netherlands", MX: "Mexico", ID: "Indonesia", VN: "Vietnam",
  NG: "Nigeria", ZA: "South Africa", AU: "Australia", QA: "Qatar", NO: "Norway", KE: "Kenya",
};

const FLOORS_USD = {
  bond: 0.1e9,
  equity: 0.1e9,
  banking: 0.1e9,
  trade: 0.05e9,
  commodity: 0.05e9,
};

const NOTE_BUILDERS = {
  bond: (s, t, mag, period) =>
    `IMF CPIS: ${countryNames[s]} holds $${mag}bn of ${countryNames[t]} debt securities (${period})`,
  equity: (s, t, mag, period) =>
    `IMF CPIS: ${countryNames[s]} holds $${mag}bn of ${countryNames[t]} equities (${period})`,
  banking: (s, t, mag, period) =>
    `BIS: ${countryNames[s]} banks' cross-border claims on ${countryNames[t]} (${period})`,
  trade: (s, t, mag, period) =>
    `IMF DOT: ${countryNames[s]} goods exports to ${countryNames[t]}, FOB (${period})`,
  commodity: (s, t, mag, period) =>
    `UN Comtrade: ${countryNames[s]} mineral fuel exports to ${countryNames[t]} (HS 27, ${period})`,
};

function isFiniteNumber(v) {
  return typeof v === "number" && Number.isFinite(v);
}

async function main() {
  const raw = JSON.parse(
    await readFile(new URL("./output/real-flows.json", import.meta.url), "utf8")
  );

  const flows = [];
  for (const assetClass of ["bond", "equity", "banking", "trade", "commodity"]) {
    const floor = FLOORS_USD[assetClass];
    for (const rec of raw[assetClass] ?? []) {
      if (!isFiniteNumber(rec.usd) || rec.usd < floor) continue;
      const magnitude = Math.round((rec.usd / 1e8)) / 10; // 1 decimal, billions
      if (magnitude <= 0) continue;
      flows.push({
        id: `${assetClass}-${rec.source.toLowerCase()}-${rec.target.toLowerCase()}`,
        source: rec.source,
        target: rec.target,
        assetClass,
        magnitude,
        note: NOTE_BUILDERS[assetClass](rec.source, rec.target, magnitude, rec.period),
        dataSource: "real",
      });
    }
  }

  flows.sort((a, b) => b.magnitude - a.magnitude);

  const outPath = new URL("../src/data/realFlows.generated.json", import.meta.url);
  await writeFile(outPath, JSON.stringify(flows, null, 2));

  const counts = {};
  for (const f of flows) counts[f.assetClass] = (counts[f.assetClass] ?? 0) + 1;
  console.log("Flow counts:", counts, "total:", flows.length);
  console.log("Written to", outPath.pathname);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
