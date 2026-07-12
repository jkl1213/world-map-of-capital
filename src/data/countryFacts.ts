// Hand-authored, slow-changing economic structure facts per country: major industries and a
// one-line role in the global capital system. Quantitative macro figures live in
// countryProfiles.generated.json (World Bank API); these qualitative facts have no clean
// free API source, so they are curated here.

export interface CountryFacts {
  industries: string[];
  /** one-line description of this economy's role in global capital flows */
  capitalRole: string;
}

export const countryFacts: Record<string, CountryFacts> = {
  US: {
    industries: ["Technology", "Financial services", "Healthcare", "Aerospace & defense", "Energy"],
    capitalRole: "Issuer of the world's reserve currency and deepest capital markets; absorbs the bulk of global savings.",
  },
  CN: {
    industries: ["Manufacturing & electronics", "Construction", "E-commerce & tech", "Steel & materials", "Automotive & EVs"],
    capitalRole: "World's factory and largest trading nation; recycles trade surpluses into overseas lending and investment.",
  },
  JP: {
    industries: ["Automotive", "Electronics & robotics", "Machinery", "Pharmaceuticals", "Financial services"],
    capitalRole: "World's largest net creditor; decades of surpluses fund vast holdings of foreign bonds and loans.",
  },
  DE: {
    industries: ["Automotive", "Industrial machinery", "Chemicals", "Pharmaceuticals", "Engineering"],
    capitalRole: "Europe's export powerhouse; persistent surpluses make it a major capital exporter within the EU and beyond.",
  },
  GB: {
    industries: ["Financial services", "Professional services", "Pharmaceuticals", "Aerospace", "Creative industries"],
    capitalRole: "Global financial entrepôt; London intermediates capital flows far larger than the domestic economy.",
  },
  FR: {
    industries: ["Aerospace", "Luxury goods", "Agriculture & food", "Energy & nuclear", "Banking & insurance"],
    capitalRole: "Core eurozone economy with globally active banks and multinationals.",
  },
  CA: {
    industries: ["Oil & gas", "Mining & minerals", "Financial services", "Agriculture", "Forestry"],
    capitalRole: "Resource exporter deeply integrated with US markets; large pension funds invest globally.",
  },
  IN: {
    industries: ["IT services & outsourcing", "Pharmaceuticals", "Textiles", "Agriculture", "Steel & manufacturing"],
    capitalRole: "Fast-growing magnet for foreign portfolio and direct investment; runs persistent trade deficits.",
  },
  BR: {
    industries: ["Agriculture & soy", "Mining & iron ore", "Oil & gas", "Aerospace", "Financial services"],
    capitalRole: "Latin America's largest economy; commodity exporter reliant on foreign portfolio inflows.",
  },
  SA: {
    industries: ["Oil & petrochemicals", "Construction", "Finance (sovereign wealth)", "Tourism (growing)"],
    capitalRole: "Swing oil producer; petrodollar surpluses recycled into global assets via its sovereign wealth fund.",
  },
  AE: {
    industries: ["Oil & gas", "Trade & logistics", "Financial services", "Real estate", "Tourism"],
    capitalRole: "Gulf trade and finance hub; energy surpluses fund some of the world's largest sovereign funds.",
  },
  RU: {
    industries: ["Oil & gas", "Metals & mining", "Defense", "Agriculture & grain"],
    capitalRole: "Energy exporter largely cut off from Western capital since 2022; trade re-routed toward Asia.",
  },
  KR: {
    industries: ["Semiconductors", "Automotive", "Shipbuilding", "Electronics", "Steel & chemicals"],
    capitalRole: "Advanced manufacturing exporter; national pension fund is a major global investor.",
  },
  SG: {
    industries: ["Financial services", "Trade & logistics", "Electronics", "Petrochemical refining", "Biotech"],
    capitalRole: "Asia's capital-routing hub; intermediates investment flows across Southeast Asia and beyond.",
  },
  CH: {
    industries: ["Banking & wealth management", "Pharmaceuticals", "Precision instruments", "Commodities trading"],
    capitalRole: "Global wealth-management center and safe-haven currency; large external asset position.",
  },
  NL: {
    industries: ["Trade & logistics", "Agriculture & food tech", "Energy trading", "Semiconductor equipment", "Finance"],
    capitalRole: "Major conduit economy: holding companies route FDI and portfolio capital worldwide.",
  },
  MX: {
    industries: ["Automotive & auto parts", "Electronics assembly", "Oil", "Agriculture", "Tourism"],
    capitalRole: "Nearshoring hub wired into US supply chains; remittances and FDI are key inflows.",
  },
  ID: {
    industries: ["Nickel & mining", "Palm oil & agriculture", "Textiles", "Digital economy", "Energy"],
    capitalRole: "Commodity-rich emerging market courting foreign investment in processing and EV supply chains.",
  },
  VN: {
    industries: ["Electronics assembly", "Textiles & footwear", "Agriculture & seafood", "Furniture"],
    capitalRole: "Fast-rising manufacturing base absorbing supply chains shifting out of China.",
  },
  NG: {
    industries: ["Oil & gas", "Agriculture", "Telecom & fintech", "Trade"],
    capitalRole: "Africa's largest oil economy; capital inflows dominated by energy investment and diaspora remittances.",
  },
  ZA: {
    industries: ["Mining (gold, platinum)", "Financial services", "Manufacturing", "Agriculture"],
    capitalRole: "Africa's most developed capital market; gateway for portfolio flows into the continent.",
  },
  AU: {
    industries: ["Iron ore & mining", "LNG & coal", "Agriculture", "Financial services", "Education exports"],
    capitalRole: "Commodity supplier to Asia; superannuation funds make it a sizeable capital exporter.",
  },
  QA: {
    industries: ["LNG & gas", "Petrochemicals", "Finance (sovereign wealth)", "Construction"],
    capitalRole: "Top LNG exporter; gas revenues recycled globally through its sovereign wealth fund.",
  },
  NO: {
    industries: ["Oil & gas", "Fisheries & seafood", "Shipping", "Hydropower"],
    capitalRole: "Petroleum surpluses feed the world's largest sovereign wealth fund, invested across global markets.",
  },
  KE: {
    industries: ["Agriculture (tea, coffee)", "Tourism", "Telecom & mobile money", "Horticulture"],
    capitalRole: "East Africa's commercial hub; infrastructure financed heavily by external lending.",
  },
  IT: {
    industries: ["Machinery & manufacturing", "Fashion & luxury", "Automotive", "Food & wine", "Banking"],
    capitalRole: "Eurozone's third economy; large public debt held substantially by foreign investors.",
  },
  ES: {
    industries: ["Tourism", "Automotive", "Renewable energy", "Banking", "Agriculture & food"],
    capitalRole: "Major eurozone economy whose banks are deeply invested across Latin America.",
  },
  SE: {
    industries: ["Industrial machinery", "Telecom & tech", "Automotive", "Pharmaceuticals", "Forestry"],
    capitalRole: "Export-driven surplus economy; pension capital and multinationals invest heavily abroad.",
  },
  BE: {
    industries: ["Chemicals & pharma", "Logistics (Antwerp)", "Finance & clearing", "Food processing"],
    capitalRole: "Home to Euroclear: vast custodial bond holdings booked here belong economically to investors elsewhere (incl. China).",
  },
  IE: {
    industries: ["Pharmaceuticals", "Tech (EU headquarters)", "Financial services", "Agri-food"],
    capitalRole: "Low-tax base for US multinationals and investment funds; external positions vastly exceed the domestic economy.",
  },
  AT: {
    industries: ["Industrial machinery", "Banking (CEE exposure)", "Tourism", "Steel & metals"],
    capitalRole: "Vienna's banks are the main lenders to Central and Eastern Europe.",
  },
  LU: {
    industries: ["Investment funds", "Private banking", "Steel (ArcelorMittal)", "Satellites"],
    capitalRole: "World's second-largest fund domicile; custodial holdings dwarf the domestic economy thousands-fold.",
  },
  DK: {
    industries: ["Pharmaceuticals (Novo Nordisk)", "Shipping (Maersk)", "Wind energy", "Agriculture"],
    capitalRole: "Persistent surplus economy; pension funds and pharma profits flow into global assets.",
  },
  FI: {
    industries: ["Forestry & paper", "Machinery", "Telecom & tech", "Shipbuilding"],
    capitalRole: "Small open Nordic economy tightly integrated with EU capital markets.",
  },
  GR: {
    industries: ["Shipping", "Tourism", "Agriculture & food", "Energy"],
    capitalRole: "World's largest ship-owning nation; debt crisis legacy keeps it a net capital importer.",
  },
  HK: {
    industries: ["Financial services", "Trade & logistics", "Real estate", "Professional services"],
    capitalRole: "China's offshore financial gateway; intermediates a huge share of capital entering and leaving the mainland.",
  },
  PH: {
    industries: ["Business process outsourcing", "Electronics assembly", "Agriculture", "Remittance economy"],
    capitalRole: "Consumption-driven economy funded by overseas-worker remittances and services exports.",
  },
  CL: {
    industries: ["Copper & lithium mining", "Agriculture & wine", "Fisheries", "Financial services"],
    capitalRole: "World's largest copper producer; mining exports tie its fortunes to Chinese demand.",
  },
  TR: {
    industries: ["Automotive", "Textiles", "Construction", "Tourism", "Defense"],
    capitalRole: "Large emerging economy straddling Europe and Asia; chronically dependent on external financing.",
  },
  PL: {
    industries: ["Automotive & machinery", "Food processing", "IT services", "Logistics"],
    capitalRole: "Central Europe's largest economy; a top destination for EU manufacturing investment.",
  },
  PT: {
    industries: ["Tourism", "Textiles & footwear", "Renewable energy", "Agriculture & wine"],
    capitalRole: "Small open eurozone economy; post-crisis reformer attracting foreign property and fund flows.",
  },
  CZ: {
    industries: ["Automotive (Škoda)", "Machinery", "Electronics", "Beer & food"],
    capitalRole: "Export-manufacturing hub wired into the German industrial supply chain.",
  },
  HU: {
    industries: ["Automotive", "Electronics", "Pharmaceuticals", "EV batteries"],
    capitalRole: "Manufacturing base for German carmakers and, increasingly, Chinese battery plants.",
  },
  TH: {
    industries: ["Automotive assembly", "Tourism", "Electronics", "Rice & agriculture"],
    capitalRole: "Southeast Asia's second economy; auto and electronics exporter with deep Japanese investment.",
  },
  MY: {
    industries: ["Electronics & semiconductors", "Palm oil", "Oil & gas", "Islamic finance"],
    capitalRole: "Trade-intensive economy at the heart of chip supply chains; hub of Islamic finance.",
  },
  AR: {
    industries: ["Soy & grains", "Beef", "Lithium & mining", "Energy (Vaca Muerta)"],
    capitalRole: "Agricultural superpower with recurring debt crises; capital access swings with politics.",
  },
  CO: {
    industries: ["Oil & coal", "Coffee & agriculture", "Mining", "Services"],
    capitalRole: "Andean energy exporter reliant on foreign investment in extractives.",
  },
  EG: {
    industries: ["Suez Canal & logistics", "Natural gas", "Tourism", "Agriculture", "Construction"],
    capitalRole: "Strategic chokepoint economy; sustained by Gulf deposits, IMF programs and remittances.",
  },
  IL: {
    industries: ["Tech & cybersecurity", "Defense", "Pharmaceuticals", "Diamonds"],
    capitalRole: "Startup-dense economy; venture capital inflows and tech exports drive a persistent surplus.",
  },
  PK: {
    industries: ["Textiles", "Agriculture", "Remittance economy"],
    capitalRole: "Externally fragile economy cycling through IMF programs; heavily indebted to China for infrastructure.",
  },
  NZ: {
    industries: ["Dairy & agriculture", "Tourism", "Forestry", "Wine"],
    capitalRole: "Agricultural exporter dependent on Chinese demand; funds chronic deficits with foreign capital.",
  },
  KW: {
    industries: ["Oil & petrochemicals", "Finance (sovereign wealth)"],
    capitalRole: "Runs one of the world's oldest sovereign wealth funds; oil surpluses invested globally for decades.",
  },
  KZ: {
    industries: ["Oil & gas", "Uranium & mining", "Grain", "Metals"],
    capitalRole: "Central Asia's resource giant; crossroads of Chinese, Russian and Western energy investment.",
  },
};
