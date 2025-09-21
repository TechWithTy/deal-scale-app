"use client";

import type { Property } from "@/types/_dashboard/property";
import PropertyHeader from "./propertyHeader";
import { useLayoutEffect } from "react";
import {
	usePropertyMarketView,
	type MarketView,
} from "@/lib/stores/property/marketView";

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
