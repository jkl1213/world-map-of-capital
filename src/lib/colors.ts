import type { AssetClass } from "@/types/flow";

export const assetClassColor: Record<AssetClass, string> = {
  equity: "#34d399", // green
  bond: "#60a5fa", // blue
  banking: "#c084fc", // purple
  trade: "#fb923c", // orange
  currency: "#facc15", // yellow
  fdi: "#2dd4bf", // teal
  commodity: "#f87171", // red - mineral fuels (HS 27)
  ores: "#9ca3af", // stone gray - metal ores (HS 26)
  agri: "#a3e635", // lime - grains, oilseeds, palm oil (HS 10+12+15)
  gold: "#f59e0b", // deep gold - precious metals & stones (HS 71)
};

export const assetClassLabel: Record<AssetClass, string> = {
  equity: "Equities",
  bond: "Bonds",
  banking: "Bank Lending",
  trade: "Trade",
  currency: "Currencies",
  fdi: "FDI",
  commodity: "Fossil Fuels",
  ores: "Ores & Metals",
  agri: "Agriculture",
  gold: "Gold & Precious",
};
