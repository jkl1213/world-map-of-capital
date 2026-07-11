import { assetClassColor, assetClassLabel } from "@/lib/colors";
import { AssetClassHint } from "@/components/ui/AssetClassHint";
import type { AssetClass } from "@/types/flow";

const order: AssetClass[] = [
  "equity",
  "bond",
  "banking",
  "trade",
  "currency",
  "fdi",
  "commodity",
  "ores",
  "agri",
  "gold",
];

export function Legend() {
  return (
    <div className="pointer-events-auto rounded-lg border border-white/10 bg-black/60 p-3 backdrop-blur-sm">
      <div className="mb-2 font-mono text-[11px] uppercase tracking-widest text-slate-500">
        Asset Class
      </div>
      <ul className="flex flex-col gap-1">
        {order.map((ac) => (
          <li key={ac} className="flex items-center gap-2 text-[13px] text-slate-300">
            <span
              className="h-0.5 w-4 flex-shrink-0 rounded"
              style={{ backgroundColor: assetClassColor[ac] }}
            />
            <AssetClassHint assetClass={ac}>{assetClassLabel[ac]}</AssetClassHint>
          </li>
        ))}
      </ul>
    </div>
  );
}
