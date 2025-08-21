"use client";
import { useEffect, useMemo, useState } from "react";
import type { Coordinates, MapInit, OnSave } from "../types";
import { useGoogleMapsLoader } from "../hooks/useGoogleMapsLoader";
import { MapCanvas } from "./MapCanvas";
import { PinMarker } from "./PinMarker";
import { SearchInputs } from "./Controls/SearchInputs";
import { Map3DToggle } from "./Controls/Map3DToggle";
import { NestedMapDialog } from "./Controls/NestedMapDialog";

export type MapContainerProps = {
	defaultCenter: Coordinates;
	defaultZoom?: number;
	initialPin?: Coordinates | null;
	onSave?: OnSave;
	apiKey?: string;
	libraries?: string[];
};

export function MapContainer({
	defaultCenter,
	defaultZoom = 12,
	initialPin = null,
	onSave,
	apiKey,
	libraries,
}: MapContainerProps) {
	const { loaded, error } = useGoogleMapsLoader(apiKey, libraries);
	const [map, setMap] = useState<google.maps.Map | null>(null);
	const [coords, setCoords] = useState<Coordinates | null>(initialPin);
	const init: MapInit = useMemo(
		() => ({ center: coords ?? defaultCenter, zoom: defaultZoom }),
		[coords, defaultCenter, defaultZoom],
	);

	useEffect(() => {
		if (!map) return;
		map.addListener("click", (e: google.maps.MapMouseEvent) => {
			const ll = e.latLng?.toJSON();
			if (ll) setCoords(ll);
		});
	}, [map]);

	if (error)
		return <div role="alert">Failed to load Google Maps. Please retry.</div>;
	if (!loaded) return <div>Loading map…</div>;

	return (
		<div className="grid gap-4">
			<div className="flex items-center justify-between gap-4">
				<SearchInputs
					map={map}
					value={{ coords }}
					onChange={(v) => setCoords(v.coords)}
					onSave={(d) => onSave?.(d)}
				/>
				<Map3DToggle map={map} />
				<NestedMapDialog coords={coords} onApply={(c) => setCoords(c)} />
			</div>
			<div className="h-[500px] w-full">
				<MapCanvas init={init} onReady={setMap} />
				<PinMarker
					map={map}
					coords={coords}
					draggable
					onDragEnd={(p) => setCoords(p)}
				/>
			</div>
		</div>
	);
}
