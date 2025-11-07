import type { Property } from "@/types/_dashboard/property";
import {
	isRealtorProperty,
	isRentCastProperty,
} from "@/types/_dashboard/property";
import { buildSummaryPayloads } from "./presenters";
import {
	computeBuyerSentiment,
	computeInvestorSentiment,
	computeWholesalerSentiment,
} from "./sentiment";
import type {
	BuildLeadSummariesOptions,
	LeadSummariesResult,
	LeadSummaryMetrics,
	PropertyTypeSnapshot,
} from "./types";
import {
	THIRTY_DAYS_MS,
	average,
	computeTrend,
	labelFromScore,
	median,
	parseDate,
	roundTo,
	toneFromScore,
} from "./utils";

interface NumericRecord {
	value: number;
	updatedAt: number;
}
interface Bucket {
	sale: number[];
	dom: number[];
	rent: number[];
	rentDom: number[];
}

const getSalePrice = (property: Property): number | null =>
	isRealtorProperty(property)
		? (property.metadata.listPrice ?? null)
		: isRentCastProperty(property) &&
				typeof property.metadata.lastSalePrice === "number"
			? property.metadata.lastSalePrice
			: null;
const getDom = (property: Property): number | null =>
	isRealtorProperty(property)
		? (property.metadata.daysOnMarket ?? null)
		: isRentCastProperty(property)
			? (property.listing?.daysOnMarket ?? null)
			: null;
const getRent = (property: Property): number | null =>
	isRentCastProperty(property) ? (property.listing?.price ?? null) : null;
const getRentDom = (property: Property): number | null =>
	isRentCastProperty(property)
		? (property.listing?.daysOnMarket ?? null)
		: null;

const turnoverLabel = (
	value: number | null,
): LeadSummaryMetrics["rent"]["turnover"] => {
	if (value == null) return "unknown";
	if (value <= 15) return "fast";
	if (value <= 45) return "steady";
	return "slow";
};
const buyerMarketLabel = (
	dom: number | null,
): LeadSummaryMetrics["buyerMarket"] => {
	if (dom == null) return "Balanced";
	if (dom >= 75) return "Buyer";
	if (dom <= 45) return "Seller";
	return "Balanced";
};
const negotiationFromMarket = (
	market: LeadSummaryMetrics["buyerMarket"],
): LeadSummaryMetrics["negotiationPower"] =>
	market === "Buyer" ? "Strong" : market === "Seller" ? "Weak" : "Moderate";

const selectByYield = (metrics: PropertyTypeSnapshot[]) =>
	metrics
		.filter((item) => item.rentalYield != null)
		.sort((a, b) => (b.rentalYield ?? 0) - (a.rentalYield ?? 0))[0] ?? null;
const selectByDomAsc = (metrics: PropertyTypeSnapshot[]) =>
	metrics
		.filter((item) => item.medianDom != null)
		.sort(
			(a, b) => (a.medianDom ?? Number.POSITIVE_INFINITY) - (b.medianDom ?? 0),
		)[0] ?? null;
const selectByDomDesc = (metrics: PropertyTypeSnapshot[]) =>
	metrics
		.filter((item) => item.medianDom != null)
		.sort((a, b) => (b.medianDom ?? 0) - (a.medianDom ?? 0))[0] ?? null;
const selectByPrice = (metrics: PropertyTypeSnapshot[]) =>
	metrics
		.filter((item) => item.medianPrice != null)
		.sort(
			(a, b) =>
				(a.medianPrice ?? Number.POSITIVE_INFINITY) - (b.medianPrice ?? 0),
		)[0] ?? null;

