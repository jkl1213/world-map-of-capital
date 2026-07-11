"use client";

import { layers } from "@/data/flows";
import { assetClassColor } from "@/lib/colors";
import { AssetClassHint } from "@/components/ui/AssetClassHint";
import type { AssetClass } from "@/types/flow";

interface LayerPanelProps {
  activeLayers: Set<AssetClass>;
  onToggle: (assetClass: AssetClass) => void;
}

export function LayerPanel({ activeLayers, onToggle }: LayerPanelProps) {
  return (
    <div className="pointer-events-auto w-60 rounded-lg border border-white/10 bg-black/60 p-3 backdrop-blur-sm">
      <div className="mb-2 font-mono text-[11px] uppercase tracking-widest text-slate-500">
        Layers
      </div>
      <ul className="flex flex-col gap-1">
        {layers.map((layer) => {
          const checked = layer.assetClass ? activeLayers.has(layer.assetClass) : false;
          return (
            <li key={layer.id}>
              <button
                type="button"
                disabled={!layer.available}
                onClick={() => layer.assetClass && onToggle(layer.assetClass)}
                className={`flex w-full items-center gap-2 rounded px-1.5 py-1 text-left text-[13px] transition-colors ${
                  layer.available
                    ? "cursor-pointer hover:bg-white/5"
                    : "cursor-not-allowed opacity-40"
                }`}
              >
                <span
                  className="h-2.5 w-2.5 flex-shrink-0 rounded-sm border border-white/20"
                  style={{
                    backgroundColor:
                      layer.assetClass && checked
                        ? assetClassColor[layer.assetClass]
                        : "transparent",
                  }}
                />
                {layer.assetClass ? (
                  <AssetClassHint assetClass={layer.assetClass}>
                    <span className={checked ? "text-slate-100" : "text-slate-400"}>
                      {layer.label}
                    </span>
                  </AssetClassHint>
                ) : (
                  <span className={checked ? "text-slate-100" : "text-slate-400"}>
                    {layer.label}
                  </span>
                )}
                {!layer.available && (
                  <span className="ml-auto font-mono text-[10px] text-slate-600">
                    soon
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-2 border-t border-white/10 pt-1 font-mono text-[10px] leading-tight text-slate-500">
        global view shows the largest flows per layer &middot; click a country for its full detail
      </div>
    </div>
  );
}
