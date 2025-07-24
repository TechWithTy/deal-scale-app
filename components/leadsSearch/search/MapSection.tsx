import type { Coordinate } from "@/types/_dashboard/maps";
import { GoogleMap, LoadScript, DrawingManager } from "@react-google-maps/api";
import React, { useRef, useEffect, useState, useCallback } from "react";
import type { FC } from "react";
import { toast } from "sonner";

interface MapSectionProps {
	markers: Coordinate[];
	center: Coordinate;
	mapKey?: string;
	onBoundaryChange: (bounds: google.maps.LatLngBounds | null) => void;
}

const mapContainerStyle = {
	width: "100%",
	height: "350px",
};

const mapOptions = {
	mapTypeId: "roadmap",
	disableDefaultUI: true,
	zoomControl: true,
	mapId: process.env.NEXT_PUBLIC_GMAPS_MAP_ID,
};

const MapSection: FC<MapSectionProps> = ({
	markers,
	center,
	mapKey,
	onBoundaryChange,
}) => {
	const [isMapLoaded, setIsMapLoaded] = useState(false);
	const [mapLoadError, setMapLoadError] = useState<string | null>(null);
	const mapRef = useRef<google.maps.Map | null>(null);
	const markerRefs = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

	const [drawingMode, setDrawingMode] =
		useState<google.maps.drawing.OverlayType | null>(null);
	const [shapeDrawn, setShapeDrawn] = useState(false);
	const [boundaryApplied, setBoundaryApplied] = useState(false);
	const shapeRef = useRef<
		| google.maps.Polygon
		| google.maps.Rectangle
		| google.maps.Circle
		| google.maps.Polyline
		| null
	>(null);

	const clearShape = useCallback(() => {
		if (shapeRef.current) {
			shapeRef.current.setMap(null);
			shapeRef.current = null;
		}
	}, []);

	const onShapeComplete = useCallback(
		(
			shape: google.maps.Polygon | google.maps.Rectangle | google.maps.Circle,
		) => {
			clearShape();
			shapeRef.current = shape;
			setDrawingMode(null);
			setShapeDrawn(true);
		},
		[clearShape],
	);

	const handleCancelDrawing = useCallback(() => {
		clearShape();
		setDrawingMode(null);
		setShapeDrawn(false);
	}, [clearShape]);

	const handleApplyDrawing = useCallback(() => {
		if (shapeRef.current) {
			let bounds: google.maps.LatLngBounds | null = null;
			if (shapeRef.current instanceof google.maps.Rectangle) {
				bounds = shapeRef.current.getBounds() ?? null;
			} else if (shapeRef.current instanceof google.maps.Circle) {
				bounds = shapeRef.current.getBounds() ?? null;
			} else if (shapeRef.current instanceof google.maps.Polygon) {
				bounds = new google.maps.LatLngBounds();
				const path = shapeRef.current.getPath();
				for (const latLng of path.getArray()) {
					bounds.extend(latLng);
				}
			}
			onBoundaryChange(bounds);
			setBoundaryApplied(true);
			toast.info("Boundary filter applied");
		}
	}, [onBoundaryChange]);

	const handleRemoveBoundaries = useCallback(() => {
		clearShape();
		setBoundaryApplied(false);
		setShapeDrawn(false);
		onBoundaryChange(null);
		toast.info("Boundary filter removed");
	}, [clearShape, onBoundaryChange]);

	useEffect(() => {
		if (!isMapLoaded || !mapRef.current) return;

		for (const marker of markerRefs.current) {
			marker.map = null;
		}
		markerRefs.current = [];

		if (window.google?.maps?.marker?.AdvancedMarkerElement) {
			markerRefs.current = markers.map(
				(markerData) =>
					new window.google.maps.marker.AdvancedMarkerElement({
						map: mapRef.current,
						position: markerData,
					}),
			);
		}

		return () => {
			for (const marker of markerRefs.current) {
				marker.map = null;
			}
		};
	}, [markers, isMapLoaded]);

	if (mapLoadError) {
		return (
			<div className="flex h-[350px] flex-col items-center justify-center rounded border border-red-400 bg-gray-100">
				<div className="mb-2 font-bold text-lg text-red-600">
					Google Maps Load Error
				</div>
				<div className="mb-1 text-gray-800">{mapLoadError}</div>
				<div className="mb-2 text-gray-500 text-xs">
					Check your API key, referrer restrictions, billing, and Maps
					JavaScript API enablement.
					<br />
					<b>API Key:</b>{" "}
					{mapKey || process.env.NEXT_PUBLIC_GMAPS_KEY || "(none)"}
				</div>
				<div className="text-gray-400 text-xs">
					See browser console for more details.
				</div>
			</div>
		);
	}

	return (
		<LoadScript
			googleMapsApiKey={mapKey || process.env.NEXT_PUBLIC_GMAPS_KEY || ""}
			libraries={["drawing", "marker"]}
			onError={(e) => {
				setMapLoadError(
					"Google Maps failed to load. This is usually caused by an invalid API key, missing billing, or incorrect referrer restrictions. See the browser console for the exact error message and fix guidance.",
				);
				console.error("[MAP ERROR] Google Maps failed to load.", { e });
			}}
		>
			<div style={{ position: "relative", width: "100%", height: "350px" }}>
				<GoogleMap
					mapContainerStyle={mapContainerStyle}
					center={center}
					zoom={12}
					options={mapOptions}
					onLoad={(map) => {
						mapRef.current = map;
						setIsMapLoaded(true);
					}}
				>
					{!boundaryApplied && (
						<div
							className="-translate-x-1/2 absolute top-10 left-1/2 z-10 transform rounded-lg bg-white p-2 text-center opacity-80 shadow-lg transition-opacity duration-300 hover:opacity-100 lg:top-2"
							style={{ pointerEvents: "auto" }}
						>
							{!drawingMode ? (
								<p className="mb-2 font-semibold text-gray-800 text-sm">
									Draw a shape to search in that area
								</p>
							) : (
								<p className="mb-2 font-semibold text-gray-800 text-sm">
									Start Drawing!
								</p>
							)}
							{!shapeDrawn && (
								<div className="mb-2 flex flex-col items-center space-y-2">
									<div className="flex justify-center space-x-2">
										<button
											type="button"
											className="rounded bg-blue-600 px-4 py-2 text-white text-xs hover:bg-blue-700"
											onClick={() =>
												setDrawingMode(google.maps.drawing.OverlayType.POLYGON)
											}
										>
											Polygon
										</button>
										<button
											type="button"
											className="rounded bg-blue-600 px-4 py-2 text-white text-xs hover:bg-blue-700"
											onClick={() =>
												setDrawingMode(
													google.maps.drawing.OverlayType.RECTANGLE,
												)
											}
										>
											Rectangle
										</button>
										<button
											type="button"
											className="rounded bg-blue-600 px-4 py-2 text-white text-xs hover:bg-blue-700"
											onClick={() =>
												setDrawingMode(google.maps.drawing.OverlayType.CIRCLE)
											}
										>
											Circle
										</button>
									</div>
									{drawingMode && (
										<button
											type="button"
											className="mt-2 rounded bg-red-600 px-4 py-2 text-white text-xs hover:bg-red-700"
											onClick={handleCancelDrawing}
										>
											Cancel Drawing
										</button>
									)}
								</div>
							)}
							{shapeDrawn && (
								<div className="flex justify-center space-x-4">
									<button
										type="button"
										onClick={handleCancelDrawing}
										className="rounded bg-gray-300 px-4 py-1 text-black shadow hover:bg-gray-400"
									>
										Cancel
									</button>
									<button
										type="button"
										onClick={handleApplyDrawing}
										className="rounded bg-blue-600 px-4 py-1 text-white shadow hover:bg-blue-700"
									>
										Apply
									</button>
								</div>
							)}
						</div>
					)}
					{boundaryApplied && (
						<button
							onClick={handleRemoveBoundaries}
							type="button"
							className="absolute top-4 right-4 z-10 flex cursor-pointer items-center rounded-lg bg-red-500 px-4 py-2 text-white shadow-lg hover:bg-red-600"
						>
							<span className="mr-2">Remove Boundaries</span>
							<button type="button">&#x2715;</button>
						</button>
					)}
					<DrawingManager
						onPolygonComplete={onShapeComplete}
						onRectangleComplete={onShapeComplete}
						onCircleComplete={onShapeComplete}
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
				</GoogleMap>
			</div>
		</LoadScript>
	);
};
export default MapSection;
