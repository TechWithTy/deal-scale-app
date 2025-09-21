"use client";
import { LoadScript } from "@react-google-maps/api";
import { MapsTestComposite } from "@/external/google-maps-two/components";

export default function MapsTestPage() {
	const apiKey =
		process.env.NEXT_PUBLIC_GMAPS_KEY ||
		process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
		"";

	// Load all libraries used by children once at the page level
	const libs = ["places", "geometry", "marker", "drawing"] as const;

	return (
		<>
			{!apiKey && (
				<div className="container mx-auto mb-4 max-w-5xl rounded border border-border bg-card p-4 text-sm text-foreground">
					<b>Google Maps API key missing.</b> Set NEXT_PUBLIC_GMAPS_KEY or
					NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment.
				</div>
			)}
			<LoadScript
				googleMapsApiKey={apiKey}
				libraries={
					libs as unknown as ("drawing" | "marker" | "places" | "geometry")[]
				}
			>
				<MapsTestComposite assumeLoaded />
			</LoadScript>
		</>
	);
}
