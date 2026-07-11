import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { FeatureCollection, Geometry } from "geojson";
import worldData from "world-atlas/countries-50m.json";
import { pathGenerator } from "@/lib/projection";
import { countries } from "@/data/countries";

type CountryProps = { name: string };

const topology = worldData as unknown as Topology<{
  countries: GeometryCollection<CountryProps>;
  land: GeometryCollection;
}>;

export const worldFeatureCollection = feature(
  topology,
  topology.objects.countries
) as FeatureCollection<Geometry, CountryProps>;

// Antarctica (010) adds a large bright band at the bottom of the map with no economic content.
worldFeatureCollection.features = worldFeatureCollection.features.filter(
  (f) => f.id !== "010"
);

/** Screen-space (projected) centroid for each tracked country, keyed by our internal country id. */
export const countryCentroids = new Map<string, [number, number]>();

for (const country of countries) {
  const match = worldFeatureCollection.features.find(
    (f) => f.id === country.isoNumeric
  );
  if (match) {
    countryCentroids.set(country.id, pathGenerator.centroid(match));
  }
}
