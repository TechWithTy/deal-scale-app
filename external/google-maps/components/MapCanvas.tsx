"use client";
import { useEffect, useRef } from "react";
import type { MapInit } from "../types";
import { buildMapOptions } from "../utils";

export function MapCanvas({
	init,
	onReady,
}: { init: MapInit; onReady?: (map: google.maps.Map) => void }) {
	const ref = useRef<HTMLDivElement | null>(null);
	const mapRef = useRef<google.maps.Map | null>(null);

	useEffect(() => {
		if (!ref.current || mapRef.current) return;
		const map = new google.maps.Map(ref.current, buildMapOptions(init));
		mapRef.current = map;
		onReady?.(map);
	}, [init, onReady]);

	return (
		<div
			ref={ref}
			className="h-full w-full rounded-md"
			role="region"
			aria-label="Google Map"
		/>
	);
}
