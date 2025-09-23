"use client";

import { useEffect, useRef, useState } from "react";
import { LoadScript } from "@react-google-maps/api";
import { Input } from "@/components/ui/input";
import {
	initAutocomplete,
	type ACSeed,
} from "external/google-maps-two/components/composit/utils/autocomplete";

/**
 * StreetViewPreview
 * - Self-contained previewer for Google Street View
 * - Loads Places/StreetView libraries via LoadScript
 * - Accepts address via Autocomplete input and renders the nearest panorama
 */
const SV_LIBS = ["places"] as const;

export function StreetViewPreview({
	initialLocation,
	assumeLoaded,
}: { initialLocation?: google.maps.LatLngLiteral; assumeLoaded?: boolean }) {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const panoHostRef = useRef<HTMLDivElement | null>(null);
	const panoRef = useRef<google.maps.StreetViewPanorama | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string>("");
	const [scriptReady, setScriptReady] = useState(false);

	// Wire autocomplete, then on selection -> fetch and render SV
	useEffect(() => {
		let cleanup: (() => void) | undefined;
		(async () => {
			if (!inputRef.current) return;
			cleanup = await initAutocomplete(
				inputRef.current,
				(seed: ACSeed) => {
					setError("");
					if (seed.location) {
						void renderStreetView(seed.location);
					}
				},
				{
					fields: ["place_id", "geometry", "name", "formatted_address"],
					componentRestrictions: { country: "us" },
				},
			);
		})();
		return () => {
			try {
				cleanup?.();
			} catch {}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// If an initial location is provided, render immediately on mount
	useEffect(() => {
		if (initialLocation) {
			void renderStreetView(initialLocation);
		}
	}, [initialLocation]);

	const renderStreetView = async (loc: google.maps.LatLngLiteral) => {
		setLoading(true);
		try {
			const svs = new google.maps.StreetViewService();
			const tryFetch = (
				radius: number,
				source?: google.maps.StreetViewSource,
			) =>
				new Promise<google.maps.StreetViewPanoramaData | null>((resolve) => {
					svs.getPanorama({ location: loc, radius, source }, (data, status) => {
						resolve(status === google.maps.StreetViewStatus.OK ? data : null);
					});
				});

			// 50m first, then widen to 1000m outdoor
			const data50 = await tryFetch(50);
			const data =
				data50 ?? (await tryFetch(1000, google.maps.StreetViewSource.OUTDOOR));

			if (!data?.location?.pano || !panoHostRef.current) {
				setError("No Street View found near this location.");
				return;
			}

			if (!panoRef.current) {
				panoRef.current = new google.maps.StreetViewPanorama(
					panoHostRef.current,
					{
						pov: { heading: 0, pitch: 0 },
						zoom: 1,
					},
				);
			}
			panoRef.current.setPano(data.location.pano);
			// Center POV towards the selected location if links available
			try {
				const latLng = new google.maps.LatLng(loc.lat, loc.lng);
				panoRef.current.setPosition(latLng);
			} catch {}
		} catch {
			setError("Failed to load Street View.");
		} finally {
			setLoading(false);
		}
	};

	const inner = (
		<section className="container mx-auto max-w-5xl p-6">
			<h2 className="mb-3 font-semibold text-2xl">Street View Preview</h2>
			<div className="mb-4 grid gap-2">
				<Input
					ref={inputRef}
					placeholder="Enter an address, city, or ZIP"
					autoComplete="off"
				/>
				{loading && (
					<p className="text-muted-foreground text-sm">Loading Street View…</p>
				)}
				{error && <p className="text-red-500 text-sm">{error}</p>}
			</div>
			<div
				ref={panoHostRef}
				className="rounded-md border border-border"
				style={{ width: "100%", height: 420 }}
			/>
		</section>
	);

	const hasGoogle =
		typeof window !== "undefined" && (window as any).google?.maps;
	const existingScript =
		typeof document !== "undefined" &&
		document.querySelector(
			'script[src^="https://maps.googleapis.com/maps/api/js?"]',
		);
	if (assumeLoaded || hasGoogle || existingScript) {
		return inner;
	}
	return (
		<div className="relative">
			{!scriptReady && (
				<div className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-md">
					<div className="h-full w-full animate-pulse bg-[length:400%_100%] bg-gradient-to-r from-muted/40 via-muted/80 to-muted/40" />
				</div>
			)}
			<LoadScript
				googleMapsApiKey={
					process.env.NEXT_PUBLIC_GMAPS_KEY ||
					process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
					""
				}
				libraries={
					SV_LIBS as unknown as ("drawing" | "marker" | "places" | "geometry")[]
				}
				onLoad={() => setScriptReady(true)}
				onError={() => setScriptReady(true)}
			>
				{inner}
			</LoadScript>
		</div>
	);
}
