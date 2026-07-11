"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { WorldMap } from "@/components/map/WorldMap";
import { TopBar } from "@/components/ui/TopBar";
import { LayerPanel } from "@/components/ui/LayerPanel";
import { Legend } from "@/components/ui/Legend";
import { CountryPanel } from "@/components/ui/CountryPanel";
import { Tooltip } from "@/components/ui/Tooltip";
import { pairKeyOf } from "@/data/flows";
import type { AssetClass, Flow } from "@/types/flow";

const ALL_ASSET_CLASSES: AssetClass[] = [
  "bond",
  "equity",
  "trade",
  "commodity",
  "fdi",
  "banking",
  "currency",
];

export default function Home() {
  const [activeLayers, setActiveLayers] = useState<Set<AssetClass>>(
    () => new Set(ALL_ASSET_CLASSES)
  );
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [focusAssetClass, setFocusAssetClass] = useState<AssetClass | null>(null);
  const [hoveredFlow, setHoveredFlow] = useState<Flow | null>(null);
  const [hoveredCountryId, setHoveredCountryId] = useState<string | null>(null);

  function toggleLayer(assetClass: AssetClass) {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(assetClass)) next.delete(assetClass);
      else next.add(assetClass);
      return next;
    });
  }

  function selectCountry(id: string | null) {
    setSelectedCountry(id);
    setFocusAssetClass(null);
  }

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-[#05070c]">
      <TopBar />

      <div className="relative flex-1">
        <div className="absolute inset-0">
          <WorldMap
            activeLayers={activeLayers}
            selectedCountry={selectedCountry}
            focusAssetClass={focusAssetClass}
            hoveredPairKey={
              hoveredFlow ? pairKeyOf(hoveredFlow.source, hoveredFlow.target) : null
            }
            onSelectCountry={selectCountry}
            onHoverFlow={setHoveredFlow}
            onHoverCountry={setHoveredCountryId}
          />
        </div>

        <div className="pointer-events-none absolute left-4 top-4">
          <LayerPanel activeLayers={activeLayers} onToggle={toggleLayer} />
        </div>

        <div className="pointer-events-none absolute bottom-4 left-4">
          <Legend />
        </div>

        <AnimatePresence>
          {selectedCountry && (
            <div className="pointer-events-none absolute right-4 top-4 bottom-4 flex">
              <CountryPanel
                countryId={selectedCountry}
                focusAssetClass={focusAssetClass}
                onFocusAssetClass={setFocusAssetClass}
                onClose={() => selectCountry(null)}
              />
            </div>
          )}
        </AnimatePresence>

        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2">
          <Tooltip hoveredFlow={hoveredFlow} hoveredCountryId={hoveredCountryId} />
        </div>
      </div>
    </div>
  );
}
