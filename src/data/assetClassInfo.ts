import type { AssetClass } from "@/types/flow";

// Plain-English definition + data source for each asset class, shown as a hover
// popup wherever the term appears (legend, layer panel, country panel).
export interface AssetClassInfo {
  definition: string;
  source: string;
}

export const assetClassInfo: Record<AssetClass, AssetClassInfo> = {
  bond: {
    definition:
      "Foreign ownership of debt securities. \"A → B\" means investors based in A hold B's government and corporate bonds. Values are outstanding holdings (stocks), not annual flows.",
    source: "IMF Coordinated Portfolio Investment Survey (CPIS), mostly mid-2024",
  },
  equity: {
    definition:
      "Foreign ownership of shares. \"A → B\" means investors based in A hold B's stocks and investment-fund units. Values are outstanding holdings, not annual flows.",
    source: "IMF Coordinated Portfolio Investment Survey (CPIS), mostly mid-2024",
  },
  banking: {
    definition:
      "Cross-border bank lending. \"A → B\" means banks headquartered in A hold claims - loans, deposits placed abroad, debt holdings - on borrowers in B. A is the lender, B is the borrower; it's bank-to-country credit, not individuals depositing money abroad.",
    source: "BIS Locational Banking Statistics, Q4 2024",
  },
  trade: {
    definition:
      "Merchandise exports, free on board (FOB). \"A → B\" means A shipped goods worth this much to B over the year - the goods side of the trade relationship.",
    source: "IMF Direction of Trade Statistics (DOT), mostly 2024",
  },
  commodity: {
    definition:
      "Mineral-fuel exports (crude oil, gas, coal - HS code 27). \"A → B\" means A exported this much fuel to B - the largest single commodity slice of world goods trade.",
    source: "UN Comtrade, 2023",
  },
  ores: {
    definition:
      "Metal-ore exports (iron ore, copper, nickel, lithium - HS code 26). \"A → B\" means A shipped this much raw ore to B - the feedstock of steelmaking and the energy transition.",
    source: "UN Comtrade, 2023",
  },
  agri: {
    definition:
      "Agricultural staples: cereals, oilseeds and vegetable oils (HS codes 10, 12, 15 - wheat, corn, soybeans, palm oil). \"A → B\" means A exported this much food and feed to B.",
    source: "UN Comtrade, 2023",
  },
  gold: {
    definition:
      "Precious metals and stones (HS code 71 - mostly gold bullion, plus silver, platinum, diamonds). \"A → B\" means A shipped this much to B - gold moves between trading hubs as a reserve and haven asset.",
    source: "UN Comtrade, 2023",
  },
  fdi: {
    definition:
      "Foreign direct investment. \"A → B\" means companies from A built or bought controlling stakes in businesses in B - factories, subsidiaries, acquisitions.",
    source: "Illustrative estimates - no free bilateral FDI dataset is API-accessible",
  },
  currency: {
    definition:
      "Official currency and reserve flows. \"A → B\" means A's surplus currency (e.g. oil export earnings) was recycled into B's assets, such as US dollar bonds and equities.",
    source: "Illustrative estimates - not a single published statistical series",
  },
};
