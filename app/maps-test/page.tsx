"use client";
import { GoogleMap, LoadScript, DrawingManager } from "@react-google-maps/api";
import { useCallback, useEffect, useRef, useState } from "react";
import { NestedMapDialog } from "@/external/google-maps/components/Controls/NestedMapDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
	// Pin state
	const [coords, setCoords] =
		useState<google.maps.LatLngLiteral>(defaultCenter);
	const [lat, setLat] = useState<string>(String(defaultCenter.lat));
	const [lng, setLng] = useState<string>(String(defaultCenter.lng));
	const [drawingMode, setDrawingMode] =
		useState<google.maps.drawing.OverlayType | null>(null);
	const [shapeDrawn, setShapeDrawn] = useState(false);
	const [boundaryApplied, setBoundaryApplied] = useState(false);
	const shapeRef = useRef<
		google.maps.Polygon | google.maps.Rectangle | google.maps.Circle | null
	>(null);
	const mapRef = useRef<google.maps.Map | null>(null);
	const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(
		null,
	);
	const simMarkerRefs = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
	const [simulatedPins, setSimulatedPins] = useState<
		google.maps.LatLngLiteral[]
	>([]);

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
		setSimulatedPins([]);
		// clear sim markers
		for (const m of simMarkerRefs.current) m.map = null;
		simMarkerRefs.current = [];
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
		// Simulate fetching pins within the drawn area
		const generatePins = (count = 30): google.maps.LatLngLiteral[] => {
			const pts: google.maps.LatLngLiteral[] = [];
			if (!bounds) return pts;
			const sw = bounds.getSouthWest();
			const ne = bounds.getNorthEast();
			const rand = (min: number, max: number) =>
				Math.random() * (max - min) + min;
			const withinCircle = (p: google.maps.LatLng) => {
				if (!(shapeRef.current instanceof google.maps.Circle)) return true;
				const center = shapeRef.current.getCenter();
				const radius = shapeRef.current.getRadius();
				// requires geometry library
				const d = google.maps.geometry.spherical.computeDistanceBetween(
					center,
					p,
				);
				return d <= radius;
			};
			const withinPolygon = (p: google.maps.LatLng) => {
				if (!(shapeRef.current instanceof google.maps.Polygon)) return true;
				return google.maps.geometry.poly.containsLocation(p, shapeRef.current);
			};
			let attempts = 0;
			while (pts.length < count && attempts < count * 50) {
				attempts++;
				const lat = rand(sw.lat(), ne.lat());
				const lng = rand(sw.lng(), ne.lng());
				const p = new google.maps.LatLng(lat, lng);
				if (withinCircle(p) && withinPolygon(p)) {
					pts.push({ lat, lng });
				}
			}
			return pts;
		};
		setSimulatedPins(generatePins());
		setBoundaryApplied(true);
	}, []);

	const handleRemoveBoundaries = useCallback(() => {
		handleCancelDrawing();
	}, [handleCancelDrawing]);

	// Sync text inputs when coords change
	useEffect(() => {
		setLat(String(coords.lat));
		setLng(String(coords.lng));
	}, [coords]);

	// Render simulated pins as AdvancedMarkers
	useEffect(() => {
		if (!mapRef.current) return;
		for (const m of simMarkerRefs.current) m.map = null;
		simMarkerRefs.current = [];
		if (window.google?.maps?.marker?.AdvancedMarkerElement) {
			simMarkerRefs.current = simulatedPins.map(
				(p) =>
					new window.google.maps.marker.AdvancedMarkerElement({
						map: mapRef.current!,
						position: p,
					}),
			);
		}
		return () => {
			for (const m of simMarkerRefs.current) m.map = null;
		};
	}, [simulatedPins]);

	// Initialize / update AdvancedMarker
	useEffect(() => {
		if (!mapRef.current || !coords) return;
		if (!markerRef.current) {
			markerRef.current = new google.maps.marker.AdvancedMarkerElement({
				map: mapRef.current,
				position: coords,
				gmpDraggable: true,
			});
			markerRef.current.addListener(
				"dragend",
				(e: google.maps.MapMouseEvent) => {
					const p = e.latLng?.toJSON();
					if (p) setCoords(p);
				},
			);
		} else {
			markerRef.current.position = coords;
			if (!markerRef.current.map) markerRef.current.map = mapRef.current;
		}
	}, [coords]);

	return (
		<main className="container mx-auto max-w-5xl p-6">
			<h1 className="mb-4 text-2xl font-semibold">Google Maps Test</h1>
			<p className="mb-6 text-sm text-muted-foreground">
				Click on the map to drop a pin. Use the search inputs and controls to
				explore features.
			</p>
			<div className="mb-4 flex items-end justify-between gap-4">
				<div className="grid gap-2">
					<Input placeholder="Search address" aria-label="Search address" />
					<div className="grid grid-cols-2 gap-2">
						<Input
							value={lat}
							onChange={(e) => setLat(e.target.value)}
							placeholder="Latitude"
							aria-label="Latitude"
						/>
						<Input
							value={lng}
							onChange={(e) => setLng(e.target.value)}
							placeholder="Longitude"
							aria-label="Longitude"
						/>
					</div>
					<div className="flex gap-2">
						<Button
							type="button"
							onClick={() => {
								const nlat = Number(lat);
								const nlng = Number(lng);
								if (Number.isFinite(nlat) && Number.isFinite(nlng)) {
									const c = {
										lat: nlat,
										lng: nlng,
									} as google.maps.LatLngLiteral;
									setCoords(c);
									mapRef.current?.panTo(c);
									mapRef.current?.setZoom(16);
								}
							}}
						>
							Update Pin
						</Button>
						<Button type="button" variant="secondary">
							Save Location
						</Button>
					</div>
				</div>
				<NestedMapDialog
					coords={coords}
					results={simulatedPins}
					onApply={(c) => setCoords(c)}
					onResultsChange={(pins) => setSimulatedPins(pins)}
				/>
			</div>
			<LoadScript
				googleMapsApiKey={
					process.env.NEXT_PUBLIC_GMAPS_KEY ||
					process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
					""
				}
				libraries={["drawing", "marker", "places", "geometry"]}
			>
				<div style={{ position: "relative", width: "100%", height: "500px" }}>
					<GoogleMap
						mapContainerStyle={mapContainerStyle}
						center={coords}
						zoom={12}
						options={mapOptions}
						onLoad={(map) => {
							mapRef.current = map;
							// Click to move pin
							map.addListener("click", (e: google.maps.MapMouseEvent) => {
								const p = e.latLng?.toJSON();
								if (p) setCoords(p);
							});
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
