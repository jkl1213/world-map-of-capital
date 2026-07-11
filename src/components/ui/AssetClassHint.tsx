import type { ReactNode } from "react";
import { assetClassInfo } from "@/data/assetClassInfo";
import type { AssetClass } from "@/types/flow";

const sideClasses = {
  right: "left-full top-1/2 ml-2 -translate-y-1/2",
  bottom: "left-0 top-full mt-1.5",
} as const;

interface AssetClassHintProps {
  assetClass: AssetClass;
  side?: keyof typeof sideClasses;
  children: ReactNode;
}

// Wraps an asset-class term and shows a definition + data source popup on hover.
export function AssetClassHint({ assetClass, side = "right", children }: AssetClassHintProps) {
  const info = assetClassInfo[assetClass];
  return (
    <span className="group/hint relative inline-flex min-w-0 cursor-help items-center">
      <span className="truncate underline decoration-dotted decoration-slate-600 underline-offset-2">
        {children}
      </span>
      <span
        className={`pointer-events-none invisible absolute z-50 w-64 rounded-md border border-white/15 bg-[#0d1320] p-2.5 text-left opacity-0 shadow-xl transition-opacity duration-100 group-hover/hint:visible group-hover/hint:opacity-100 ${sideClasses[side]}`}
      >
        <span className="block text-xs font-normal normal-case leading-snug tracking-normal text-slate-200">
          {info.definition}
        </span>
        <span className="mt-1.5 block font-mono text-[10px] font-normal normal-case leading-snug tracking-normal text-slate-500">
          Source: {info.source}
        </span>
      </span>
    </span>
  );
}
