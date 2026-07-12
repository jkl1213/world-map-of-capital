// Pulls basic macro indicators for the 25 tracked countries from the World Bank API
// (free, no key) and writes src/data/countryProfiles.generated.json.
//
// Run with: node scripts/fetch-country-profiles.mjs

import { writeFile } from "node:fs/promises";

const countries = [
  { id: "US", iso3: "USA" }, { id: "CN", iso3: "CHN" }, { id: "JP", iso3: "JPN" },
  { id: "DE", iso3: "DEU" }, { id: "GB", iso3: "GBR" }, { id: "FR", iso3: "FRA" },
  { id: "CA", iso3: "CAN" }, { id: "IN", iso3: "IND" }, { id: "BR", iso3: "BRA" },
  { id: "SA", iso3: "SAU" }, { id: "AE", iso3: "ARE" }, { id: "RU", iso3: "RUS" },
  { id: "KR", iso3: "KOR" }, { id: "SG", iso3: "SGP" }, { id: "CH", iso3: "CHE" },
  { id: "NL", iso3: "NLD" }, { id: "MX", iso3: "MEX" }, { id: "ID", iso3: "IDN" },
  { id: "VN", iso3: "VNM" }, { id: "NG", iso3: "NGA" }, { id: "ZA", iso3: "ZAF" },
  { id: "AU", iso3: "AUS" }, { id: "QA", iso3: "QAT" }, { id: "NO", iso3: "NOR" },
  { id: "KE", iso3: "KEN" },
  // 2026-07 expansion
  { id: "IT", iso3: "ITA" }, { id: "ES", iso3: "ESP" }, { id: "SE", iso3: "SWE" },
  { id: "BE", iso3: "BEL" }, { id: "IE", iso3: "IRL" }, { id: "AT", iso3: "AUT" },
  { id: "LU", iso3: "LUX" }, { id: "DK", iso3: "DNK" }, { id: "FI", iso3: "FIN" },
  { id: "GR", iso3: "GRC" }, { id: "HK", iso3: "HKG" }, { id: "PH", iso3: "PHL" },
  { id: "CL", iso3: "CHL" }, { id: "TR", iso3: "TUR" }, { id: "PL", iso3: "POL" },
  { id: "PT", iso3: "PRT" }, { id: "CZ", iso3: "CZE" }, { id: "HU", iso3: "HUN" },
  { id: "TH", iso3: "THA" }, { id: "MY", iso3: "MYS" }, { id: "AR", iso3: "ARG" },
  { id: "CO", iso3: "COL" }, { id: "EG", iso3: "EGY" }, { id: "IL", iso3: "ISR" },
  { id: "PK", iso3: "PAK" }, { id: "NZ", iso3: "NZL" }, { id: "KW", iso3: "KWT" },
  { id: "KZ", iso3: "KAZ" },
];

const indicators = {
  gdpUsd: "NY.GDP.MKTP.CD",
  gdpGrowthPct: "NY.GDP.MKTP.KD.ZG",
  gdpPerCapitaUsd: "NY.GDP.PCAP.CD",
  population: "SP.POP.TOTL",
  currentAccountPctGdp: "BN.CAB.XOKA.GD.ZS",
};

async function fetchLatest(iso3, indicatorCode) {
  const url = `https://api.worldbank.org/v2/country/${iso3}/indicator/${indicatorCode}?format=json&date=2019:2026&per_page=10`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    const rows = json?.[1];
    if (!Array.isArray(rows)) return null;
    // rows come newest-first; take the first non-null value
    for (const row of rows) {
      if (row.value !== null && row.value !== undefined) {
        return { value: row.value, year: row.date };
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function main() {
  const profiles = {};

  for (const country of countries) {
    const entries = await Promise.all(
      Object.entries(indicators).map(async ([key, code]) => [
        key,
        await fetchLatest(country.iso3, code),
      ])
    );
    profiles[country.id] = Object.fromEntries(entries);
    const gdp = profiles[country.id].gdpUsd;
    console.log(
      `${country.id}: GDP ${gdp ? `$${(gdp.value / 1e12).toFixed(2)}tn (${gdp.year})` : "n/a"}`
    );
  }

  const outPath = new URL("../src/data/countryProfiles.generated.json", import.meta.url);
  await writeFile(outPath, JSON.stringify(profiles, null, 2));
  console.log(`\nWritten to ${outPath.pathname}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
