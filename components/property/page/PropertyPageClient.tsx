"use client";

import { getProperty } from "@/lib/api/public-api-core-resources";
import { normalizePublicApiProperty } from "@/lib/properties/public-api-property-normalizer";
import type { Property } from "@/types/_dashboard/property";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import PropertyHeader from "./propertyHeader";

interface PropertyPageClientProps {
	initialProperty: Property;
}

export default function PropertyPageClient({
	initialProperty,
}: PropertyPageClientProps) {
	const router = useRouter();
	const { data: session } = useSession();
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
			const refreshed = normalizePublicApiProperty(
				await getProperty(property.id, session?.publicApi?.accessToken),
			);
			if (refreshed) {
				setProperty(refreshed);
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
