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
	const markerRef = useRef<google.maps.Marker | null>(null);

	useEffect(() => {
		if (!map) return;
		if (!coords) {
			markerRef.current?.setMap(null);
			markerRef.current = null;
			return;
		}
		if (!markerRef.current) {
			markerRef.current = new google.maps.Marker({
				position: coords,
				map,
				draggable: !!draggable,
			});
			if (draggable) {
				markerRef.current.addListener("dragend", () => {
					const pos = markerRef.current!.getPosition()?.toJSON();
					if (pos) onDragEnd?.(pos);
				});
			}
		} else {
			markerRef.current.setPosition(coords);
			markerRef.current.setDraggable(!!draggable);
			if (!markerRef.current.getMap()) markerRef.current.setMap(map);
		}
	}, [map, coords, draggable, onDragEnd]);

	return null;
}
