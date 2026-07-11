import { geoNaturalEarth1, geoPath, geoGraticule10 } from "d3-geo";

export const MAP_WIDTH = 960;
export const MAP_HEIGHT = 500;

export const projection = geoNaturalEarth1().fitSize(
  [MAP_WIDTH, MAP_HEIGHT],
  { type: "Sphere" } as never
);

export const pathGenerator = geoPath(projection);

/** Projected path for the map sphere outline (ocean shape). */
export const spherePath = pathGenerator({ type: "Sphere" }) ?? "";

/** Projected path for the 10-degree meridian/parallel grid. */
export const graticulePath = pathGenerator(geoGraticule10()) ?? "";
