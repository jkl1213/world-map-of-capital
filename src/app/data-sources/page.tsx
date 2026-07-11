import Link from "next/link";
import { assetClassColor } from "@/lib/colors";

export const metadata = {
  title: "Data Sources & Methodology - The Bloomberg Map of the World Economy",
  description:
    "Where every figure on the map comes from: sources, series definitions, processing steps, sanity checks, and known limitations.",
};

function Dot({ assetClass }: { assetClass: keyof typeof assetClassColor }) {
  return (
    <span
      className="mr-2 inline-block h-2.5 w-2.5 rounded-full align-middle"
      style={{ backgroundColor: assetClassColor[assetClass] }}
    />
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 mt-12 font-mono text-sm font-semibold uppercase tracking-widest text-slate-400">
      {children}
    </h2>
  );
}

function SourceBadge({ kind }: { kind: "real" | "illustrative" }) {
  return kind === "real" ? (
    <span className="rounded border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-emerald-400">
      real data
    </span>
  ) : (
    <span className="rounded border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-amber-400">
      illustrative
    </span>
  );
}

function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sky-400 underline decoration-sky-400/40 underline-offset-2 hover:text-sky-300"
    >
      {children}
    </a>
  );
}

export default function DataSourcesPage() {
  return (
    <div className="min-h-screen bg-[#05070c] text-slate-300">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link
          href="/"
          className="font-mono text-xs text-slate-500 hover:text-slate-300"
        >
          &larr; back to the map
        </Link>

        <h1 className="mt-4 font-mono text-2xl font-semibold tracking-wide text-slate-100">
          Data Sources &amp; Methodology
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-400">
          Every flow on the map carries a note stating exactly which statistical series it
          came from and for which period (hover any line to see it). This page explains
          what each source actually measures, how the raw numbers were processed, how you
          can check them against independent references, and where they are weak. Five of
          the seven layers are real published statistics pulled from free public APIs;
          two (FDI and Currency) are hand-authored illustrations and are labeled as such
          everywhere they appear.
        </p>

        {/* ------------------------------------------------ quick reference */}
        <SectionTitle>At a glance</SectionTitle>
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] font-mono text-[11px] uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2">Layer</th>
                <th className="px-3 py-2">Source</th>
                <th className="px-3 py-2">Period</th>
                <th className="px-3 py-2">Records</th>
                <th className="px-3 py-2">Kind</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              <tr className="border-b border-white/5">
                <td className="px-3 py-2"><Dot assetClass="bond" />Bonds</td>
                <td className="px-3 py-2">IMF CPIS</td>
                <td className="px-3 py-2">mostly mid-2024</td>
                <td className="px-3 py-2 font-mono">323</td>
                <td className="px-3 py-2">holdings (stock)</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="px-3 py-2"><Dot assetClass="equity" />Equities</td>
                <td className="px-3 py-2">IMF CPIS</td>
                <td className="px-3 py-2">mostly mid-2024</td>
                <td className="px-3 py-2 font-mono">336</td>
                <td className="px-3 py-2">holdings (stock)</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="px-3 py-2"><Dot assetClass="banking" />Bank lending</td>
                <td className="px-3 py-2">BIS LBS</td>
                <td className="px-3 py-2">Q4 2024</td>
                <td className="px-3 py-2 font-mono">249</td>
                <td className="px-3 py-2">claims (stock)</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="px-3 py-2"><Dot assetClass="trade" />Trade</td>
                <td className="px-3 py-2">IMF DOT</td>
                <td className="px-3 py-2">2024</td>
                <td className="px-3 py-2 font-mono">561</td>
                <td className="px-3 py-2">annual flow</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="px-3 py-2"><Dot assetClass="commodity" />Commodities</td>
                <td className="px-3 py-2">UN Comtrade</td>
                <td className="px-3 py-2">2023</td>
                <td className="px-3 py-2 font-mono">70</td>
                <td className="px-3 py-2">annual flow</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="px-3 py-2"><Dot assetClass="fdi" />FDI</td>
                <td className="px-3 py-2">hand-authored</td>
                <td className="px-3 py-2">&mdash;</td>
                <td className="px-3 py-2 font-mono">6</td>
                <td className="px-3 py-2"><SourceBadge kind="illustrative" /></td>
              </tr>
              <tr>
                <td className="px-3 py-2"><Dot assetClass="currency" />Currencies</td>
                <td className="px-3 py-2">hand-authored</td>
                <td className="px-3 py-2">&mdash;</td>
                <td className="px-3 py-2 font-mono">4</td>
                <td className="px-3 py-2"><SourceBadge kind="illustrative" /></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          All magnitudes are shown in billions of US dollars, rounded to $0.1bn. The map
          covers 25 major economies (600 possible directed country pairs per layer).
        </p>

        {/* ------------------------------------------------ CPIS */}
        <SectionTitle>
          <Dot assetClass="bond" />
          <Dot assetClass="equity" />
          Bonds &amp; Equities &mdash; IMF CPIS <span className="ml-2"><SourceBadge kind="real" /></span>
        </SectionTitle>
        <div className="space-y-3 text-[15px] leading-relaxed">
          <p>
            The{" "}
            <ExtLink href="https://data.imf.org/en/datasets/IMF.STA:CPIS">
              Coordinated Portfolio Investment Survey
            </ExtLink>{" "}
            is the IMF&apos;s twice-yearly census of cross-border securities ownership.
            Each participating country reports the market value of foreign stocks and
            bonds its residents hold, broken down by the country that issued them. A flow
            drawn as &ldquo;Japan &rarr; United States&rdquo; on the Bonds layer means:
            Japanese residents (institutions, funds, households) held that many dollars of
            US-issued debt securities on the survey date.
          </p>
          <p>
            These are <strong className="text-slate-200">outstanding positions, not annual
            purchases</strong> &mdash; a $1,144.8bn Japan&rarr;US bond figure is the size
            of the accumulated stockpile, which is why bond/equity numbers dwarf the trade
            numbers next to them.
          </p>
          <p className="text-slate-400">
            Fetched via the{" "}
            <ExtLink href="https://db.nomics.world/IMF/CPIS">DBnomics mirror</ExtLink>{" "}
            (series pattern{" "}
            <code className="rounded bg-white/5 px-1 font-mono text-[12px]">
              B.&#123;reporter&#125;.I_A_D_T_T_BP6_USD.T.T.&#123;counterpart&#125;
            </code>{" "}
            for debt, <code className="rounded bg-white/5 px-1 font-mono text-[12px]">I_A_E_T_T_BP6_USD</code>{" "}
            for equity), taking each pair&apos;s latest non-empty observation &mdash; mid-2024
            for ~80% of pairs, late-2023 or older for slower reporters.
          </p>
          <p>
            <strong className="text-slate-200">Known weaknesses:</strong> 20 of our 25
            countries participate; the UAE, Qatar, Vietnam, Nigeria and Kenya don&apos;t
            report, so their outbound holdings are missing entirely. More importantly,
            CPIS records the <em>custodian&apos;s</em> location when assets are held via
            third countries, and some governments simply under-report: China&apos;s
            reported US bond holdings here ($142.9bn) are far below the ~$770bn the US
            Treasury&apos;s own{" "}
            <ExtLink href="https://ticdata.treasury.gov/resource-center/data-chart-center/tic/Documents/mfh.txt">
              TIC survey
            </ExtLink>{" "}
            attributes to China, because much of it sits with custodians in Belgium and
            Luxembourg. Gulf sovereign wealth holdings are similarly understated. Treat
            small CPIS numbers for China and the Gulf as floors, not totals.
          </p>
        </div>

        {/* ------------------------------------------------ BIS */}
        <SectionTitle>
          <Dot assetClass="banking" />
          Bank Lending &mdash; BIS Locational Banking Statistics <span className="ml-2"><SourceBadge kind="real" /></span>
        </SectionTitle>
        <div className="space-y-3 text-[15px] leading-relaxed">
          <p>
            The{" "}
            <ExtLink href="https://data.bis.org/topics/LBS">
              Bank for International Settlements
            </ExtLink>{" "}
            collects quarterly data on banks&apos; cross-border positions.
            &ldquo;A &rarr; B&rdquo; here means banks located in country A hold claims
            &mdash; loans they&apos;ve extended, deposits they&apos;ve placed abroad, debt
            securities they own &mdash; on borrowers of any kind (banks, companies,
            governments) in country B. It is bank-to-country credit, not individuals&apos;
            deposits. All figures are Q4 2024 outstanding amounts, fetched via DBnomics
            (dataset <code className="rounded bg-white/5 px-1 font-mono text-[12px]">WS_LBS_D_PUB</code>).
          </p>
          <p>
            <strong className="text-slate-200">Known weaknesses:</strong> only 13 of our
            25 countries are BIS reporting jurisdictions &mdash; China, India, Russia, the
            Gulf states and most emerging markets don&apos;t report, so arrows <em>from</em>{" "}
            those countries&apos; banks are absent (they still appear as borrowers).
            Financial centers (UK, Switzerland, Netherlands, Singapore) look enormous
            partly because global banks book business through them.
          </p>
        </div>

        {/* ------------------------------------------------ DOT */}
        <SectionTitle>
          <Dot assetClass="trade" />
          Trade &mdash; IMF Direction of Trade Statistics <span className="ml-2"><SourceBadge kind="real" /></span>
        </SectionTitle>
        <div className="space-y-3 text-[15px] leading-relaxed">
          <p>
            <ExtLink href="https://data.imf.org/en/datasets/IMF.STA:DOT">DOTS</ExtLink>{" "}
            records annual merchandise exports between every pair of countries, valued
            free-on-board (FOB). &ldquo;A &rarr; B&rdquo; means goods worth that much were
            shipped from A to B during 2024. The IMF fills gaps with partner-country
            reports and estimates, which is why this layer achieves full 600/600-pair
            coverage &mdash; including the US, France, India, Switzerland and Norway,
            which the free tier of UN Comtrade (our original source) turned out to exclude
            entirely. Fetched via DBnomics, series{" "}
            <code className="rounded bg-white/5 px-1 font-mono text-[12px]">A.&#123;reporter&#125;.TXG_FOB_USD.&#123;partner&#125;</code>.
          </p>
          <p>
            <strong className="text-slate-200">Known weaknesses:</strong> two countries&apos;
            reports of the same flow rarely match (exporter FOB vs importer
            cost-insurance-freight valuations, re-exports through entrep&ocirc;ts like
            Hong Kong and the Netherlands, timing). China reports 2024 exports to the US
            of $525bn while the US records ~$439bn of imports from China &mdash; both are
            &ldquo;correct&rdquo; under their own conventions. We always plot the{" "}
            <em>exporter&apos;s</em> side of the story. One pair (Russia&rarr;Nigeria)
            only has data from 2017; the note on the arc says so.
          </p>
        </div>

        {/* ------------------------------------------------ Comtrade */}
        <SectionTitle>
          <Dot assetClass="commodity" />
          Commodities &mdash; UN Comtrade <span className="ml-2"><SourceBadge kind="real" /></span>
        </SectionTitle>
        <div className="space-y-3 text-[15px] leading-relaxed">
          <p>
            The commodity layer isolates <strong className="text-slate-200">mineral fuels
            (HS code 27: crude oil, gas, coal, refined products)</strong> for six major
            energy exporters &mdash; Saudi Arabia, UAE, Russia, Norway, Qatar and
            Australia &mdash; using the{" "}
            <ExtLink href="https://comtradeplus.un.org/">UN Comtrade</ExtLink> public API,
            2023 annual values. We prefer the importer&apos;s &ldquo;mirror&rdquo; report
            (the buyer&apos;s customs data) and fall back to the exporter&apos;s
            self-report; this matters for Russia, whose own reporting stopped being
            reliable after 2022 while China&apos;s and India&apos;s customs data still
            capture what they buy.
          </p>
          <p>
            <strong className="text-slate-200">Known weaknesses:</strong> 88 of 144
            possible exporter-partner pairs returned data (70 survive the materiality
            floor); the remainder are genuinely unreported in the free tier rather than
            zero. Sanctioned trade routed through intermediaries (e.g. Russian crude
            re-exported via third countries) shows up under the intermediary, not the
            origin.
          </p>
        </div>

        {/* ------------------------------------------------ illustrative */}
        <SectionTitle>
          <Dot assetClass="fdi" />
          <Dot assetClass="currency" />
          FDI &amp; Currencies <span className="ml-2"><SourceBadge kind="illustrative" /></span>
        </SectionTitle>
        <div className="space-y-3 text-[15px] leading-relaxed">
          <p>
            These two layers are <strong className="text-amber-400">not real
            statistics</strong>. Bilateral FDI positions exist (UNCTAD, OECD) but are
            distributed as reports and spreadsheets rather than a free machine-readable
            API, and &ldquo;petrodollar recycling&rdquo; is a real phenomenon that no
            single published series captures. Rather than silently omit two economically
            important stories, we hand-wrote 10 flows with rough, order-of-magnitude
            values based on widely reported patterns (Belt &amp; Road lending, Gulf
            surpluses into US assets). Every one is tagged{" "}
            <span className="font-mono text-[11px] uppercase text-amber-400">mock</span>{" "}
            in the side panel and{" "}
            <span className="font-mono text-[11px] uppercase text-amber-400">illustrative</span>{" "}
            in tooltips. Don&apos;t cite them.
          </p>
        </div>

        {/* ------------------------------------------------ country panel */}
        <SectionTitle>Country snapshots &mdash; World Bank</SectionTitle>
        <div className="space-y-3 text-[15px] leading-relaxed">
          <p>
            The &ldquo;Economy snapshot&rdquo; in each country&apos;s panel (GDP, growth,
            GDP per capita, population, current account) comes from the{" "}
            <ExtLink href="https://data.worldbank.org/">World Bank Open Data API</ExtLink>{" "}
            (indicators <code className="rounded bg-white/5 px-1 font-mono text-[12px]">NY.GDP.MKTP.CD</code>,{" "}
            <code className="rounded bg-white/5 px-1 font-mono text-[12px]">NY.GDP.MKTP.KD.ZG</code>,{" "}
            <code className="rounded bg-white/5 px-1 font-mono text-[12px]">NY.GDP.PCAP.CD</code>,{" "}
            <code className="rounded bg-white/5 px-1 font-mono text-[12px]">SP.POP.TOTL</code>,{" "}
            <code className="rounded bg-white/5 px-1 font-mono text-[12px]">BN.CAB.XOKA.GD.ZS</code>),
            taking each indicator&apos;s most recent available year &mdash; 2025 for most
            countries. The net creditor/debtor badge is derived from the current-account
            balance (surplus &ge; +0.5% of GDP &rarr; creditor, deficit &le; &minus;0.5%
            &rarr; debtor). The industry tags and one-line &ldquo;role in global
            capital&rdquo; descriptions are hand-written editorial summaries, not API data.
          </p>
        </div>

        {/* ------------------------------------------------ processing */}
        <SectionTitle>How the raw numbers are processed</SectionTitle>
        <ul className="list-disc space-y-2 pl-5 text-[15px] leading-relaxed">
          <li>
            <strong className="text-slate-200">Latest observation wins.</strong> For each
            country pair we take the most recent non-empty data point, so periods vary
            slightly within a layer (each flow&apos;s note states its period).
          </li>
          <li>
            <strong className="text-slate-200">Materiality floors.</strong> Positions
            under $100m (portfolio/banking) or $50m (trade/commodity) are dropped as
            reporting noise. Nothing else is filtered &mdash; there is no top-N cut in
            the data itself.
          </li>
          <li>
            <strong className="text-slate-200">Rounding.</strong> Values are converted to
            billions and rounded to one decimal.
          </li>
          <li>
            <strong className="text-slate-200">Rendering &ne; data.</strong> The global
            view draws only the ~22 largest flows per layer so the map stays readable;
            clicking a country reveals its complete set. The side panel lists everything.
          </li>
          <li>
            <strong className="text-slate-200">Visual encoding.</strong> Line width and
            particle size scale with the square root of magnitude, so a flow 4&times;
            larger looks 2&times; thicker &mdash; linear scaling would make everything
            except China&rarr;US invisible.
          </li>
        </ul>

        {/* ------------------------------------------------ sanity checks */}
        <SectionTitle>Sanity checks against independent references</SectionTitle>
        <p className="mb-3 text-[15px] leading-relaxed">
          A few of the map&apos;s figures compared with independently published numbers,
          so you can judge the credibility yourself:
        </p>
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] font-mono text-[11px] uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2">Figure on the map</th>
                <th className="px-3 py-2">Independent reference</th>
                <th className="px-3 py-2">Verdict</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              <tr className="border-b border-white/5">
                <td className="px-3 py-2">Japan holds $1,144.8bn of US debt securities</td>
                <td className="px-3 py-2">US Treasury TIC: Japan ~$1.1tn in Treasuries alone (2024)</td>
                <td className="px-3 py-2 text-emerald-400">consistent</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="px-3 py-2">China &rarr; US goods exports $525.2bn (2024)</td>
                <td className="px-3 py-2">China customs ~$525bn; US Census records ~$439bn of imports (FOB/CIF &amp; re-export gap)</td>
                <td className="px-3 py-2 text-emerald-400">matches exporter side</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="px-3 py-2">Mexico &rarr; US goods exports $512.7bn (2024)</td>
                <td className="px-3 py-2">US Census: ~$506bn imports from Mexico (2024)</td>
                <td className="px-3 py-2 text-emerald-400">consistent</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="px-3 py-2">Russia &rarr; China mineral fuels $94.8bn (2023)</td>
                <td className="px-3 py-2">Chinese customs: ~$95bn of Russian energy imports (2023)</td>
                <td className="px-3 py-2 text-emerald-400">consistent</td>
              </tr>
              <tr>
                <td className="px-3 py-2">China holds $142.9bn of US debt securities</td>
                <td className="px-3 py-2">US TIC attributes ~$770bn to China (2024)</td>
                <td className="px-3 py-2 text-amber-400">known CPIS undercount &mdash; custodial holdings</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Reference values are approximate public figures for comparison, not part of the dataset.
        </p>

        {/* ------------------------------------------------ reading guide */}
        <SectionTitle>How to read the numbers responsibly</SectionTitle>
        <ul className="list-disc space-y-2 pl-5 text-[15px] leading-relaxed">
          <li>
            <strong className="text-slate-200">Don&apos;t add layers together.</strong>{" "}
            Bonds, equities and bank claims are accumulated <em>stocks</em>; trade and
            commodities are <em>annual flows</em>. Summing them is a category error.
          </li>
          <li>
            <strong className="text-slate-200">A&rarr;B and B&rarr;A are different
            facts,</strong> not double counting: Japan holding US bonds and the US holding
            Japanese bonds are two separate positions, and both are drawn.
          </li>
          <li>
            <strong className="text-slate-200">Financial centers inflate.</strong> The
            Netherlands, Singapore, the UK, Switzerland and Luxembourg-adjacent hubs
            intermediate other people&apos;s money; their arrows overstate their own
            economies&apos; positions.
          </li>
          <li>
            <strong className="text-slate-200">Missing arrow &ne; zero.</strong> An absent
            flow usually means the country doesn&apos;t report to that survey, not that
            nothing moves between them.
          </li>
          <li>
            <strong className="text-slate-200">Periods differ by layer</strong> (mid-2024
            portfolio, Q4-2024 banking, 2024 trade, 2023 commodities), so this is a
            composite snapshot, not a single moment.
          </li>
        </ul>

        {/* ------------------------------------------------ reproduce */}
        <SectionTitle>Reproduce it yourself</SectionTitle>
        <div className="space-y-3 text-[15px] leading-relaxed">
          <p>
            Every number can be regenerated from public, keyless APIs with the scripts in{" "}
            <code className="rounded bg-white/5 px-1 font-mono text-[12px]">scripts/</code>{" "}
            in the{" "}
            <ExtLink href="https://github.com/jkl1213/world-map-of-capital">
              repository
            </ExtLink>
            :
          </p>
          <ul className="list-disc space-y-1.5 pl-5 font-mono text-[13px] text-slate-400">
            <li>fetch-real-data.mjs &mdash; CPIS bonds/equities + BIS banking via DBnomics</li>
            <li>fetch-dot-trade.mjs &mdash; IMF DOT trade, all 600 pairs</li>
            <li>fetch-trade-corrected.mjs &mdash; UN Comtrade HS27 commodities (resumable)</li>
            <li>fetch-country-profiles.mjs &mdash; World Bank country indicators</li>
            <li>build-flows.mjs &mdash; applies floors, rounding, and source notes</li>
          </ul>
          <p className="text-slate-400">
            Raw API responses are checked into{" "}
            <code className="rounded bg-white/5 px-1 font-mono text-[12px]">scripts/output/</code>{" "}
            so you can diff what the app shows against what the sources returned.
          </p>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 pb-4">
          <Link
            href="/"
            className="font-mono text-xs text-slate-500 hover:text-slate-300"
          >
            &larr; back to the map
          </Link>
        </div>
      </div>
    </div>
  );
}