export function buildLeadSummaries(
	properties: Property[],
	location: string,
	options: BuildLeadSummariesOptions = {},
): LeadSummariesResult {
	const nowTs = (options.now ?? new Date()).getTime();
	const locationLabel = location.trim() || "this area";
	const priceRecords: NumericRecord[] = [];
	const domRecords: NumericRecord[] = [];
	const rentValues: number[] = [];
	const rentDomValues: number[] = [];
	const buckets = new Map<string, Bucket>();
	let newListings = 0;

	for (const property of properties) {
		const type = property.details.propertyType || "Unknown";
		if (!buckets.has(type))
			buckets.set(type, { sale: [], dom: [], rent: [], rentDom: [] });
		const bucket = buckets.get(type)!;
		const updatedAt = parseDate(
			isRealtorProperty(property) || isRentCastProperty(property)
				? property.metadata.lastUpdated
				: property.lastUpdated,
		);
		if (!Number.isNaN(updatedAt) && nowTs - updatedAt <= THIRTY_DAYS_MS)
			newListings += 1;

		const salePrice = getSalePrice(property);
		if (salePrice != null) {
			priceRecords.push({ value: salePrice, updatedAt });
			bucket.sale.push(salePrice);
		}

		const dom = getDom(property);
		if (dom != null) {
			domRecords.push({ value: dom, updatedAt });
			bucket.dom.push(dom);
		}

		const rent = getRent(property);
		if (rent != null) {
			rentValues.push(rent);
			bucket.rent.push(rent);
		}

		const rentDom = getRentDom(property);
		if (rentDom != null) {
			rentDomValues.push(rentDom);
			bucket.rentDom.push(rentDom);
		}
	}

	const saleValues = priceRecords.map((rec) => rec.value);
	const domValues = domRecords.map((rec) => rec.value);
	const averagePrice = average(saleValues);
	const medianPrice = median(saleValues);
	const minPrice = saleValues.length ? Math.min(...saleValues) : null;
	const maxPrice = saleValues.length ? Math.max(...saleValues) : null;
	const medianDomRaw = median(domValues);
	const minDomRaw = domValues.length ? Math.min(...domValues) : null;
	const maxDomRaw = domValues.length ? Math.max(...domValues) : null;
	const rentAverage = average(rentValues);
	const rentMedian = median(rentValues);
	const rentMedianDomRaw = median(rentDomValues);
	const rentMedianDom =
		rentMedianDomRaw != null ? Math.round(rentMedianDomRaw) : null;
	const rentTurnover = turnoverLabel(rentMedianDom);
	const medianDom = medianDomRaw != null ? Math.round(medianDomRaw) : null;
	const minDom = minDomRaw != null ? Math.round(minDomRaw) : null;
	const maxDom = maxDomRaw != null ? Math.round(maxDomRaw) : null;
	const rentYield =
		medianPrice && rentAverage
			? roundTo(((rentAverage * 12) / medianPrice) * 100, 1)
			: null;
	const { pct: trendPct, direction: trendDirection } = computeTrend(
		priceRecords,
		nowTs,
	);
	const spreadPct =
		medianPrice != null && minPrice != null
			? roundTo(((medianPrice - minPrice) / medianPrice) * 100, 2)
			: null;
	const totalListings = properties.length;
	const newListingRatio = totalListings
		? roundTo((newListings / totalListings) * 100, 1)
		: 0;

	const propertyTypeMetrics: PropertyTypeSnapshot[] = Array.from(
		buckets.entries(),
	).map(([type, bucket]) => {
		const medPrice = median(bucket.sale);
		const medDomTypeRaw = median(bucket.dom);
		const medDomType = medDomTypeRaw != null ? Math.round(medDomTypeRaw) : null;
		const avgRent = average(bucket.rent);
		const yieldPct =
			medPrice && avgRent
				? roundTo(((avgRent * 12) / medPrice) * 100, 1)
				: null;
		return {
			type,
			medianPrice: medPrice,
			medianDom: medDomType,
			averageRent: avgRent,
			rentalYield: yieldPct,
		};
	});
	const investorLeader =
		selectByYield(propertyTypeMetrics) ??
		selectByDomAsc(propertyTypeMetrics) ??
		null;
	const fastestType = selectByDomAsc(propertyTypeMetrics) ?? null;
	const slowestType = selectByDomDesc(propertyTypeMetrics) ?? null;
	const affordableType = selectByPrice(propertyTypeMetrics) ?? null;

	const affordabilityIndex =
		medianPrice && rentMedian
			? roundTo(((rentMedian * 12) / medianPrice) * 100, 1)
			: null;
	const buyerMarket = buyerMarketLabel(medianDom);
	const negotiationPower = negotiationFromMarket(buyerMarket);

	let investorSentiment = computeInvestorSentiment({
		yieldPct: rentYield,
		trendPct,
		medianDom: medianDomRaw,
		spreadPct,
		newListingRatio,
	});
	let wholesalerSentiment = computeWholesalerSentiment({
		spreadPct,
		fastestDom: fastestType?.medianDom ?? null,
		newListingRatio,
	});
	let buyerSentiment = computeBuyerSentiment({
		affordabilityIndex,
		medianDom: medianDomRaw,
		trendPct,
	});

	if (!totalListings) {
		const fallback = (score: number) => ({
			score,
			label: labelFromScore(score),
			tone: toneFromScore(score),
		});
		investorSentiment = fallback(50);
		wholesalerSentiment = fallback(50);
		buyerSentiment = fallback(50);
	}

	const metrics: LeadSummaryMetrics = {
		price: {
			average: averagePrice,
			median: medianPrice,
			min: minPrice,
			max: maxPrice,
			trendPct,
			trendDirection,
		},
		dom: { median: medianDom, min: minDom, max: maxDom },
		rent: {
			average: rentAverage,
			median: rentMedian,
			yieldPct: rentYield,
			medianDom: rentMedianDom,
			turnover: rentTurnover,
		},
		inventory: { newListings, totalListings, newListingRatio },
		propertyTypes: {
			topForInvestors: investorLeader,
			fastest: fastestType,
			slowest: slowestType,
			bestForAffordability: affordableType,
		},
		spreadPct,
		affordabilityIndex,
		buyerMarket,
		negotiationPower,
		sentiments: {
			investor: investorSentiment,
			wholesaler: wholesalerSentiment,
			buyer: buyerSentiment,
		},
	};

	const magnitude = trendPct != null ? Math.abs(trendPct) : null;
	const trendText =
		trendDirection === "flat"
			? "flat"
			: `${trendDirection === "up" ? "up" : "down"} ${magnitude != null ? magnitude.toFixed(2) : "0.00"}%`;

	const payloads = buildSummaryPayloads({
		metrics,
		location: locationLabel,
		trendText,
	});
	return {
		location: locationLabel,
		metrics,
		investor: payloads.investor,
		wholesaler: payloads.wholesaler,
		buyer: payloads.buyer,
	};
}
