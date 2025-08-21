"use client";
import { GoogleMap, LoadScript, DrawingManager } from "@react-google-maps/api";
import { useCallback, useRef, useState } from "react";

const defaultCenter: google.maps.LatLngLiteral = {
	lat: 39.7392,
	lng: -104.9903,
}; // Denver, CO

const mapContainerStyle = { width: "100%", height: "500px" } as const;
const mapOptions: google.maps.MapOptions = {
	mapTypeId: "roadmap",
	disableDefaultUI: true,
	zoomControl: true,
	mapId: process.env.NEXT_PUBLIC_GMAPS_MAP_ID,
};

export default function MapsTestPage() {
	const [drawingMode, setDrawingMode] =
		useState<google.maps.drawing.OverlayType | null>(null);
	const [shapeDrawn, setShapeDrawn] = useState(false);
	const [boundaryApplied, setBoundaryApplied] = useState(false);
	const shapeRef = useRef<
		google.maps.Polygon | google.maps.Rectangle | google.maps.Circle | null
	>(null);
	const mapRef = useRef<google.maps.Map | null>(null);

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
		setBoundaryApplied(false);
	}, [clearShape]);

	const handleApplyDrawing = useCallback(() => {
		if (!shapeRef.current || !mapRef.current) return;
		let bounds: google.maps.LatLngBounds | null = null;
		if (shapeRef.current instanceof google.maps.Rectangle) {
			bounds = shapeRef.current.getBounds() ?? null;
		} else if (shapeRef.current instanceof google.maps.Circle) {
			bounds = shapeRef.current.getBounds() ?? null;
		} else if (shapeRef.current instanceof google.maps.Polygon) {
			bounds = new google.maps.LatLngBounds();
			const path = shapeRef.current.getPath();
			for (const latLng of path.getArray()) bounds.extend(latLng);
		}
		if (bounds) mapRef.current.fitBounds(bounds);
		setBoundaryApplied(true);
	}, []);

	const handleRemoveBoundaries = useCallback(() => {
		handleCancelDrawing();
	}, [handleCancelDrawing]);

	return (
		<main className="container mx-auto max-w-5xl p-6">
			<h1 className="mb-4 text-2xl font-semibold">Google Maps Test</h1>
			<p className="mb-6 text-sm text-muted-foreground">
				Click on the map to drop a pin. Use the search inputs and controls to
				explore features.
			</p>
			<LoadScript
				googleMapsApiKey={
					process.env.NEXT_PUBLIC_GMAPS_KEY ||
					process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
					""
				}
				libraries={["drawing", "marker", "places"]}
			>
				<div style={{ position: "relative", width: "100%", height: "500px" }}>
					<GoogleMap
						mapContainerStyle={mapContainerStyle}
						center={defaultCenter}
						zoom={12}
						options={mapOptions}
						onLoad={(map) => {
							mapRef.current = map;
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
													setDrawingMode(
														google.maps.drawing.OverlayType.POLYGON,
													)
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
						{/* Map children here if needed */}
					</GoogleMap>
				</div>
			</LoadScript>
		</main>
	);
}
