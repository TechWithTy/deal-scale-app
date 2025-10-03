import type React from "react";
import { MapWithDrawing } from "external/google-maps-two/components";
import {
	PlaceSearchPanel,
	type UIPanelPlace,
} from "external/google-maps-two/components/composit/components/PlaceSearchPanel";
import type { Coordinate } from "@/types/_dashboard/maps";
import { GOOGLE_LIBS } from "./helpers";
import { useGoogleMapsReady } from "./GoogleMapsBootstrap";

type SelectPlacePayload = {
	placeId?: string;
	location?: google.maps.LatLngLiteral;
};

interface MapAreaProps {
	center: Coordinate;
	markers: Coordinate[];
	selectedPlace: {
		placeId?: string;
		location?: google.maps.LatLngLiteral;
	} | null;
	onCenterChange: (c: Coordinate) => void;
	onSelectPlace: (p: SelectPlacePayload) => void;
	onResultsChange: (coords: Coordinate[]) => void;
	onAddToList: (p: {
		position: google.maps.LatLngLiteral;
		name?: string;
		address?: string;
	}) => void;
	onViewPlace: (p: { position: google.maps.LatLngLiteral }) => void;
}

const MapArea: React.FC<MapAreaProps> = ({
	center,
	markers,
	selectedPlace,
	onCenterChange,
	onSelectPlace,
	onResultsChange,
	onAddToList,
	onViewPlace,
}) => {
	const mapsReady = useGoogleMapsReady();

	if (!mapsReady) {
		return (
			<div className="flex flex-col gap-4">
				<div className="h-12 w-full animate-pulse rounded-md bg-muted" />
				<div className="flex h-[420px] items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
					Loading Google Maps…
				</div>
			</div>
		);
	}

	return (
		<>
			<PlaceSearchPanel
				center={
					{
						lat: center.lat,
						lng: center.lng,
					} as unknown as google.maps.LatLngLiteral
				}
				radiusMeters={1000}
				onSelectPlace={(place: UIPanelPlace) =>
					onSelectPlace({
						placeId: place.id ? String(place.id) : undefined,
						location: place.location,
					})
				}
			/>
			<MapWithDrawing
				apiKey={
					process.env.NEXT_PUBLIC_GMAPS_KEY ||
					process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
					""
				}
				mapId={
					process.env.NEXT_PUBLIC_GMAPS_MAP_ID ||
					process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID
				}
				libraries={
					GOOGLE_LIBS as unknown as (
						| "drawing"
						| "marker"
						| "places"
						| "geometry"
					)[]
				}
				center={center}
				onCenterChange={onCenterChange}
				results={markers as unknown as google.maps.LatLngLiteral[]}
				onResultsChange={(pins) => {
					const coords = pins.map((p) => ({ lat: p.lat, lng: p.lng }));
					onResultsChange(coords as Coordinate[]);
				}}
				defaultZoom={11}
				containerStyle={{ width: "100%", height: "420px" }}
				showAddressHoverInfo
				centerChangeZoom={16}
				mapColorScheme="system"
				selectedPlace={selectedPlace}
				onViewPlace={onViewPlace}
				onAddToList={onAddToList}
				pinSnapToGrid={false}
				assumeLoaded
			/>
		</>
	);
};

export default MapArea;
