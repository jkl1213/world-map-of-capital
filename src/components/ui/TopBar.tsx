import Link from "next/link";

export function TopBar() {
  return (
    <div className="pointer-events-none flex items-center justify-between border-b border-white/10 bg-black/50 px-5 py-3 backdrop-blur-sm">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-base font-semibold tracking-wider text-slate-100">
          THE BLOOMBERG MAP OF THE WORLD ECONOMY
        </span>
        <span className="hidden text-[13px] text-slate-500 sm:inline">
          global capital &amp; trade flow explorer &middot; IMF CPIS / BIS / IMF DOT / UN Comtrade + illustrative FDI &amp; currency
        </span>
      </div>
      <div className="flex items-baseline gap-4">
        <Link
          href="/data-sources"
          className="pointer-events-auto font-mono text-xs text-sky-400 underline decoration-sky-400/40 underline-offset-2 hover:text-sky-300"
        >
          data sources &amp; methodology
        </Link>
        <span className="font-mono text-xs text-slate-500">MVP v0.1</span>
      </div>
    </div>
  );
}
