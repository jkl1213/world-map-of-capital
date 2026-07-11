import profilesJson from "@/data/countryProfiles.generated.json";

export interface IndicatorValue {
  value: number;
  year: string;
}

export interface CountryProfile {
  gdpUsd: IndicatorValue | null;
  gdpGrowthPct: IndicatorValue | null;
  gdpPerCapitaUsd: IndicatorValue | null;
  population: IndicatorValue | null;
  currentAccountPctGdp: IndicatorValue | null;
}

export const countryProfiles = profilesJson as Record<string, CountryProfile>;

export function formatUsdCompact(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}tn`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(0)}bn`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}m`;
  return `$${Math.round(value).toLocaleString()}`;
}

export function formatPopulation(value: number): string {
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}bn`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}m`;
  return Math.round(value).toLocaleString();
}
