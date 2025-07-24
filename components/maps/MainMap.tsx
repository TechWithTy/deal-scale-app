// * MainMap.tsx
// ! Unified main map component combining all property/maps-related logic and subcomponents

"use client";
import { usePropertyStore } from "@/lib/stores/leadSearch/drawer";
import type { PropertyDetails } from "@/types/_dashboard/maps";
import {
	DrawingManager,
	GoogleMap,
	InfoWindow,
	LoadScript,
	Marker,
} from "@react-google-maps/api";
import Lottie from "lottie-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import PropertyListView from "./properties/propertyList";

const maxCardsPerLoad = 50;
// * DrawingControls (inline)
interface DrawingControlsProps {
	drawingMode: google.maps.drawing.OverlayType | null;
	setDrawingMode: (mode: google.maps.drawing.OverlayType | null) => void;
}
const DrawingControls: React.FC<DrawingControlsProps> = ({
	drawingMode,
	setDrawingMode,
}) => (
	<div className="absolute top-4 left-4 z-10 flex gap-2 rounded bg-white p-2 shadow">
		<button
			type="button"
			className={`rounded px-3 py-1 text-xs ${drawingMode === google.maps.drawing.OverlayType.CIRCLE ? "bg-blue-600 text-white" : "bg-gray-200"}`}
			onClick={() => setDrawingMode(google.maps.drawing.OverlayType.CIRCLE)}
		>
			Circle
		</button>
		<button
			type="button"
			className={`rounded px-3 py-1 text-xs ${drawingMode === google.maps.drawing.OverlayType.POLYLINE ? "bg-blue-600 text-white" : "bg-gray-200"}`}
			onClick={() => setDrawingMode(google.maps.drawing.OverlayType.POLYLINE)}
		>
			Polyline
		</button>
		<button
			type="button"
			className="rounded bg-red-500 px-3 py-1 text-white text-xs"
			onClick={() => setDrawingMode(null)}
		>
			Cancel
		</button>
	</div>
);

// * MarkersLayer (inline)
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

// * MainMap Component
interface MainMapProps {
	apiKey: string;
	center: { lat: number; lng: number };
	markers: MarkerData[];
	zoom: number;
}

const mapContainerStyle = { width: "100%", height: "100%" };

