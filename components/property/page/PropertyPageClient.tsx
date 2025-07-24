"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PropertyHeader from "./propertyHeader";
import type { PropertyDetails } from "@/types/_dashboard/maps";

interface PropertyPageClientProps {
	initialProperty: PropertyDetails;
}

export default function PropertyPageClient({
	initialProperty,
}: PropertyPageClientProps) {
	const router = useRouter();
	const [property, setProperty] = useState(initialProperty);
	const [isLoading, setIsLoading] = useState(false);

	// Handle lead activity
	const handleLeadActivity = async () => {
		// Add your lead activity logic here
		console.log("Lead activity triggered", property.id);
		// You can add API calls or other interactive logic here
	};

	// Refresh property data
	const refreshProperty = async () => {
		if (!property?.id) return;

		setIsLoading(true);
		try {
			const response = await fetch(`/api/properties/${property.id}`);
			if (response.ok) {
				const data = await response.json();
				setProperty(data);
			}
		} catch (error) {
			console.error("Failed to refresh property:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			{property && (
				<PropertyHeader
					property={property}
					onLeadActivity={handleLeadActivity}
				/>
			)}
			{/* Add other property page components here */}
		</>
	);
}
