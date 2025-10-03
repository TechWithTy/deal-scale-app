import type { ScoreCard } from "external/ai-summary-expandable/components";
import {
	clampScore,
	formatCurrency,
	formatNumber,
	formatPercent,
} from "./utils";
import type { LeadSummaryMetrics, SummaryPayload } from "./types";

const wholesalerTier = (score: number) =>
	score >= 70 ? "High" : score >= 50 ? "Medium" : "Low";
const rentalStrength = (yieldPct: number | null) =>
	yieldPct != null && yieldPct >= 6
		? "strong"
		: yieldPct != null && yieldPct >= 4
			? "moderate"
			: "weak";
const acquisitionRisk = (spreadPct: number | null) =>
	spreadPct == null
		? "moderate"
		: spreadPct <= 20
			? "low"
			: spreadPct <= 40
				? "moderate"
				: "high";

interface BuildPayloadArgs {
	metrics: LeadSummaryMetrics;
	location: string;
	trendText: string;
}

const buildInvestorCards = (
	metrics: LeadSummaryMetrics,
	trendText: string,
): ScoreCard[] => [
	{
		title: "Rental Performance",
		subTitle: "Cash flow strength",
		description: `${formatCurrency(metrics.rent.average)} avg rent • Yield ${formatPercent(
			metrics.rent.yieldPct,
		)}\nRental DOM ${formatNumber(metrics.rent.medianDom)} days (${metrics.rent.turnover})`,
		score:
			metrics.rent.yieldPct != null
				? clampScore(metrics.rent.yieldPct * 10)
				: undefined,
	},
	{
		title: "Price Stability",
		subTitle: "Median pricing",
		description: `${formatCurrency(metrics.price.median)} median • Trend ${trendText}`,
		score:
			metrics.price.trendPct != null
				? clampScore(60 - Math.abs(metrics.price.trendPct) * 2)
				: undefined,
	},
	{
		title: "Risk Profile",
		subTitle: "Spread & DOM range",
		description: `Spread ${formatPercent(metrics.spreadPct)} • DOM ${formatNumber(metrics.dom.min)}–${formatNumber(
			metrics.dom.max,
		)} days`,
		score:
			metrics.spreadPct != null
				? clampScore(80 - Math.max(metrics.spreadPct - 15, 0) * 1.2)
				: undefined,
	},
];

const buildWholesalerCards = (metrics: LeadSummaryMetrics): ScoreCard[] => [
	{
		title: "Exit Velocity",
		subTitle: "Fastest DOM",
		description: `${metrics.propertyTypes.fastest?.type ?? "Segment"}: ${formatNumber(
			metrics.propertyTypes.fastest?.medianDom ?? null,
		)} days`,
		score:
			metrics.propertyTypes.fastest?.medianDom != null
				? clampScore(110 - metrics.propertyTypes.fastest.medianDom)
				: undefined,
	},
	{
		title: "Margin Spread",
		subTitle: "Entry vs. median",
		description: `${formatCurrency(metrics.price.min)} → ${formatCurrency(metrics.price.median)} (${formatPercent(
			metrics.spreadPct,
		)})`,
		score:
			metrics.spreadPct != null
				? clampScore(50 + metrics.spreadPct)
				: undefined,
	},
	{
		title: "Inventory Pulse",
		subTitle: "Fresh listings",
		description: `${metrics.inventory.newListings} new • ${formatPercent(metrics.inventory.newListingRatio)} of supply`,
		score: clampScore(40 + metrics.inventory.newListingRatio),
	},
];

const buildBuyerCards = (metrics: LeadSummaryMetrics): ScoreCard[] => [
	{
		title: "Affordability",
		subTitle: "Rent-to-price",
		description: `Rent ${formatCurrency(metrics.rent.median)} • Index ${formatPercent(
			metrics.affordabilityIndex,
		)}`,
		score:
			metrics.affordabilityIndex != null
				? clampScore(120 - metrics.affordabilityIndex * 2)
				: undefined,
	},
	{
		title: "Market Balance",
		subTitle: "Median DOM",
		description: `${formatNumber(metrics.dom.median)} days • ${metrics.buyerMarket} market`,
		score:
			metrics.dom.median != null
				? clampScore(90 - Math.max(45 - metrics.dom.median, 0))
				: undefined,
	},
	{
		title: "Listing Choice",
		subTitle: "Fresh supply",
		description: `${metrics.inventory.newListings} new • ${metrics.inventory.totalListings} active`,
		score: clampScore(40 + metrics.inventory.newListingRatio),
	},
];

