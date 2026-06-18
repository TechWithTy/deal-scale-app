import type { BuyBox, CashBuyerProfile } from "@/types/_dashboard/leads";
import React from "react";
import type { DemoLead } from "./types";

function formatCurrency(value?: number) {
	if (typeof value !== "number") {
		return "-";
	}

	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: 0,
	}).format(value);
}

function formatRange(min?: number, max?: number, formatter = String) {
	if (typeof min === "number" && typeof max === "number") {
		return `${formatter(min)} - ${formatter(max)}`;
	}
	if (typeof min === "number") {
		return `${formatter(min)}+`;
	}
	if (typeof max === "number") {
		return `Up to ${formatter(max)}`;
	}
	return "-";
}

function joinValues(values?: string[]) {
	return values?.filter(Boolean).join(", ") || "-";
}

function formatPersona(value: string) {
	return value
		.split("-")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}

function DetailItem({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-md border border-border bg-background/70 p-3">
			<p className="text-muted-foreground text-xs">{label}</p>
			<p className="mt-1 break-words font-medium text-sm">{value}</p>
		</div>
	);
}

function TagList({ label, values }: { label: string; values?: string[] }) {
	if (!values?.length) {
		return null;
	}

	return (
		<div className="space-y-2">
			<p className="font-medium text-muted-foreground text-xs">{label}</p>
			<div className="flex flex-wrap gap-1.5">
				{values.map((value) => (
					<span
						key={value}
						className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700 text-xs dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
					>
						{value}
					</span>
				))}
			</div>
		</div>
	);
}

function getMarketSummary(buyBox?: BuyBox) {
	const parts = [
		joinValues(buyBox?.cities),
		joinValues(buyBox?.counties),
		joinValues(buyBox?.states),
	].filter((part) => part !== "-");

	return parts.join(" | ") || "-";
}

export function getCashBuyerProfileSummary(profile?: CashBuyerProfile) {
	if (!profile) {
		return null;
	}

	return {
		budget: formatRange(profile.budgetMin, profile.budgetMax, formatCurrency),
		price: formatRange(
			profile.buyBox?.priceMin,
			profile.buyBox?.priceMax,
			formatCurrency,
		),
		bedrooms: formatRange(
			profile.buyBox?.bedroomsMin,
			profile.buyBox?.bedroomsMax,
		),
		bathrooms: formatRange(
			profile.buyBox?.bathroomsMin,
			profile.buyBox?.bathroomsMax,
		),
		sqft: formatRange(
			profile.buyBox?.sqftMin,
			profile.buyBox?.sqftMax,
			(value) => value.toLocaleString(),
		),
		markets: getMarketSummary(profile.buyBox),
		zipCodes: joinValues(profile.buyBox?.zipCodes),
		propertyTypes: joinValues(profile.buyBox?.propertyTypes),
		occupancy: profile.buyBox?.occupancy ?? "-",
	};
}

export function CashBuyerProfilePanel({ lead }: { lead: DemoLead }) {
	const profile = lead.cashBuyerProfile;
	const summary = getCashBuyerProfileSummary(profile);

	if (!profile || !summary) {
		return null;
	}

	return (
		<div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900 dark:bg-emerald-950/20">
			<div className="mb-4 flex flex-wrap items-start justify-between gap-3">
				<div>
					<p className="font-semibold text-emerald-800 text-sm dark:text-emerald-200">
						Cash Buyer Buy Box
					</p>
					<p className="text-muted-foreground text-xs">
						Investment criteria, budget, strategy, and preferred markets.
					</p>
				</div>
				<span className="rounded-full border border-emerald-300 bg-background px-2.5 py-1 font-medium text-emerald-700 text-xs dark:border-emerald-800 dark:text-emerald-300">
					{lead.leadCategory === "cash-buyers" ? "Cash Buyer" : "Buyer"}
				</span>
			</div>

			<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
				<DetailItem label="Budget" value={summary.budget} />
				<DetailItem label="Target Price" value={summary.price} />
				<DetailItem label="Markets" value={summary.markets} />
				<DetailItem label="Zip Codes" value={summary.zipCodes} />
				<DetailItem label="Property Types" value={summary.propertyTypes} />
				<DetailItem label="Occupancy" value={summary.occupancy} />
				<DetailItem label="Bedrooms" value={summary.bedrooms} />
				<DetailItem label="Bathrooms" value={summary.bathrooms} />
				<DetailItem label="Square Feet" value={summary.sqft} />
			</div>

			<div className="mt-4 grid gap-4 md:grid-cols-2">
				<TagList
					label="Buyer Personas"
					values={profile.buyerPersonas?.map(formatPersona)}
				/>
				<TagList label="Strategies" values={profile.strategies} />
			</div>

			{profile.buyBox?.notes ? (
				<div className="mt-4 rounded-md border border-border bg-background/80 p-3">
					<p className="font-medium text-muted-foreground text-xs">
						Buy Box Notes
					</p>
					<p className="mt-1 text-sm">{profile.buyBox.notes}</p>
				</div>
			) : null}
		</div>
	);
}
