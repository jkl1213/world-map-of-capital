import { pairKeyOf } from "@/data/flows";

// Hand-authored one-line narratives for notable capital corridors. Keyed by unordered
// country pair, so hovering any arc between the two countries surfaces the story.
const stories: [string, string, string][] = [
  ["JP", "US", "Japan is America's biggest foreign creditor: decades of trade surpluses recycled into Treasuries, US loans and Wall Street assets."],
  ["CN", "US", "The world's most consequential corridor: China's export earnings long financed US borrowing, though flows are thinning as the two economies decouple."],
  ["GB", "US", "The Wall Street-London axis is the deepest two-way finance corridor on earth - more banking and portfolio money moves here than anywhere else."],
  ["SA", "US", "Petrodollar recycling in action: Saudi oil is sold in dollars, and those dollars flow back into US bonds, equities and private assets."],
  ["RU", "CN", "Sanctions rerouted Russia's money eastward: energy is sold to China and reserves have shifted from dollars and euros toward the yuan."],
  ["CN", "NG", "Belt & Road lending: Chinese state banks finance African railways, ports and power plants, repaid over decades in cash or commodities."],
  ["CN", "KE", "Kenya's railways and highways were built largely on Chinese credit - a signature Belt & Road corridor in East Africa."],
  ["CN", "ID", "Chinese capital is building Indonesia's nickel-processing industry, locking in supply for the world's EV battery chains."],
  ["AU", "CN", "Iron ore is the anchor: Australia ships the raw material for Chinese steel, one of the largest bilateral commodity flows in the world."],
  ["DE", "US", "Germany's export surpluses don't stay home - a large share is parked in US bonds and equities, financing the American deficit."],
  ["NL", "US", "Much of this is conduit capital: multinationals route investment through Dutch holding companies for tax and legal reasons."],
  ["MX", "US", "Nearshoring corridor: factories in Mexico feed US supply chains, while remittances and FDI flow south in return."],
  ["CN", "JP", "Asia's two giants are deeply intertwined: Japanese factories and capital helped build China's export machine, and trade still dwarfs their political tensions."],
  ["GB", "QA", "Qatari gas money is a fixture of London: sovereign wealth from LNG sales is recycled into UK property, banks and blue-chip stocks."],
  ["US", "IN", "American capital is India's largest foreign backer - venture money, factory investment and Wall Street portfolio flows chasing its growth."],
  ["CH", "US", "Swiss banks and pharma giants park vast sums in US markets, while Switzerland serves as a safe-haven vault for global wealth."],
];

export const flowStories = new Map<string, string>(
  stories.map(([a, b, story]) => [pairKeyOf(a, b), story])
);
