"use client";

import { useEffect, useMemo, useRef } from "react";
import { select } from "d3-selection";
import "d3-transition";
import { zoom, zoomIdentity, type ZoomBehavior } from "d3-zoom";
import { MAP_WIDTH, MAP_HEIGHT, spherePath, graticulePath } from "@/lib/projection";
import { worldFeatureCollection, countryCentroids } from "@/lib/worldFeatures";
import { countryByIsoNumeric, countries } from "@/data/countries";
import { flows, pairKeyOf } from "@/data/flows";
import { arcPath } from "@/lib/arc";
import { assetClassColor } from "@/lib/colors";
import { CountryPath } from "@/components/map/CountryPath";
import { FlowArc } from "@/components/map/FlowArc";
import type { AssetClass, Flow } from "@/types/flow";

interface WorldMapProps {
  activeLayers: Set<AssetClass>;
  selectedCountry: string | null;
  focusAssetClass: AssetClass | null;
  hoveredPairKey: string | null;
  onSelectCountry: (id: string | null) => void;
  onHoverFlow: (flow: Flow | null) => void;
  onHoverCountry: (id: string | null) => void;
}

export function WorldMap({
  activeLayers,
  selectedCountry,
  focusAssetClass,
  hoveredPairKey,
  onSelectCountry,
  onHoverFlow,
  onHoverCountry,
}: WorldMapProps) {
  // With real bilateral data there are 1000+ flows; drawing them all buries the map. In the
  // global view only the largest flows per asset class are drawn (drill into a country for its
  // full set), and animated particles are further capped so SMIL animation stays smooth.
  const GLOBAL_RENDER_CAP_PER_CLASS = 22;
  const ANIMATE_CAP_PER_CLASS = 40;

  const visibleFlows = useMemo(() => {
    const active = flows.filter((flow) => {
      const baseVisible = activeLayers.has(flow.assetClass);
      const touchesSelected =
        selectedCountry !== null &&
        (flow.source === selectedCountry || flow.target === selectedCountry);
      if (selectedCountry) {
        return focusAssetClass
          ? touchesSelected && flow.assetClass === focusAssetClass
          : touchesSelected && baseVisible;
      }
      return baseVisible;
    });

    const byClass = new Map<AssetClass, Flow[]>();
    for (const flow of active) {
      const list = byClass.get(flow.assetClass) ?? [];
      list.push(flow);
      byClass.set(flow.assetClass, list);
    }

    const result: { flow: Flow; isAnimated: boolean }[] = [];
    for (const list of byClass.values()) {
      list.sort((a, b) => b.magnitude - a.magnitude);
      const rendered = selectedCountry
        ? list
        : list.slice(0, GLOBAL_RENDER_CAP_PER_CLASS);
      rendered.forEach((flow, rank) => {
        result.push({ flow, isAnimated: rank < ANIMATE_CAP_PER_CLASS });
      });
    }
    return result;
  }, [activeLayers, selectedCountry, focusAssetClass]);

  const connectedCountryIds = useMemo(() => {
    if (!selectedCountry) return null;
    const ids = new Set<string>([selectedCountry]);
    for (const { flow } of visibleFlows) {
      ids.add(flow.source);
      ids.add(flow.target);
    }
    return ids;
  }, [visibleFlows, selectedCountry]);

  const nodeMagnitude = useMemo(() => {
    const totals = new Map<string, number>();
    for (const flow of flows) {
      if (!activeLayers.has(flow.assetClass)) continue;
      totals.set(flow.source, (totals.get(flow.source) ?? 0) + flow.magnitude);
      totals.set(flow.target, (totals.get(flow.target) ?? 0) + flow.magnitude);
    }
    return totals;
  }, [activeLayers]);

  const maxNodeMagnitude = Math.max(1, ...Array.from(nodeMagnitude.values()));

  const svgRef = useRef<SVGSVGElement>(null);
  const zoomGroupRef = useRef<SVGGElement>(null);
  const zoomBehaviorRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  useEffect(() => {
    if (!svgRef.current || !zoomGroupRef.current) return;
    const svgSelection = select(svgRef.current);
    const groupSelection = select(zoomGroupRef.current);

    const behavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 12])
      .translateExtent([
        [0, 0],
        [MAP_WIDTH, MAP_HEIGHT],
      ])
      .on("zoom", (event) => {
        groupSelection.attr("transform", event.transform.toString());
      });

    svgSelection.call(behavior);
    zoomBehaviorRef.current = behavior;

    return () => {
      svgSelection.on(".zoom", null);
    };
  }, []);

  function zoomBy(factor: number) {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    select(svgRef.current)
      .transition()
      .duration(200)
      .call(zoomBehaviorRef.current.scaleBy, factor);
  }

  function resetZoom() {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    select(svgRef.current)
      .transition()
      .duration(300)
      .call(zoomBehaviorRef.current.transform, zoomIdentity);
  }

  return (
    <div className="relative h-full w-full">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        className="h-full w-full cursor-grab touch-none active:cursor-grabbing"
        role="img"
        aria-label="World map of capital flows"
      >
        <defs>
          <radialGradient id="ocean-fill" cx="50%" cy="42%" r="75%">
            <stop offset="0%" stopColor="#101a2b" />
            <stop offset="70%" stopColor="#0a111d" />
            <stop offset="100%" stopColor="#060a12" />
          </radialGradient>
        </defs>

        <rect x={0} y={0} width={MAP_WIDTH} height={MAP_HEIGHT} fill="#05070c" />

        <g ref={zoomGroupRef}>
        <path d={spherePath} fill="url(#ocean-fill)" />
        <path
          d={graticulePath}
          fill="none"
          stroke="#1c2739"
          strokeWidth={0.3}
          strokeOpacity={0.55}
          vectorEffect="non-scaling-stroke"
        />
        <g>
        {worldFeatureCollection.features.map((feature, i) => {
          const country = feature.id
            ? countryByIsoNumeric.get(String(feature.id))
            : undefined;
          const trackedId = country?.id ?? null;
          const isDimmed =
            connectedCountryIds !== null &&
            trackedId !== null &&
            !connectedCountryIds.has(trackedId);
          return (
            <CountryPath
              key={`${feature.id ?? "f"}-${i}`}
              feature={feature}
              trackedId={trackedId}
              isSelected={trackedId === selectedCountry}
              isDimmed={isDimmed}
              onClick={(id) => onSelectCountry(id === selectedCountry ? null : id)}
              onHoverChange={onHoverCountry}
            />
          );
        })}
      </g>

      {/* screen blending makes overlapping arcs brighten additively instead of muddying the land below */}
      <g style={{ mixBlendMode: "screen" }}>
        {visibleFlows.map(({ flow, isAnimated }) => {
          const from = countryCentroids.get(flow.source);
          const to = countryCentroids.get(flow.target);
          if (!from || !to) return null;
          const d = arcPath(from[0], from[1], to[0], to[1]);
          const strokeWidth = 0.4 + Math.sqrt(flow.magnitude) * 0.055;
          return (
            <FlowArc
              key={flow.id}
              id={flow.id}
              d={d}
              color={assetClassColor[flow.assetClass]}
              strokeWidth={strokeWidth}
              magnitude={flow.magnitude}
              isAnimated={isAnimated}
              isFocused={hoveredPairKey === pairKeyOf(flow.source, flow.target)}
              onHoverChange={(id) => onHoverFlow(id ? flow : null)}
            />
          );
        })}
      </g>

      <g>
        {countries.map((country) => {
          const pos = countryCentroids.get(country.id);
          if (!pos) return null;
          const magnitude = nodeMagnitude.get(country.id) ?? 0;
          const radius = 2 + (magnitude / maxNodeMagnitude) * 6;
          const isDimmed =
            connectedCountryIds !== null && !connectedCountryIds.has(country.id);
          return (
            <circle
              key={country.id}
              cx={pos[0]}
              cy={pos[1]}
              r={radius}
              vectorEffect="non-scaling-stroke"
              fill={country.id === selectedCountry ? "#f8fafc" : "#94a3b8"}
              opacity={isDimmed ? 0.25 : 0.9}
              stroke="#0b0f17"
              strokeWidth={1}
              className="cursor-pointer transition-opacity duration-150"
              onClick={() =>
                onSelectCountry(country.id === selectedCountry ? null : country.id)
              }
              onMouseEnter={() => onHoverCountry(country.id)}
              onMouseLeave={() => onHoverCountry(null)}
            />
          );
        })}
      </g>
        </g>
      </svg>

      <div className="pointer-events-auto absolute bottom-4 right-4 flex flex-col overflow-hidden rounded-md border border-white/10 bg-black/60 font-mono text-sm text-slate-300 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => zoomBy(1.6)}
          aria-label="Zoom in"
          className="flex h-7 w-7 items-center justify-center hover:bg-white/10"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => zoomBy(1 / 1.6)}
          aria-label="Zoom out"
          className="flex h-7 w-7 items-center justify-center border-t border-white/10 hover:bg-white/10"
        >
          &minus;
        </button>
        <button
          type="button"
          onClick={resetZoom}
          aria-label="Reset view"
          className="flex h-7 w-7 items-center justify-center border-t border-white/10 text-xs hover:bg-white/10"
        >
          &#8634;
        </button>
      </div>
    </div>
  );
}
