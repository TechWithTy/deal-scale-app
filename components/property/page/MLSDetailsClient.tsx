"use client";

import React, { useMemo } from "react";
import { usePropertyMarketView } from "@/lib/stores/property/marketView";
import type {
	Property,
	RealtorProperty,
	RentCastProperty,
} from "@/types/_dashboard/property";
import {
	isRealtorProperty,
	isRentCastProperty,
} from "@/types/_dashboard/property";
import { mockRentCastMappedProperties } from "@/constants/dashboard/rentcast_properties";
import MLSTableComponent from "./mlsData";

interface Props {
	property: Property;
}

export default function MLSDetailsClient({ property }: Props) {
	const { marketView } = usePropertyMarketView();

	const mlsData = useMemo(() => {
		// Defaults
		let mls = "N/A";
		let mls_id = "N/A";
		let list_date_raw: string | null | undefined = null;
		let list_price = 0;
		let sold_price = 0;
		let status = "N/A";
		const property_url = "#";
		let days_on_market: number | undefined;
		let county: string | undefined;
		let date_label: string | undefined;
		let listing_type: string | undefined;
		let created_date_raw: string | null | undefined;
		let last_seen_date_raw: string | null | undefined;
		let state_fips: string | undefined;
		let county_fips: string | undefined;

		const fmtDate = (iso?: string | null) =>
			iso ? new Date(iso).toLocaleDateString("en-US") : "N/A";

		const premiumSample = (mockRentCastMappedProperties || [])[0] as
			| RentCastProperty
			| undefined;

		if (marketView === "on_default" && isRealtorProperty(property)) {
			// Free/default uses Realtor metadata
			mls = property.metadata.mls || "N/A";
			mls_id = property.metadata.mlsId || "N/A";
			list_date_raw = property.metadata.listDate || null;
			list_price = property.metadata.listPrice ?? 0;
			sold_price = 0;
			status = property.metadata.status || "N/A";
			date_label = "List Date";
		} else if (marketView === "on_premium") {
			// Premium uses RentCast listing snapshot if available
			const rc: RentCastProperty | undefined = isRentCastProperty(property)
				? property
				: premiumSample;
			const listing = rc?.listing;
			mls = listing?.mlsName || "N/A";
			mls_id = listing?.mlsNumber || "N/A";
			list_date_raw = listing?.listedDate || null;
			list_price = listing?.price ?? 0;
			sold_price = 0;
			status = listing?.status || "Inactive";
			days_on_market = listing?.daysOnMarket ?? undefined;
			county = listing?.county || undefined;
			date_label = "List Date";
			listing_type = listing?.listingType || undefined;
			created_date_raw = listing?.createdDate || undefined;
			last_seen_date_raw = listing?.lastSeenDate || undefined;
			state_fips = listing?.stateFips || undefined;
			county_fips = listing?.countyFips || undefined;
		} else if (marketView === "off") {
			// Off-market view shows last known sale when available (RentCast)
			const rc: RentCastProperty | undefined = isRentCastProperty(property)
				? property
				: premiumSample;
			status = "Inactive";
			sold_price = rc?.metadata.lastSalePrice ?? 0;
			list_price = 0;
			list_date_raw = rc?.metadata.lastSaleDate || null;
			mls = rc?.listing?.mlsName || "N/A";
			mls_id = rc?.listing?.mlsNumber || "N/A";
			county = rc?.listing?.county || undefined;
			date_label = "Last Sale Date";
			listing_type = rc?.listing?.listingType || undefined;
			created_date_raw = rc?.listing?.createdDate || undefined;
			last_seen_date_raw = rc?.listing?.lastSeenDate || undefined;
			state_fips = rc?.listing?.stateFips || undefined;
			county_fips = rc?.listing?.countyFips || undefined;
		}

		return {
			mls,
			mls_id,
			list_date: fmtDate(list_date_raw),
			list_price,
			sold_price,
			status,
			property_url,
			days_on_market,
			county,
			date_label,
			listing_type,
			created_date: fmtDate(created_date_raw),
			last_seen_date: fmtDate(last_seen_date_raw),
			state_fips,
			county_fips,
		};
	}, [marketView, property]);

	// When premium, surface history and contacts
	const premiumContext = useMemo(() => {
		if (marketView !== "on_premium") return undefined;
		const premiumSample = (mockRentCastMappedProperties || [])[0] as
			| RentCastProperty
			| undefined;
		const rc: RentCastProperty | undefined = isRentCastProperty(property)
			? property
			: premiumSample;
		return rc?.listing;
	}, [marketView, property]);

	return (
		<>
			<MLSTableComponent mlsData={mlsData} />
			{(premiumContext?.listingAgent ||
				premiumContext?.listingOffice ||
				premiumContext?.builder) && (
				<div className="mt-4 rounded-lg bg-card p-6 text-card-foreground shadow-md">
					<h3 className="mb-4 font-semibold text-foreground text-lg">
						Contacts
					</h3>
					<div className="grid gap-4 sm:grid-cols-2">
						{premiumContext?.listingAgent && (
							<div>
								<p className="font-semibold text-muted-foreground">
									Listing Agent
								</p>
								<p className="text-foreground">
									{premiumContext.listingAgent.name || "-"}
								</p>
								<p className="text-foreground">
									{premiumContext.listingAgent.phone || "-"}
								</p>
								<p className="text-foreground">
									{premiumContext.listingAgent.email || "-"}
								</p>
								{premiumContext.listingAgent.website && (
									<a
										href={premiumContext.listingAgent.website}
										target="_blank"
										rel="noopener noreferrer"
										className="text-primary"
									>
										Website
									</a>
								)}
							</div>
						)}
						{premiumContext?.listingOffice && (
							<div>
								<p className="font-semibold text-muted-foreground">
									Listing Office
								</p>
								<p className="text-foreground">
									{premiumContext.listingOffice.name || "-"}
								</p>
								<p className="text-foreground">
									{premiumContext.listingOffice.phone || "-"}
								</p>
								<p className="text-foreground">
									{premiumContext.listingOffice.email || "-"}
								</p>
								{premiumContext.listingOffice.website && (
									<a
										href={premiumContext.listingOffice.website}
										target="_blank"
										rel="noopener noreferrer"
										className="text-primary"
									>
										Website
									</a>
								)}
							</div>
						)}
						{premiumContext?.builder && (
							<div>
								<p className="font-semibold text-muted-foreground">Builder</p>
								<p className="text-foreground">
									{premiumContext.builder.name || "-"}
								</p>
								<p className="text-foreground">
									{premiumContext.builder.development || "-"}
								</p>
								<p className="text-foreground">
									{premiumContext.builder.phone || "-"}
								</p>
								{premiumContext.builder.website && (
									<a
										href={premiumContext.builder.website}
										target="_blank"
										rel="noopener noreferrer"
										className="text-primary"
									>
										Website
									</a>
								)}
							</div>
						)}
					</div>
				</div>
			)}
		</>
	);
}
