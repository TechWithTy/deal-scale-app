"use client";

import type { PropertyDetails } from "@/types/_dashboard/maps";
import PropertyHeader from "./propertyHeader";

interface PropertyHeaderWrapperProps {
	property: PropertyDetails;
}

export default function PropertyHeaderWrapper({
	property,
}: PropertyHeaderWrapperProps) {
	const handleLeadActivity = () => {
		// Handle lead activity here
		console.log("Lead activity triggered");
	};

	return (
		<PropertyHeader property={property} onLeadActivity={handleLeadActivity} />
	);
}
