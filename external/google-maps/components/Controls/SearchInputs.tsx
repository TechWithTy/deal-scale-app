"use client";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { AddressResult, Coordinates } from "../../types";

export function SearchInputs({
	map,
	value,
	onChange,
	onSave,
}: {
	map: google.maps.Map | null;
	value: { coords: Coordinates | null; address?: AddressResult };
	onChange: (data: {
		coords: Coordinates | null;
		address?: AddressResult;
	}) => void;
	onSave?: (data: { coords: Coordinates; address?: AddressResult }) => void;
}) {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [lat, setLat] = useState<string>(value.coords?.lat?.toString() ?? "");
	const [lng, setLng] = useState<string>(value.coords?.lng?.toString() ?? "");

	// Note: Deprecated google.maps.places.Autocomplete removed to avoid runtime errors
	// for new Google Maps customers. Manual lat/lng inputs remain functional.
	useEffect(() => {
		// Focus the input for usability; no autocomplete binding.
		inputRef.current?.focus();
	}, []);

	return (
		<div className="grid gap-2">
			<Input
				ref={inputRef}
				placeholder="Search address"
				aria-label="Search address"
			/>
			<div className="grid grid-cols-2 gap-2">
				<Input
					value={lat}
					onChange={(e) => setLat(e.target.value)}
					placeholder="Latitude"
					aria-label="Latitude"
				/>
				<Input
					value={lng}
					onChange={(e) => setLng(e.target.value)}
					placeholder="Longitude"
					aria-label="Longitude"
				/>
			</div>
			<div className="flex gap-2">
				<Button
					type="button"
					onClick={() => {
						const nlat = Number(lat);
						const nlng = Number(lng);
						if (Number.isFinite(nlat) && Number.isFinite(nlng)) {
							const coords = { lat: nlat, lng: nlng } as const;
							onChange({ coords });
							map?.panTo(coords);
							map?.setZoom(16);
						}
					}}
				>
					Update Pin
				</Button>
				<Button
					type="button"
					variant="secondary"
					onClick={() => {
						if (value.coords)
							onSave?.({ coords: value.coords, address: value.address });
					}}
				>
					Save Location
				</Button>
			</div>
		</div>
	);
}
