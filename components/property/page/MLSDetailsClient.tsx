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
		let list_date = "N/A";
		let list_price: number = 0;
		let sold_price: number = 0;
		let status = "N/A";
		let property_url = "#";

		const premiumSample = (mockRentCastMappedProperties || [])[0] as
			| RentCastProperty
			| undefined;

		if (marketView === "on_default" && isRealtorProperty(property)) {
			// Free/default uses Realtor metadata
			mls = property.metadata.mls || "N/A";
			mls_id = property.metadata.mlsId || "N/A";
			list_date = property.metadata.listDate || "N/A";
			list_price = property.metadata.listPrice ?? 0;
			sold_price = 0;
			status = property.metadata.status || "N/A";
		} else if (marketView === "on_premium") {
			// Premium uses RentCast listing snapshot if available
			const rc: RentCastProperty | undefined = isRentCastProperty(property)
				? property
				: premiumSample;
			const listing = rc?.listing;
			mls = listing?.mlsName || "N/A";
			mls_id = listing?.mlsNumber || "N/A";
			list_date = listing?.listedDate || "N/A";
			list_price = listing?.price ?? 0;
			sold_price = 0;
			status = listing?.status || "Inactive";
		} else if (marketView === "off") {
			// Off-market view shows last known sale when available (RentCast)
			const rc: RentCastProperty | undefined = isRentCastProperty(property)
				? property
				: premiumSample;
			status = "Inactive";
			sold_price = rc?.metadata.lastSalePrice ?? 0;
			list_price = 0;
			list_date = rc?.metadata.lastSaleDate || "N/A";
			mls = rc?.listing?.mlsName || "N/A";
			mls_id = rc?.listing?.mlsNumber || "N/A";
		}

		return {
			mls,
			mls_id,
			list_date,
			list_price,
			sold_price,
			status,
			property_url,
		};
	}, [marketView, property]);

	return <MLSTableComponent mlsData={mlsData} />;
}