export const buildSummaryPayloads = ({
	metrics,
	location,
	trendText,
}: BuildPayloadArgs) => {
	const investorTop =
		metrics.propertyTypes.topForInvestors?.type ?? "No clear leader";
	const wholesalerTierLabel = wholesalerTier(
		metrics.sentiments.wholesaler.score,
	);
	const marginRange =
		metrics.spreadPct != null
			? `${formatPercent(Math.max(metrics.spreadPct - 5, 5))}–${formatPercent(metrics.spreadPct)}`
			: "N/A";
	const avoidLabel = metrics.propertyTypes.slowest?.type ?? "slower segments";
	const avoidDom = formatNumber(
		metrics.propertyTypes.slowest?.medianDom ?? null,
	);
	const bestBuyerType =
		metrics.propertyTypes.bestForAffordability?.type ??
		"mainstream property types";
	const bestBuyerPrice = formatCurrency(
		metrics.propertyTypes.bestForAffordability?.medianPrice ??
			metrics.price.median ??
			null,
	);
	const bestBuyerDom = formatNumber(
		metrics.propertyTypes.bestForAffordability?.medianDom ??
			metrics.dom.median ??
			null,
	);

	const investorCopy = `Investor Sentiment for ${location} is ${metrics.sentiments.investor.tone}
with an overall score of ${metrics.sentiments.investor.score}/100.

- **Rental Performance:** Average rent is ${formatCurrency(metrics.rent.average)}, with a yield of ${formatPercent(
		metrics.rent.yieldPct,
	)}. Median rental DOM is ${formatNumber(metrics.rent.medianDom)} days, suggesting ${metrics.rent.turnover} tenant turnover.
- **Price Stability:** Median home price is ${formatCurrency(metrics.price.median)}, ${trendText} from last month.
- **Risk Signals:** Price volatility ranges from ${formatCurrency(metrics.price.min)} to ${formatCurrency(
		metrics.price.max,
	)}. Days on Market range from ${formatNumber(metrics.dom.min)} to ${formatNumber(metrics.dom.max)} days.

AI Takeaway: For investors, ${location} currently offers ${rentalStrength(metrics.rent.yieldPct)} rental stability with ${acquisitionRisk(
		metrics.spreadPct,
	)} acquisition risk.
Top property class: ${investorTop}.
`;

	const wholesalerCopy = `Wholesaler Opportunity Score for ${location} is ${metrics.sentiments.wholesaler.score}/100 → ${wholesalerTierLabel}.

- **Speed to Exit:** Median DOM is ${formatNumber(metrics.dom.median)}. Fastest turnover is in ${
		metrics.propertyTypes.fastest?.type ?? "the leading segment"
	} at ${formatNumber(metrics.propertyTypes.fastest?.medianDom ?? null)} days.
- **Price Gaps:** Entry deals start at ${formatCurrency(metrics.price.min)}, while median sales close at ${formatCurrency(
		metrics.price.median,
	)}. Spread = ${formatPercent(metrics.spreadPct)}.
- **New Inventory:** ${metrics.inventory.newListings} new listings this month, with total available = ${
		metrics.inventory.totalListings
	}.

AI Takeaway: Wholesalers should target ${investorTop} assets, where deals are moving quickly. Expect ${marginRange} margin opportunities based on current spread. Avoid ${avoidLabel}, which lingers on market for ${avoidDom} days.
`;

	const buyerCopy = `Buyer Sentiment in ${location} is ${metrics.sentiments.buyer.tone}
with an overall score of ${metrics.sentiments.buyer.score}/100.

- **Affordability:** Median home price is ${formatCurrency(metrics.price.median)}. Median rent is ${formatCurrency(
		metrics.rent.median,
	)}, placing affordability index at ${formatPercent(metrics.affordabilityIndex)}.
- **Market Activity:** Homes are spending ${formatNumber(metrics.dom.median)} days on market. Shorter DOM = stronger demand and possible bidding wars.
- **Choice of Listings:** ${metrics.inventory.newListings} new listings entered market this month, bringing total to ${
		metrics.inventory.totalListings
	}.

AI Takeaway: Buyers in ${location} face a ${metrics.buyerMarket.toLowerCase()} market. ${bestBuyerType} at median ${bestBuyerPrice} with ${bestBuyerDom} DOM represents the best option for affordability. Negotiation power is ${metrics.negotiationPower.toLowerCase()} based on current turnover speed.
`;

	const investorSection: SummaryPayload = {
		section: {
			title: `Investor Summary — ${location}`,
			description: `${metrics.inventory.totalListings || "No"} listings analyzed for rental and pricing signals`,
			overallScore: metrics.sentiments.investor.score,
			headerBand: { leftLabel: "Higher Risk", rightLabel: "Higher Stability" },
			features: [
				`Top class: ${investorTop}`,
				`Yield: ${formatPercent(metrics.rent.yieldPct)}`,
				`Spread: ${formatPercent(metrics.spreadPct)}`,
			],
			cards: buildInvestorCards(metrics, trendText),
		},
		copy: investorCopy,
	};

	const wholesalerSection: SummaryPayload = {
		section: {
			title: `Wholesaler Summary — ${location}`,
			description: `${metrics.inventory.totalListings || "No"} opportunities scanned for spreads and velocity`,
			overallScore: metrics.sentiments.wholesaler.score,
			headerBand: {
				leftLabel: "Lower Exit Confidence",
				rightLabel: "Higher Exit Confidence",
			},
			features: [
				`Fastest: ${metrics.propertyTypes.fastest?.type ?? "N/A"}`,
				`Spread: ${formatPercent(metrics.spreadPct)}`,
				`Fresh supply: ${formatPercent(metrics.inventory.newListingRatio)}`,
			],
			cards: buildWholesalerCards(metrics),
		},
		copy: wholesalerCopy,
	};

	const buyerSection: SummaryPayload = {
		section: {
			title: `Buyer / Agent Summary — ${location}`,
			description: `${metrics.inventory.totalListings || "No"} listings summarized for affordability and competition`,
			overallScore: metrics.sentiments.buyer.score,
			headerBand: {
				leftLabel: "Buyer Advantage",
				rightLabel: "Seller Advantage",
			},
			features: [
				`${metrics.buyerMarket} market`,
				`Negotiation: ${metrics.negotiationPower}`,
				`Inventory refresh: ${formatPercent(metrics.inventory.newListingRatio)}`,
			],
			cards: buildBuyerCards(metrics),
		},
		copy: buyerCopy,
	};

	return {
		investor: investorSection,
		wholesaler: wholesalerSection,
		buyer: buyerSection,
	};
};
