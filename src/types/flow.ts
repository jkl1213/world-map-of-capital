export type AssetClass =
  | "trade"
  | "equity"
  | "bond"
  | "banking"
  | "fdi"
  | "currency"
  | "commodity"
  | "ores"
  | "agri"
  | "gold";

export interface Country {
  id: string;
  name: string;
  iso2: string;
  /** ISO 3166-1 numeric code, matches the `id` field in world-atlas topojson features */
  isoNumeric: string;
}

export interface Flow {
  id: string;
  source: string;
  target: string;
  assetClass: AssetClass;
  /** relative magnitude, roughly USD billions, used only to scale line width */
  magnitude: number;
  note: string;
  /** "real" = pulled from IMF CPIS / BIS / UN Comtrade; "mock" = hand-authored illustrative figure */
  dataSource: "real" | "mock";
}

export interface LayerDef {
  id: string;
  label: string;
  /** which flow asset class this layer filters to; null for not-yet-implemented layers */
  assetClass: AssetClass | null;
  available: boolean;
}
