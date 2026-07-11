// Merges corrected trade + commodity data into output/real-flows.json, replacing the old
// (buggy) arrays entirely. Bond/equity/banking are left untouched.
//
// Trade comes from output/dot-trade.json (IMF Direction of Trade Statistics via DBnomics -
// covers all 25 countries; UN Comtrade's free tier turned out to structurally exclude the
// US, France, India, Switzerland and Norway). Commodity (HS27 mineral fuels, which DOT
// doesn't break out) comes from output/trade-checkpoint.json's corrected Comtrade fetch.
//
// Run with: node scripts/finalize-trade.mjs

import { readFile, writeFile } from "node:fs/promises";

function toArray(byKey) {
  const out = [];
  for (const [key, val] of Object.entries(byKey)) {
    if (!val) continue; // confirmed no-data
    const [source, target] = key.split("-");
    out.push({ source, target, period: val.period, usd: val.usd });
  }
  return out;
}

async function main() {
  const dotPath = new URL("./output/dot-trade.json", import.meta.url);
  const checkpointPath = new URL("./output/trade-checkpoint.json", import.meta.url);
  const realFlowsPath = new URL("./output/real-flows.json", import.meta.url);

  const tradeArray = JSON.parse(await readFile(dotPath, "utf8"));
  const checkpoint = JSON.parse(await readFile(checkpointPath, "utf8"));
  const existing = JSON.parse(await readFile(realFlowsPath, "utf8"));

  const commodityArray = toArray(checkpoint.commodity);

  console.log(`Trade (IMF DOT): ${tradeArray.length} resolved pairs`);
  console.log(`Commodity (Comtrade, corrected): ${commodityArray.length} resolved pairs (of ${Object.keys(checkpoint.commodity).length} attempted)`);

  existing.trade = tradeArray;
  existing.commodity = commodityArray;
  existing.fetchedAt = new Date().toISOString();

  await writeFile(realFlowsPath, JSON.stringify(existing, null, 2));
  console.log(`Written to ${realFlowsPath.pathname}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
