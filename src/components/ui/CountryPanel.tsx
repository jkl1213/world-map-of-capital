"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { countryById } from "@/data/countries";
import { flows } from "@/data/flows";
import { countryFacts } from "@/data/countryFacts";
import {
  countryProfiles,
  formatUsdCompact,
  formatPopulation,
} from "@/data/countryProfiles";
import { assetClassColor, assetClassLabel } from "@/lib/colors";
import { AssetClassHint } from "@/components/ui/AssetClassHint";
import type { AssetClass } from "@/types/flow";

interface CountryPanelProps {
  countryId: string;
  focusAssetClass: AssetClass | null;
  onFocusAssetClass: (assetClass: AssetClass | null) => void;
  onClose: () => void;
}

interface Row {
  counterpartId: string;
  direction: "in" | "out";
  magnitude: number;
  dataSource: "real" | "mock";
}

const ROWS_SHOWN_PER_GROUP = 8;

export function CountryPanel({
  countryId,
  focusAssetClass,
  onFocusAssetClass,
  onClose,
}: CountryPanelProps) {
  const country = countryById.get(countryId);

  const { groups, totalIn, totalOut, maxMagnitude } = useMemo(() => {
    const groups = new Map<AssetClass, Row[]>();
    let totalIn = 0;
    let totalOut = 0;
    let maxMagnitude = 1;

    for (const flow of flows) {
      const isOut = flow.source === countryId;
      const isIn = flow.target === countryId;
      if (!isOut && !isIn) continue;

      const row: Row = {
        counterpartId: isOut ? flow.target : flow.source,
        direction: isOut ? "out" : "in",
        magnitude: flow.magnitude,
        dataSource: flow.dataSource,
      };
      if (isOut) totalOut += flow.magnitude;
      if (isIn) totalIn += flow.magnitude;
      maxMagnitude = Math.max(maxMagnitude, flow.magnitude);

      const list = groups.get(flow.assetClass) ?? [];
      list.push(row);
      groups.set(flow.assetClass, list);
    }

    return { groups, totalIn, totalOut, maxMagnitude };
  }, [countryId]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.18 }}
      className="pointer-events-auto flex max-h-full w-[22rem] flex-col overflow-y-auto rounded-lg border border-white/10 bg-black/70 p-4 backdrop-blur-sm"
    >
      <div className="mb-1 flex items-start justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="font-mono text-base font-semibold text-slate-100">
            {country?.name ?? countryId}
          </div>
          {(() => {
            // Current-account balance as a proxy for creditor/debtor status: surplus
            // economies export capital, deficit economies import it.
            const ca = countryProfiles[countryId]?.currentAccountPctGdp?.value;
            if (ca === undefined || ca === null) return null;
            const badge =
              ca >= 0.5
                ? { label: "net creditor", cls: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" }
                : ca <= -0.5
                  ? { label: "net debtor", cls: "border-amber-500/40 bg-amber-500/10 text-amber-400" }
                  : { label: "balanced", cls: "border-white/20 bg-white/5 text-slate-400" };
            return (
              <span
                className={`rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide ${badge.cls}`}
                title={`Current account ${ca >= 0 ? "+" : ""}${ca.toFixed(1)}% of GDP - ${
                  ca >= 0.5
                    ? "runs a surplus and lends to the rest of the world"
                    : ca <= -0.5
                      ? "runs a deficit and borrows from the rest of the world"
                      : "roughly balanced with the rest of the world"
                }`}
              >
                {badge.label}
              </span>
            );
          })()}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-500 hover:text-slate-200"
          aria-label="Close"
        >
          &times;
        </button>
      </div>

      <div className="mb-3 flex gap-4 font-mono text-xs text-slate-400">
        <span>
          Inflows <span className="text-emerald-400">${totalIn.toLocaleString()}bn</span>
        </span>
        <span>
          Outflows <span className="text-amber-400">${totalOut.toLocaleString()}bn</span>
        </span>
      </div>

      {(() => {
        const profile = countryProfiles[countryId];
        const facts = countryFacts[countryId];
        if (!profile && !facts) return null;
        return (
          <div className="mb-4 rounded-md border border-white/10 bg-white/[0.03] p-2.5">
            <div className="mb-1.5 font-mono text-[11px] uppercase tracking-widest text-slate-500">
              Economy snapshot
            </div>
            {profile && (
              <div className="mb-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                {profile.gdpUsd && (
                  <div>
                    <span className="text-slate-500">GDP </span>
                    <span className="font-mono text-slate-200">
                      {formatUsdCompact(profile.gdpUsd.value)}
                    </span>
                    <span className="text-slate-600"> ({profile.gdpUsd.year})</span>
                  </div>
                )}
                {profile.gdpGrowthPct && (
                  <div>
                    <span className="text-slate-500">Growth </span>
                    <span
                      className={`font-mono ${
                        profile.gdpGrowthPct.value >= 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {profile.gdpGrowthPct.value >= 0 ? "+" : ""}
                      {profile.gdpGrowthPct.value.toFixed(1)}%
                    </span>
                  </div>
                )}
                {profile.gdpPerCapitaUsd && (
                  <div>
                    <span className="text-slate-500">GDP/capita </span>
                    <span className="font-mono text-slate-200">
                      ${Math.round(profile.gdpPerCapitaUsd.value).toLocaleString()}
                    </span>
                  </div>
                )}
                {profile.population && (
                  <div>
                    <span className="text-slate-500">Population </span>
                    <span className="font-mono text-slate-200">
                      {formatPopulation(profile.population.value)}
                    </span>
                  </div>
                )}
                {profile.currentAccountPctGdp && (
                  <div className="col-span-2">
                    <span className="text-slate-500">Current account </span>
                    <span
                      className={`font-mono ${
                        profile.currentAccountPctGdp.value >= 0
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {profile.currentAccountPctGdp.value >= 0 ? "+" : ""}
                      {profile.currentAccountPctGdp.value.toFixed(1)}% of GDP
                    </span>
                    <span className="text-slate-600">
                      {" "}
                      {profile.currentAccountPctGdp.value >= 0
                        ? "(saves more than it invests - exports capital)"
                        : "(imports foreign capital to fund itself)"}
                    </span>
                  </div>
                )}
              </div>
            )}
            {facts && (
              <>
                <div className="mb-1.5 flex flex-wrap gap-1">
                  {facts.industries.map((industry) => (
                    <span
                      key={industry}
                      className="rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 text-[11px] text-slate-300"
                    >
                      {industry}
                    </span>
                  ))}
                </div>
                <p className="text-xs leading-snug text-slate-400">{facts.capitalRole}</p>
              </>
            )}
          </div>
        );
      })()}

      {groups.size === 0 && (
        <div className="text-sm text-slate-500">No flow data for this country yet.</div>
      )}

      <div className="flex flex-col gap-3">
        {Array.from(groups.entries()).map(([assetClass, rows]) => {
          const isFocused = focusAssetClass === assetClass;
          return (
            <div key={assetClass}>
              <button
                type="button"
                onClick={() =>
                  onFocusAssetClass(isFocused ? null : assetClass)
                }
                className={`mb-1 flex w-full items-center gap-2 rounded px-1 py-0.5 text-left text-[13px] font-semibold uppercase tracking-wide transition-colors ${
                  isFocused ? "bg-white/10 text-slate-100" : "text-slate-300 hover:bg-white/5"
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: assetClassColor[assetClass] }}
                />
                <AssetClassHint assetClass={assetClass} side="bottom">
                  {assetClassLabel[assetClass]}
                </AssetClassHint>
              </button>
              <div className="flex flex-col gap-1">
                {rows.slice(0, ROWS_SHOWN_PER_GROUP).map((row, i) => {
                  const counterpart = countryById.get(row.counterpartId)?.name ?? row.counterpartId;
                  const widthPct = Math.max(6, (row.magnitude / maxMagnitude) * 100);
                  return (
                    <div key={`${row.counterpartId}-${i}`} className="flex items-center gap-2 text-xs">
                      <span
                        className={`w-32 flex-shrink-0 truncate ${
                          row.direction === "in" ? "text-emerald-400" : "text-amber-400"
                        }`}
                        title={
                          row.direction === "in"
                            ? `inflow from ${counterpart}`
                            : `outflow to ${counterpart}`
                        }
                      >
                        {row.direction === "in" ? counterpart : "here"}
                        <span className="mx-1 opacity-60">&rarr;</span>
                        {row.direction === "in" ? "here" : counterpart}
                      </span>
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                        <span
                          className="block h-full rounded-full"
                          style={{
                            width: `${widthPct}%`,
                            backgroundColor: assetClassColor[assetClass],
                          }}
                        />
                      </span>
                      <span className="w-16 flex-shrink-0 text-right font-mono text-slate-400">
                        ${row.magnitude}bn
                      </span>
                      {row.dataSource === "mock" && (
                        <span className="flex-shrink-0 font-mono text-[9px] uppercase text-amber-500/70">
                          mock
                        </span>
                      )}
                    </div>
                  );
                })}
                {rows.length > ROWS_SHOWN_PER_GROUP && (
                  <div className="pl-1 font-mono text-[11px] text-slate-600">
                    +{rows.length - ROWS_SHOWN_PER_GROUP} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {focusAssetClass && (
        <button
          type="button"
          onClick={() => onFocusAssetClass(null)}
          className="mt-3 self-start font-mono text-[11px] text-slate-500 underline hover:text-slate-300"
        >
          clear layer focus
        </button>
      )}
    </motion.div>
  );
}
