import type { Flow, LayerDef } from "@/types/flow";
import realFlowsData from "@/data/realFlows.generated.json";

const realFlows = realFlowsData as Flow[];

export const layers: LayerDef[] = [
  { id: "bond", label: "Bond Ownership", assetClass: "bond", available: true },
  { id: "equity", label: "Stock Ownership", assetClass: "equity", available: true },
  { id: "trade", label: "Trade Flows", assetClass: "trade", available: true },
  { id: "commodity", label: "Fossil Fuels", assetClass: "commodity", available: true },
  { id: "ores", label: "Ores & Metals", assetClass: "ores", available: true },
  { id: "agri", label: "Agriculture", assetClass: "agri", available: true },
  { id: "gold", label: "Gold & Precious", assetClass: "gold", available: true },
  { id: "fdi", label: "FDI", assetClass: "fdi", available: true },
  { id: "banking", label: "Banking Flows", assetClass: "banking", available: true },
  { id: "currency", label: "Currency Flows", assetClass: "currency", available: true },
  { id: "global-liquidity", label: "Global Liquidity", assetClass: null, available: false },
  { id: "swf", label: "Sovereign Wealth Funds", assetClass: null, available: false },
  { id: "reserves", label: "Central Bank Reserves", assetClass: null, available: false },
  { id: "private-credit", label: "Private Credit", assetClass: null, available: false },
  { id: "global-debt", label: "Global Debt", assetClass: null, available: false },
  { id: "etf", label: "ETF Flows", assetClass: null, available: false },
];

// FDI and Currency have no clean free bilateral dataset (UNCTAD's bilateral FDI stats are
// report/Excel-distributed rather than API-accessible, and "petrodollar recycling" isn't a
// single published series) - these stay hand-authored/illustrative until a real source is wired up.
const mockFlows: Flow[] = [
  // --- FDI: China's Belt & Road, and traditional FDI corridors ---
  { id: "fdi-cn-ng", source: "CN", target: "NG", assetClass: "fdi", magnitude: 30, note: "Belt & Road infrastructure investment", dataSource: "mock" },
  { id: "fdi-cn-ke", source: "CN", target: "KE", assetClass: "fdi", magnitude: 22, note: "Belt & Road infrastructure investment", dataSource: "mock" },
  { id: "fdi-cn-id", source: "CN", target: "ID", assetClass: "fdi", magnitude: 28, note: "Belt & Road infrastructure and nickel-processing investment", dataSource: "mock" },
  { id: "fdi-cn-za", source: "CN", target: "ZA", assetClass: "fdi", magnitude: 18, note: "Chinese FDI into South African mining and infrastructure", dataSource: "mock" },
  { id: "fdi-us-in", source: "US", target: "IN", assetClass: "fdi", magnitude: 45, note: "US greenfield and acquisition FDI into India", dataSource: "mock" },
  { id: "fdi-nl-us", source: "NL", target: "US", assetClass: "fdi", magnitude: 60, note: "Netherlands is a major FDI conduit into the US", dataSource: "mock" },

  // --- Currency: petrodollar recycling ---
  { id: "curr-sa-us", source: "SA", target: "US", assetClass: "currency", magnitude: 140, note: "Petrodollar recycling into US dollar assets", dataSource: "mock" },
  { id: "curr-ae-us", source: "AE", target: "US", assetClass: "currency", magnitude: 80, note: "UAE sovereign surplus recycled into USD assets", dataSource: "mock" },
  { id: "curr-qa-gb", source: "QA", target: "GB", assetClass: "currency", magnitude: 50, note: "Qatari surplus recycled into GBP/London assets", dataSource: "mock" },
  { id: "curr-ru-cn", source: "RU", target: "CN", assetClass: "currency", magnitude: 40, note: "Russia shifting reserves toward the yuan post-sanctions", dataSource: "mock" },
];

// Bonds, equities, banking, trade, and commodities are real bilateral figures pulled from
// IMF CPIS, BIS locational banking statistics, and UN Comtrade across all 25 tracked
// countries (see scripts/fetch-real-data.mjs + scripts/build-flows.mjs).
export const flows: Flow[] = [...realFlows, ...mockFlows];

/** Order-independent key for a country pair: A→B and B→A map to the same key. */
export function pairKeyOf(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

/** All flows between two countries (either direction), largest first. */
export function flowsBetween(a: string, b: string): Flow[] {
  return flows
    .filter(
      (f) =>
        (f.source === a && f.target === b) || (f.source === b && f.target === a)
    )
    .sort((x, y) => y.magnitude - x.magnitude);
}
