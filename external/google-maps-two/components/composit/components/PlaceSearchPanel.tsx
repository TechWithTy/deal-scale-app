"use client";
import { useEffect, useRef, useState } from "react";

interface PlaceElement extends HTMLElement {
	place?: UIPanelPlace;
}

/**
 * Minimal place shape emitted by Google's Places UI Kit web components.
 * This is not the same as google.maps.places.PlaceResult; the UI Kit provides
 * a streamlined object containing an id and a LatLngLiteral location.
 */
export interface UIPanelPlace {
	id?: string | number;
	location?: google.maps.LatLngLiteral;
	name?: string;
	address?: string;
}

export interface PlaceSearchPanelProps {
	center: google.maps.LatLngLiteral;
	radiusMeters: number; // capped at 50000 by UI Kit
	includedTypes?: string[];
	onSelectPlace?: (place: UIPanelPlace) => void; // place from UI Kit element
}

// Renders Google's Places UI Kit web components for Place Search (Place List)
// and wires selection back to the parent component.
export function PlaceSearchPanel({
	center,
	radiusMeters,
	includedTypes,
	onSelectPlace,
}: PlaceSearchPanelProps) {
	const searchElRef = useRef<PlaceSearchElement | null>(null);
	const nearbyReqRef = useRef<NearbySearchRequestElement | null>(null);
	const [mounted, setMounted] = useState(false);
	const [libsReady, setLibsReady] = useState(false);
	useEffect(() => {
		setMounted(true);
	}, []);

	/**
	 * Shape of the <gmp-place-nearby-search-request> custom element we interact with.
	 */
	interface NearbySearchRequestElement extends HTMLElement {
		maxResultCount?: number;
		locationRestriction?: { center: google.maps.LatLngLiteral; radius: number };
		includedTypes?: string[];
	}

	interface PlaceSearchElement extends HTMLElement {
		place?: UIPanelPlace;
	}

	// Ensure libraries for web components are loaded (maps/places)
	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				await google.maps.importLibrary("maps");
				await google.maps.importLibrary("places");
				if (cancelled) return;
				setLibsReady(true);
			} catch {
				// ignore; parent likely already loaded
				// Best-effort: if global is already present, mark ready
				if (typeof google !== "undefined" && (google.maps as any)?.places)
					setLibsReady(true);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	// Update request element props when inputs change
	useEffect(() => {
		const el = nearbyReqRef.current;
		if (!el) return;
		if (!libsReady) return;
		const capped = Math.min(Math.max(1, radiusMeters || 1), 50000);
		el.maxResultCount = 10;
		el.locationRestriction = { center, radius: capped };
		el.includedTypes = includedTypes?.length ? includedTypes : undefined;
	}, [center, radiusMeters, includedTypes, libsReady]);

	// Attach select event handler
	useEffect(() => {
		const searchEl = searchElRef.current;
		if (!searchEl) return;
		const handler = (evt: Event) => {
			// Custom event emitted by UI Kit: detail.place
			const ce = evt as CustomEvent<{ place?: UIPanelPlace }>;
			const target = evt.target as PlaceSearchElement;
			const maybePlace: UIPanelPlace | undefined =
				ce?.detail?.place ?? target?.place;
			// ! UI Kit may sometimes omit `detail.place`; only call when defined
			if (maybePlace) {
				onSelectPlace?.(maybePlace);
			}
		};
		searchEl.addEventListener("gmp-select", handler as EventListener);
		return () => {
			searchEl.removeEventListener("gmp-select", handler as EventListener);
		};
	}, [onSelectPlace]);

	if (typeof window === "undefined" || !mounted) return null;

	if (!libsReady) {
		return (
			<section className="mt-6">
				<h2 className="mb-2 font-semibold text-lg">UI Kit: Place Search</h2>
				<div className="relative h-64 w-full overflow-hidden rounded-md">
					<div className="h-full w-full animate-pulse bg-gradient-to-r from-muted/40 via-muted/80 to-muted/40 bg-[length:400%_100%]" />
				</div>
			</section>
		);
	}

	return (
		<section className="mt-6">
			<h2 className="mb-2 font-semibold text-lg">UI Kit: Place Search</h2>
			{/* Web component wrapper */}
			{/* eslint-disable react/no-unknown-property */}
			<gmp-place-search ref={searchElRef} style={{ display: "block" }}>
				<gmp-place-nearby-search-request ref={nearbyReqRef} />
			</gmp-place-search>
			{/* eslint-enable react/no-unknown-property */}
		</section>
	);
}
