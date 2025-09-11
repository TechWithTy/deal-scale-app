import {
	createRentCastProperty,
	type Property as DashboardProperty,
} from "@/types/_dashboard/property";

export const GOOGLE_LIBS = ["drawing", "marker", "places", "geometry"] as const;

export function buildPropertyFromPlace({
	position,
	name,
	address,
}: {
	position: google.maps.LatLngLiteral;
	name?: string;
	address?: string;
}): DashboardProperty {
	return createRentCastProperty({
		metadata: { source: "rentcast", lastUpdated: new Date().toISOString() },
		address: {
			street: address || name || "",
			city: "",
			state: "",
			zipCode: "",
			fullStreetLine: address || name || `${position.lat}, ${position.lng}`,
			latitude: position.lat,
			longitude: position.lng,
		},
		details: {
			beds: 0,
			fullBaths: 0,
			halfBaths: null,
			sqft: null,
			yearBuilt: 0,
			lotSqft: null,
			propertyType: "Unknown",
			stories: 0,
			style: "",
			construction: "",
			roof: "",
			parking: "",
		},
		lastUpdated: new Date().toISOString(),
	});
}

export function openStreetView(position: google.maps.LatLngLiteral) {
	const url = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${position.lat},${position.lng}`;
	try {
		window.open(url, "_blank", "noopener,noreferrer");
	} catch {
		// no-op
	}
}
