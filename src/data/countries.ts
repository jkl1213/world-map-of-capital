import type { Country } from "@/types/flow";

export const countries: Country[] = [
  { id: "US", name: "United States", iso2: "US", isoNumeric: "840" },
  { id: "CN", name: "China", iso2: "CN", isoNumeric: "156" },
  { id: "JP", name: "Japan", iso2: "JP", isoNumeric: "392" },
  { id: "DE", name: "Germany", iso2: "DE", isoNumeric: "276" },
  { id: "GB", name: "United Kingdom", iso2: "GB", isoNumeric: "826" },
  { id: "FR", name: "France", iso2: "FR", isoNumeric: "250" },
  { id: "CA", name: "Canada", iso2: "CA", isoNumeric: "124" },
  { id: "IN", name: "India", iso2: "IN", isoNumeric: "356" },
  { id: "BR", name: "Brazil", iso2: "BR", isoNumeric: "076" },
  { id: "SA", name: "Saudi Arabia", iso2: "SA", isoNumeric: "682" },
  { id: "AE", name: "United Arab Emirates", iso2: "AE", isoNumeric: "784" },
  { id: "RU", name: "Russia", iso2: "RU", isoNumeric: "643" },
  { id: "KR", name: "South Korea", iso2: "KR", isoNumeric: "410" },
  { id: "SG", name: "Singapore", iso2: "SG", isoNumeric: "702" },
  { id: "CH", name: "Switzerland", iso2: "CH", isoNumeric: "756" },
  { id: "NL", name: "Netherlands", iso2: "NL", isoNumeric: "528" },
  { id: "MX", name: "Mexico", iso2: "MX", isoNumeric: "484" },
  { id: "ID", name: "Indonesia", iso2: "ID", isoNumeric: "360" },
  { id: "VN", name: "Vietnam", iso2: "VN", isoNumeric: "704" },
  { id: "NG", name: "Nigeria", iso2: "NG", isoNumeric: "566" },
  { id: "ZA", name: "South Africa", iso2: "ZA", isoNumeric: "710" },
  { id: "AU", name: "Australia", iso2: "AU", isoNumeric: "036" },
  { id: "QA", name: "Qatar", iso2: "QA", isoNumeric: "634" },
  { id: "NO", name: "Norway", iso2: "NO", isoNumeric: "578" },
  { id: "KE", name: "Kenya", iso2: "KE", isoNumeric: "404" },
];

export const countryById = new Map(countries.map((c) => [c.id, c]));
export const countryByIsoNumeric = new Map(
  countries.map((c) => [c.isoNumeric, c])
);
