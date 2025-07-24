"use client";

import type { Property } from "@/types/_dashboard/property";
import PropertyHeader from "./propertyHeader";

interface PropertyHeaderWrapperProps {
	property: Property;
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