const MainMap: React.FC<MainMapProps> = ({ apiKey, center, markers, zoom }) => {
	// Zustand property store
	const {
		visibleProperties,
		setProperties,
		isDrawerOpen,
		loadMoreProperties,
		hasMore,
		isLoading,
	} = usePropertyStore();

	// Drawing state
	const [drawingMode, setDrawingMode] =
		useState<google.maps.drawing.OverlayType | null>(null);
	const [shapeDrawn, setShapeDrawn] = useState(false);
	const [boundaryApplied, setBoundaryApplied] = useState(false);
	const shapeRef = useRef<
		| google.maps.Polygon
		| google.maps.Polyline
		| google.maps.Circle
		| google.maps.Rectangle
		| null
	>(null);

	// InfoWindow/Marker selection state (for propertyMap logic)
	const [selected, setSelected] = useState<google.maps.LatLngLiteral | null>(
		null,
	);
	const [homeAnimation, setHomeAnimation] = useState<object | null>(null);

	useEffect(() => {
		setProperties([]); // todo: Replace with real/mock data as needed
		// Fetch Lottie animation for InfoWindow
		fetch("/lottie/HousePing.json")
			.then((response) => response.json())
			.then((data: object) => setHomeAnimation(data));
	}, [setProperties]);

	// Drawing event handlers
	const onShapeComplete = (
		shape:
			| google.maps.Polygon
			| google.maps.Polyline
			| google.maps.Circle
			| google.maps.Rectangle,
	) => {
		if (shapeRef.current) {
			shapeRef.current.setMap(null);
		}
		shapeRef.current = shape;
		setDrawingMode(null);
		setShapeDrawn(true);
	};
	const handleCancel = () => {
		if (shapeRef.current) {
			shapeRef.current.setMap(null);
			shapeRef.current = null;
		}
		setDrawingMode(null);
		setShapeDrawn(false);
	};
	const handleApply = () => {
		if (shapeRef.current) {
			setBoundaryApplied(true);
			setShapeDrawn(false);
		}
	};
	const handleRemoveBoundaries = () => {
		if (shapeRef.current) {
			shapeRef.current.setMap(null);
			shapeRef.current = null;
		}
		setBoundaryApplied(false);
	};

	// Marker click handler for InfoWindow (propertyMap logic)
	const handleMarkerClick = (marker: MarkerData) => {
		setSelected({ lat: marker.lat, lng: marker.lng });
	};

	return (
		<LoadScript googleMapsApiKey={apiKey} libraries={["drawing", "places"]}>
			<div className="relative h-full w-full">
				<GoogleMap
					mapContainerStyle={mapContainerStyle}
					center={center}
					zoom={zoom}
				>
					{/* Markers */}
					<MarkersLayer markers={markers} onMarkerClick={handleMarkerClick} />

					{/* Drawing Controls */}
					{!boundaryApplied && (
						<DrawingControls
							drawingMode={drawingMode}
							setDrawingMode={setDrawingMode}
						/>
					)}

					{/* Remove Boundaries */}
					{boundaryApplied && (
						<div
							onMouseDown={handleRemoveBoundaries}
							className="absolute top-4 right-4 z-10 flex cursor-pointer items-center rounded-lg bg-red-500 px-4 py-2 text-white shadow-lg hover:bg-red-600"
						>
							<span className="mr-2">Remove Boundaries</span>
							<button type="button" onClick={handleRemoveBoundaries}>
								&#x2715;
							</button>
						</div>
					)}

					{/* Drawing Manager */}
					<DrawingManager
						onPolygonComplete={onShapeComplete}
						onRectangleComplete={onShapeComplete}
						onCircleComplete={onShapeComplete}
						onPolylineComplete={onShapeComplete}
						options={{
							drawingControl: false,
							drawingMode: drawingMode,
							polygonOptions: {
								fillColor: "#2196F3",
								fillOpacity: 0.5,
								strokeWeight: 2,
								clickable: false,
								editable: true,
								zIndex: 1,
							},
						}}
					/>

					{/* InfoWindow for property marker (propertyMap logic) */}
					{selected && (
						<InfoWindow
							position={selected}
							onCloseClick={() => setSelected(null)}
						>
							<div
								style={{
									color: "black",
									display: "flex",
									alignItems: "center",
								}}
							>
								{homeAnimation && (
									<Lottie
										animationData={homeAnimation}
										style={{ height: 30, width: 30, marginRight: 10 }}
									/>
								)}
								<div style={{ flex: 1 }}>
									<h2
										className="font-bold"
										style={{ fontSize: "1rem", margin: 0 }}
									>
										Property Address
									</h2>
									<p style={{ fontSize: "0.875rem", margin: 0 }}>
										Property details here
									</p>
								</div>
							</div>
						</InfoWindow>
					)}

					{/* Property List View (Drawer) */}
					{isDrawerOpen && visibleProperties.length > 0 && (
						<div
							className="absolute bottom-0 left-0 z-50 w-full"
							style={{ maxWidth: "100%", overflow: "hidden" }}
						>
							<PropertyListView
								properties={visibleProperties as PropertyDetails[]}
							/>
							{hasMore && !isLoading && (
								<div className="flex justify-center p-4">
									<button
										type="button"
										onClick={() => loadMoreProperties(maxCardsPerLoad)}
									>
										Load More Properties
									</button>
								</div>
							)}
						</div>
					)}
				</GoogleMap>
			</div>
		</LoadScript>
	);
};

export default MainMap;
