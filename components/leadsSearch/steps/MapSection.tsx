import type { Coordinate } from "@/types/_dashboard/maps";
import { GoogleMap, LoadScript, DrawingManager } from "@react-google-maps/api";
import React, { useRef, useEffect, useState } from "react";
import type { FC } from "react";

interface MapSectionProps {
	markers: Coordinate[];
	center: Coordinate;
	mapKey?: string;
	drawingMode: google.maps.drawing.OverlayType | null;
	shapeDrawn: boolean;
	boundaryApplied: boolean;
	onDrawPolygon: () => void;
	onDrawRectangle: () => void;
	onDrawCircle: () => void;
	onDrawPolyline: () => void;
	onCancelDrawing: () => void;
	onApplyDrawing: () => void;
	onRemoveBoundaries: () => void;
	onShapeComplete: (
		shape:
			| google.maps.Polygon
			| google.maps.Rectangle
			| google.maps.Circle
			| google.maps.Polyline,
	) => void;
}

const mapContainerStyle = {
	width: "100%",
	height: "350px",
};

// To use Advanced Markers, you must provide a valid Map ID from Google Cloud Console.
// Set NEXT_PUBLIC_GMAPS_MAP_ID in your .env.local, then restart your dev server.
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
	drawingMode,
	shapeDrawn,
	boundaryApplied,
	onDrawPolygon,
	onDrawRectangle,
	onDrawCircle,
	onDrawPolyline,
	onCancelDrawing,
	onApplyDrawing,
	onRemoveBoundaries,
	onShapeComplete,
}) => {
	const [isMapLoaded, setIsMapLoaded] = useState(false);
	const [mapLoadError, setMapLoadError] = useState<string | null>(null);
	const mapRef = useRef<google.maps.Map | null>(null);
	// Store marker instances for cleanup
	const markerRefs = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

	useEffect(() => {
		console.log("[DEBUG] useEffect for markers running", {
			markers,
			map: mapRef.current,
			advMarker: window.google?.maps?.marker?.AdvancedMarkerElement,
			isMapLoaded,
		});
		if (!isMapLoaded) {
			console.log("[DEBUG] Skipping marker effect: map not loaded");
			return;
		}
		if (!mapRef.current) {
			console.log("[DEBUG] Skipping marker effect: mapRef.current is null");
			return;
		}
		if (!window.google?.maps?.marker?.AdvancedMarkerElement) {
			console.log(
				"[DEBUG] Skipping marker effect: AdvancedMarkerElement not loaded",
			);
			return;
		}
		// Remove old markers
		for (const marker of markerRefs.current) {
			// [DEBUG] Removing marker from map
			console.log("[DEBUG] Removing AdvancedMarkerElement", marker);
			marker.map = null;
		}
		markerRefs.current = [];
		// Add new markers
		markerRefs.current = markers.map((markerData) => {
			// [DEBUG] Log marker creation
			console.log("[DEBUG] Creating AdvancedMarkerElement", {
				markerData,
				map: mapRef.current,
			});
			const marker = new window.google.maps.marker.AdvancedMarkerElement({
				map: mapRef.current,
				position: markerData,
			});
			return marker;
		});
		return () => {
			for (const marker of markerRefs.current) {
				marker.map = null;
			}
			markerRefs.current = [];
		};
	}, [markers, isMapLoaded]);

	// Show error UI if map failed to load
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
			onError={() => {
				setMapLoadError(
					"Google Maps failed to load. This is usually caused by an invalid API key, missing billing, or incorrect referrer restrictions. See the browser console for the exact error message and fix guidance.",
				);
				// Log extra debug info
				console.error("[MAP ERROR] Google Maps failed to load.", {
					apiKey: mapKey || process.env.NEXT_PUBLIC_GMAPS_KEY || "(none)",
					env: process.env.NODE_ENV,
				});
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
						console.log(
							"[DEBUG] GoogleMap onLoad: map is loaded and ready",
							map,
						);
					}}
				>
					{/* Markers managed with AdvancedMarkerElement in useEffect */}
					{/* Drawing Controls Overlay */}
					{!boundaryApplied && (
						<div
							className="-translate-x-1/2 absolute top-10 left-1/2 z-10 transform rounded-lg bg-white p-2 text-center opacity-80 shadow-lg transition-opacity duration-300 hover:opacity-100 lg:top-2"
							style={{ pointerEvents: "auto" }}
						>
							{!drawingMode ? (
								<p className="mb-2 font-semibold text-gray-800 text-sm">
									Draw a shape around the properties you’d like to search for
								</p>
							) : (
								<p className="mb-2 font-semibold text-gray-800 text-sm">
									Start Drawing!
								</p>
							)}
							{/* Drawing buttons */}
							{!shapeDrawn && (
								<div className="mb-2 flex flex-col items-center space-y-2">
									<div className="flex justify-center space-x-2">
										<button
											type="button"
											className="rounded bg-blue-600 px-4 py-2 text-white text-xs hover:bg-blue-700"
											onClick={onDrawPolygon}
										>
											Polygon
										</button>
										<button
											type="button"
											className="rounded bg-blue-600 px-4 py-2 text-white text-xs hover:bg-blue-700"
											onClick={onDrawRectangle}
										>
											Rectangle
										</button>
										<button
											type="button"
											className="rounded bg-blue-600 px-4 py-2 text-white text-xs hover:bg-blue-700"
											onClick={onDrawCircle}
										>
											Circle
										</button>
										<button
											type="button"
											className="rounded bg-blue-600 px-4 py-2 text-white text-xs hover:bg-blue-700"
											onClick={onDrawPolyline}
										>
											Polyline
										</button>
									</div>
									{/* Cancel button */}
									{drawingMode && (
										<button
											type="button"
											className="mt-2 rounded bg-red-600 px-4 py-2 text-white text-xs hover:bg-red-700"
											onClick={onCancelDrawing}
										>
											Cancel Drawing
										</button>
									)}
								</div>
							)}
							{/* Apply and Cancel buttons after drawing */}
							{shapeDrawn && (
								<div className="flex justify-center space-x-4">
									<button
										type="button"
										onClick={onCancelDrawing}
										className="rounded bg-gray-300 px-4 py-1 text-black shadow hover:bg-gray-400"
									>
										Cancel
									</button>
									<button
										type="button"
										onClick={onApplyDrawing}
										className="rounded bg-blue-600 px-4 py-1 text-white shadow hover:bg-blue-700"
									>
										Apply
									</button>
								</div>
							)}
						</div>
					)}
					{/* Remove Boundaries */}
					{boundaryApplied && (
						<button
							onClick={onRemoveBoundaries}
							type="button"
							className="absolute top-4 right-4 z-10 flex cursor-pointer items-center rounded-lg bg-red-500 px-4 py-2 text-white shadow-lg hover:bg-red-600"
						>
							<span className="mr-2">Remove Boundaries</span>
							<button type="button">&#x2715;</button>
						</button>
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
				</GoogleMap>
			</div>
		</LoadScript>
	);
};
export default MapSection;
