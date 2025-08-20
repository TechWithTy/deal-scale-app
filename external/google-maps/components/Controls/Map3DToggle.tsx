"use client";
import { Button } from "@/components/ui/button";

export function Map3DToggle({ map }: { map: google.maps.Map | null }) {
	return (
		<div className="flex gap-2">
			<Button
				type="button"
				onClick={() => {
					if (!map) return;
					map.setTilt(67.5);
				}}
				aria-label="Enable 3D"
			>
				3D
			</Button>
			<Button
				type="button"
				variant="secondary"
				onClick={() => {
					if (!map) return;
					map.setTilt(0);
					map.setHeading(0);
				}}
				aria-label="Reset 3D"
			>
				Reset
			</Button>
		</div>
	);
}
