"use client";
import { MapContainer } from "@/external/google-maps";
import type { Coordinates } from "@/external/google-maps";

const defaultCenter: Coordinates = { lat: 39.7392, lng: -104.9903 }; // Denver, CO

export default function MapsTestPage() {
	return (
		<main className="container mx-auto max-w-5xl p-6">
			<h1 className="mb-4 text-2xl font-semibold">Google Maps Test</h1>
			<p className="mb-6 text-sm text-muted-foreground">
				Click on the map to drop a pin. Use the search inputs and controls to
				explore features.
			</p>
			<MapContainer
				defaultCenter={defaultCenter}
				defaultZoom={12}
				initialPin={defaultCenter}
				apiKey={
					process.env.NEXT_PUBLIC_GMAPS_KEY ||
					process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
				}
				libraries={["drawing", "marker", "places"]}
			/>
		</main>
	);
}
