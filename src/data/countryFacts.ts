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
};
