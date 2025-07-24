import type { Coordinate } from "@/types/_dashboard/maps";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
// * MapSection.tsx
// ! Map display and marker logic for leads search
import type { FC } from "react";

interface MapSectionProps {
	markers: Coordinate[];
	center: Coordinate;
	onMarkerClick?: (marker: Coordinate) => void;
	mapKey?: string;
}

const mapContainerStyle = {
	width: "100%",
	height: "350px",
};

const mapOptions = {
	mapTypeId: "roadmap",
	disableDefaultUI: true,
	zoomControl: true,
};

const MapSection: FC<MapSectionProps> = ({
	markers,
	center,
	onMarkerClick,
	mapKey,
}) => (
	<LoadScript
		googleMapsApiKey={mapKey || process.env.NEXT_PUBLIC_GMAPS_KEY || ""}
	>
		<GoogleMap
			mapContainerStyle={mapContainerStyle}
			center={center}
			zoom={12}
			options={mapOptions}
		>
			{markers.map((marker, idx) => (
				<Marker
					key={`${marker.lat},${marker.lng}${idx}`}
					position={{ lat: marker.lat, lng: marker.lng }}
					onClick={() => onMarkerClick?.(marker)}
				/>
			))}
		</GoogleMap>
	</LoadScript>
);

export default MapSection;
