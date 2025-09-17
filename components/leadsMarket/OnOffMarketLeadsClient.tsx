"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeadListDataTable } from "@/components/ui/list-data-table";
import { marketColumns, type MarketRow } from "./columns";
import { mockRealtorMappedProperties } from "@/constants/dashboard/realtor_properties";
import { mockRentCastMappedProperties } from "@/constants/dashboard/rentcast_properties";
import type {
	Property,
	RealtorProperty,
	RentCastProperty,
} from "@/types/_dashboard/property";

function mapOnMarketRows(props: Property[]): MarketRow[] {
	return props
		.filter((p): p is RealtorProperty => p.source === "realtor")
		.map((p) => {
			const addr = p.address;
			const d = p.details;
			const status = p.metadata.status ?? "Active";
			const price = p.metadata.listPrice ?? null;
			const fullBaths = d.fullBaths ?? 0;
			const halfBaths = d.halfBaths ? 0.5 : 0;
			return {
				id: p.id,
				address: addr.fullStreetLine || addr.street,
				city: addr.city,
				state: addr.state,
				zip: addr.zipCode,
				beds: d.beds ?? null,
				baths: fullBaths + halfBaths,
				price,
				status,
				source: "realtor",
			} satisfies MarketRow;
		});
}

function mapOffMarketRows(props: Property[]): MarketRow[] {
	return props
		.filter((p): p is RentCastProperty => p.source === "rentcast")
		.map((p) => {
			const addr = p.address;
			const d = p.details;
			const status = p.listing?.status ?? "Inactive";
			const priceFromListing = p.listing?.price ?? null;
			const price = priceFromListing ?? p.metadata.lastSalePrice ?? null;
			const fullBaths = d.fullBaths ?? 0;
			const halfBaths = d.halfBaths ? 0.5 : 0;
			return {
				id: p.id,
				address: addr.fullStreetLine || addr.street,
				city: addr.city,
				state: addr.state,
				zip: addr.zipCode,
				beds: d.beds ?? null,
				baths: fullBaths + halfBaths,
				price,
				status,
				source: "rentcast",
			} satisfies MarketRow;
		});
}

export default function OnOffMarketLeadsClient() {
	// Mocked data sources (guarded by testing mode). Use empty arrays if disabled.
	const realtor = (mockRealtorMappedProperties || []) as Property[];
	const rentcast = (mockRentCastMappedProperties || []) as Property[];

	const onMarketRows = mapOnMarketRows(realtor);
	const offMarketRows = mapOffMarketRows(rentcast);

	return (
		<Tabs defaultValue="on" className="w-full">
			<TabsList>
				<TabsTrigger value="on">On-Market</TabsTrigger>
				<TabsTrigger value="off">Off-Market</TabsTrigger>
			</TabsList>

			<TabsContent value="on">
				<LeadListDataTable
					searchKey="address"
					columns={marketColumns}
					data={onMarketRows}
				/>
			</TabsContent>

			<TabsContent value="off">
				<LeadListDataTable
					searchKey="address"
					columns={marketColumns}
					data={offMarketRows}
				/>
			</TabsContent>
		</Tabs>
	);
}
