"use client";

import { pathGenerator } from "@/lib/projection";
import type { Feature, Geometry } from "geojson";

interface CountryPathProps {
  feature: Feature<Geometry, { name: string }>;
  trackedId: string | null;
  isSelected: boolean;
  isDimmed: boolean;
  onClick: (id: string) => void;
  onHoverChange: (id: string | null) => void;
}

export function CountryPath({
  feature,
  trackedId,
  isSelected,
  isDimmed,
  onClick,
  onHoverChange,
}: CountryPathProps) {
  const d = pathGenerator(feature) ?? undefined;
  const interactive = trackedId !== null;

  let fill = interactive ? "#1b2433" : "#151c28";
  if (isSelected) fill = "#31405c";
  else if (isDimmed) fill = "#121826";

  return (
    <path
      d={d}
      fill={fill}
      stroke={isSelected ? "#5b6f96" : "#2e3a4f"}
      strokeWidth={isSelected ? 0.8 : 0.4}
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
      className={
        interactive
          ? `cursor-pointer transition-colors duration-150${isSelected ? "" : " hover:[fill:#26334a]"}`
          : undefined
      }
      onClick={interactive ? () => onClick(trackedId as string) : undefined}
      onMouseEnter={interactive ? () => onHoverChange(trackedId) : undefined}
      onMouseLeave={interactive ? () => onHoverChange(null) : undefined}
    />
  );
}
