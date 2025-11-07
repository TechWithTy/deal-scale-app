"use client";

import {
	type MarketView,
	usePropertyMarketView,
} from "@/lib/stores/property/marketView";
import type { Property } from "@/types/_dashboard/property";
import { useLayoutEffect } from "react";
import PropertyHeader from "./propertyHeader";

interface PropertyHeaderWrapperProps {
	property: Property;
	initialMarketView?: MarketView;
}

export default function PropertyHeaderWrapper({
	property,
	initialMarketView,
}: PropertyHeaderWrapperProps) {
	const { setMarketView } = usePropertyMarketView();

	useLayoutEffect(() => {
		if (initialMarketView) {
			setMarketView(initialMarketView);
		}
	}, [initialMarketView, setMarketView]);

	const handleLeadActivity = () => {
		// Handle lead activity here
		console.log("Lead activity triggered");
	};

	return (
		<PropertyHeader property={property} onLeadActivity={handleLeadActivity} />
	);
}
