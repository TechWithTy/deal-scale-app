import { Marker } from "@react-google-maps/api";
// * MarkersLayer.tsx
// ! Renders all map markers
import type React from "react";

interface MarkerData {
	lat: number;
	lng: number;
	[key: string]: string | number;
}

interface MarkersLayerProps {
	markers: MarkerData[];
	onMarkerClick?: (marker: MarkerData) => void;
}

const MarkersLayer: React.FC<MarkersLayerProps> = ({
	markers,
	onMarkerClick,
}) => (
	<>
		{markers.map((marker, idx) => (
			<Marker
				key={marker.id || idx}
				position={{ lat: marker.lat, lng: marker.lng }}
				onClick={() => onMarkerClick?.(marker)}
			/>
		))}
	</>
);

export default MarkersLayer;
