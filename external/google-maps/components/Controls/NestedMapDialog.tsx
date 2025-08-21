"use client";
import { useEffect, useRef, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Coordinates } from "../../types";
import { MapCanvas } from "../MapCanvas";
import { PinMarker } from "../PinMarker";

export function NestedMapDialog({
	coords,
	onApply,
	results,
	onResultsChange,
}: {
	coords: Coordinates | null;
	onApply: (c: Coordinates) => void;
	results?: Coordinates[];
	onResultsChange?: (pins: Coordinates[]) => void;
}) {
	const [open, setOpen] = useState(false);
	const [map, setMap] = useState<google.maps.Map | null>(null);
	const [temp, setTemp] = useState<Coordinates | null>(coords);
	const resultMarkerRefs = useRef<google.maps.marker.AdvancedMarkerElement[]>(
		[],
	);
	const [localPins, setLocalPins] = useState<Coordinates[]>(results ?? []);

	// Sync temp with incoming coords when modal opens or coords update
	useEffect(() => {
		if (open) setTemp(coords ?? null);
	}, [open, coords]);

	// Keep localPins in sync when dialog opens or results change
	useEffect(() => {
		if (open) setLocalPins(results ?? []);
	}, [open, results]);

	// Render result pins and fit bounds when open
	useEffect(() => {
		if (!open || !map) return;
		for (const m of resultMarkerRefs.current) m.map = null;
		resultMarkerRefs.current = [];
		if (
			localPins.length &&
			(window as any).google?.maps?.marker?.AdvancedMarkerElement
		) {
			const bounds = new google.maps.LatLngBounds();
			resultMarkerRefs.current = localPins.map((p, idx) => {
				bounds.extend(p);
				const mm = new google.maps.marker.AdvancedMarkerElement({
					map,
					position: p,
					gmpDraggable: true,
				});
				mm.addListener("dragend", (e: google.maps.MapMouseEvent) => {
					const np = e.latLng?.toJSON();
					if (!np) return;
					setLocalPins((prev) => {
						const copy = prev.slice();
						copy[idx] = np;
						onResultsChange?.(copy);
						return copy;
					});
				});
				mm.addListener("click", () => {
					setLocalPins((prev) => {
						const copy = prev.slice(0, idx).concat(prev.slice(idx + 1));
						onResultsChange?.(copy);
						return copy;
					});
				});
				return mm;
			});
			// Include temp pin if present for a better fit
			if (temp) bounds.extend(temp);
			map.fitBounds(bounds);
		}
		return () => {
			for (const m of resultMarkerRefs.current) m.map = null;
			resultMarkerRefs.current = [];
		};
	}, [open, map, localPins, temp, onResultsChange]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					type="button"
					variant="secondary"
					disabled={!results || results.length === 0}
				>
					Refine on nested map
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-3xl">
				<DialogHeader>
					<DialogTitle>Refine location</DialogTitle>
				</DialogHeader>
				<div className="h-[400px] w-full">
					<MapCanvas
						init={{
							center: temp ?? { lat: 37.7749, lng: -122.4194 },
							zoom: 15,
						}}
						onReady={setMap}
					/>
					<PinMarker
						map={map}
						coords={temp}
						draggable
						onDragEnd={(p) => setTemp(p)}
					/>
				</div>
				<DialogFooter>
					<Button
						type="button"
						onClick={() => {
							if (temp) {
								onApply(temp);
								setOpen(false);
							}
						}}
					>
						Apply
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
