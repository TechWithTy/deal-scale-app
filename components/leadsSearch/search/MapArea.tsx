import React from "react";
import { LoadScript } from "@react-google-maps/api";
import { Coordinate } from "@/types/_dashboard/maps";
import {
	PlaceSearchPanel,
	UIPanelPlace,
} from "external/google-maps-two/components/composit/components/PlaceSearchPanel";
import { MapWithDrawing } from "external/google-maps-two/components";
import { GOOGLE_LIBS } from "./helpers";

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
	const [isClient, setIsClient] = React.useState(false);
	const [mapsLoaded, setMapsLoaded] = React.useState(false);

	React.useEffect(() => {
		setIsClient(true);
	}, []);

	const apiKey =
		process.env.NEXT_PUBLIC_GMAPS_KEY ||
		process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
		"";

	return (
		<LoadScript
			googleMapsApiKey={apiKey}
			libraries={
				GOOGLE_LIBS as unknown as (
					| "drawing"
					| "marker"
					| "places"
					| "geometry"
				)[]
			}
			onLoad={() => setMapsLoaded(true)}
			onError={(error) => console.error("Google Maps load error:", error)}
		>
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
				apiKey={apiKey}
				mapId={
					process.env.NEXT_PUBLIC_GMAPS_MAP_ID ||
					process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID
				}
				center={center}
				onCenterChange={onCenterChange}
				results={markers as unknown as google.maps.LatLngLiteral[]}
				onResultsChange={(pins: google.maps.LatLngLiteral[]) => {
					const coords = pins.map((p: google.maps.LatLngLiteral) => ({
						lat: p.lat,
						lng: p.lng,
					}));
					onResultsChange(coords as Coordinate[]);
				}}
				defaultZoom={11}
				containerStyle={{ width: "100%", height: "420px" }}
				showAddressHoverInfo
				mapColorScheme="system"
				selectedPlace={selectedPlace}
				onViewPlace={onViewPlace}
				onAddToList={onAddToList}
				pinSnapToGrid={false}
				assumeLoaded={mapsLoaded}
			/>
		</LoadScript>
	);
};

export default MapArea;
