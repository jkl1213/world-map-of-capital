import type { AssetClass } from "@/types/flow";

export const assetClassColor: Record<AssetClass, string> = {
  equity: "#34d399", // green
  bond: "#60a5fa", // blue
  banking: "#c084fc", // purple
  trade: "#fb923c", // orange
  currency: "#facc15", // yellow
  fdi: "#2dd4bf", // teal
  commodity: "#f87171", // red (not in original 6-class legend, needed for oil/metals flows)
};

export const assetClassLabel: Record<AssetClass, string> = {
  equity: "Equities",
  bond: "Bonds",
  banking: "Bank Lending",
  trade: "Trade",
  currency: "Currencies",
  fdi: "FDI",
  commodity: "Commodities",
};
