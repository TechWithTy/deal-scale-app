"use client";
import { useEffect, useRef } from "react";
import type { Coordinates } from "../types";

export function PinMarker({
	map,
	coords,
	draggable,
	onDragEnd,
}: {
	map: google.maps.Map | null;
	coords: Coordinates | null;
	draggable?: boolean;
	onDragEnd?: (pos: Coordinates) => void;
}) {
	const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(
		null,
	);

	useEffect(() => {
		if (!map) return;
		if (!coords) {
			markerRef.current?.map && (markerRef.current.map = null as any);
			markerRef.current = null;
			return;
		}
		if (!markerRef.current) {
			markerRef.current = new google.maps.marker.AdvancedMarkerElement({
				position: coords,
				map,
				gmpDraggable: !!draggable,
			});
			// Dragend for AdvancedMarkerElement
			markerRef.current.addListener(
				"dragend",
				(e: google.maps.MapMouseEvent) => {
					let pos: google.maps.LatLngLiteral | null = null;
					if (e.latLng) {
						pos = e.latLng.toJSON();
					} else if (markerRef.current?.position) {
						const p = markerRef.current.position as google.maps.LatLngLiteral;
						pos = { lat: p.lat, lng: p.lng };
					}
					if (pos) onDragEnd?.(pos);
				},
			);
		} else {
			markerRef.current.position = coords;
			markerRef.current.gmpDraggable = !!draggable;
			if (!markerRef.current.map) markerRef.current.map = map;
		}
	}, [map, coords, draggable, onDragEnd]);

	return null;
}
