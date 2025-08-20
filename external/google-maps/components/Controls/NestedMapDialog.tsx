"use client";
import { useState } from "react";
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
}: { coords: Coordinates | null; onApply: (c: Coordinates) => void }) {
	const [open, setOpen] = useState(false);
	const [map, setMap] = useState<google.maps.Map | null>(null);
	const [temp, setTemp] = useState<Coordinates | null>(coords);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button type="button" variant="secondary">
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
