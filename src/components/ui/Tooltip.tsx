"use client";

import { motion, AnimatePresence } from "framer-motion";
import { countryById } from "@/data/countries";
import { flowsBetween, pairKeyOf } from "@/data/flows";
import { flowStories } from "@/data/flowStories";
import { assetClassColor, assetClassLabel } from "@/lib/colors";
import type { Flow } from "@/types/flow";

interface TooltipProps {
  hoveredFlow: Flow | null;
  hoveredCountryId: string | null;
}

const MAX_ROWS = 8;

export function Tooltip({ hoveredFlow, hoveredCountryId }: TooltipProps) {
  const content = (() => {
    if (hoveredFlow) {
      // Arcs between the same two countries overlap on screen, so hovering any one of them
      // surfaces the full list of flows for that pair rather than a single arc's flow.
      const pairFlows = flowsBetween(hoveredFlow.source, hoveredFlow.target);
      const nameA = countryById.get(hoveredFlow.source)?.name ?? hoveredFlow.source;
      const nameB = countryById.get(hoveredFlow.target)?.name ?? hoveredFlow.target;
      const total = pairFlows.reduce((sum, f) => sum + f.magnitude, 0);
      const story = flowStories.get(pairKeyOf(hoveredFlow.source, hoveredFlow.target));
      return (
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-baseline gap-x-2 text-base text-slate-100">
            <span>
              {nameA} <span className="text-slate-500">&#8644;</span> {nameB}
            </span>
            <span className="font-mono text-xs text-slate-500">
              {pairFlows.length} flow{pairFlows.length === 1 ? "" : "s"} &middot; ~$
              {total.toLocaleString()}bn
            </span>
          </div>
          <div className="flex flex-col gap-1">
            {pairFlows.slice(0, MAX_ROWS).map((flow) => {
              const src = countryById.get(flow.source)?.name ?? flow.source;
              const tgt = countryById.get(flow.target)?.name ?? flow.target;
              return (
                <div key={flow.id} className="flex items-center gap-2 text-sm">
                  <span
                    className="h-2 w-2 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: assetClassColor[flow.assetClass] }}
                  />
                  <span className="w-40 flex-shrink-0 truncate text-slate-300">
                    {assetClassLabel[flow.assetClass]}
                  </span>
                  <span className="truncate text-slate-400">
                    {src} <span className="text-slate-600">&rarr;</span> {tgt}
                  </span>
                  {flow.dataSource === "mock" && (
                    <span className="flex-shrink-0 rounded border border-amber-500/30 px-1 font-mono text-[10px] uppercase tracking-wide text-amber-400">
                      illustrative
                    </span>
                  )}
                  <span className="ml-auto flex-shrink-0 font-mono text-slate-200">
                    ${flow.magnitude.toLocaleString()}bn
                  </span>
                </div>
              );
            })}
            {pairFlows.length > MAX_ROWS && (
              <div className="font-mono text-xs text-slate-500">
                +{pairFlows.length - MAX_ROWS} more
              </div>
            )}
          </div>
          {pairFlows.length === 1 && (
            <div className="font-mono text-xs text-slate-400">{pairFlows[0].note}</div>
          )}
          {story && (
            <div className="border-t border-white/10 pt-1.5 text-[13px] italic leading-snug text-slate-300">
              {story}
            </div>
          )}
        </div>
      );
    }
    if (hoveredCountryId) {
      const country = countryById.get(hoveredCountryId);
      return (
        <div className="text-base text-slate-100">
          {country?.name ?? hoveredCountryId}
          <span className="ml-2 text-sm text-slate-500">click to drill in</span>
        </div>
      );
    }
    return (
      <div className="text-sm text-slate-500">
        Hover a country or flow line for details &middot; click a country to drill in
      </div>
    );
  })();

  return (
    <div className="pointer-events-none w-full max-w-xl rounded-lg border border-white/10 bg-black/60 px-4 py-2.5 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={
            hoveredFlow
              ? pairKeyOf(hoveredFlow.source, hoveredFlow.target)
              : hoveredCountryId ?? "idle"
          }
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.12 }}
        >
          {content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
