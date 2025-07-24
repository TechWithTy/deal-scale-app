import { GoogleMap, LoadScript } from "@react-google-maps/api";
// * MapContainer.tsx
// ! Wrapper for GoogleMap, LoadScript, and children overlays
import type React from "react";

interface MapContainerProps {
	apiKey: string;
	center: { lat: number; lng: number };
	zoom: number;
	children?: React.ReactNode;
	mapContainerStyle?: React.CSSProperties;
}

const defaultStyle = { width: "100%", height: "100%" };

const MapContainer: React.FC<MapContainerProps> = ({
	apiKey,
	center,
	zoom,
	children,
	mapContainerStyle,
}) => (
	<LoadScript googleMapsApiKey={apiKey} libraries={["drawing", "places"]}>
		<GoogleMap
			mapContainerStyle={mapContainerStyle || defaultStyle}
			center={center}
			zoom={zoom}
		>
			{children}
		</GoogleMap>
	</LoadScript>
);

export default MapContainer;
