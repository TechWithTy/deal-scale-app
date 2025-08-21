"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Library } from "@googlemaps/js-api-loader";
import type { Coordinates, MapInit, OnSave } from "../types";
import { useGoogleMapsLoader } from "../hooks/useGoogleMapsLoader";
import { MapCanvas } from "./MapCanvas";
import { PinMarker } from "./PinMarker";
import { SearchInputs } from "./Controls/SearchInputs";
import { Map3DToggle } from "./Controls/Map3DToggle";
import { NestedMapDialog } from "./Controls/NestedMapDialog";

export type MapContainerProps = {
	defaultCenter: Coordinates;
	defaultZoom?: number;
	initialPin?: Coordinates | null;
	onSave?: OnSave;
	apiKey?: string;
	libraries?: Library[];
};

export function MapContainer({
	defaultCenter,
	defaultZoom = 12,
	initialPin = null,
	onSave,
	apiKey,
	libraries,
}: MapContainerProps) {
	const { loaded, error } = useGoogleMapsLoader(apiKey, libraries);
	const [map, setMap] = useState<google.maps.Map | null>(null);
	const [coords, setCoords] = useState<Coordinates | null>(initialPin);
	const init: MapInit = useMemo(
		() => ({ center: coords ?? defaultCenter, zoom: defaultZoom }),
		[coords, defaultCenter, defaultZoom],
	);

	// Drawing state (polygon/rectangle/circle)
	const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(
		null,
	);
	const shapeRef = useRef<
		google.maps.Polygon | google.maps.Rectangle | google.maps.Circle | null
	>(null);
	const [drawingMode, setDrawingMode] =
		useState<google.maps.drawing.OverlayType | null>(null);
	const [shapeDrawn, setShapeDrawn] = useState(false);
	const [boundaryApplied, setBoundaryApplied] = useState(false);

	useEffect(() => {
		if (!map) return;
		map.addListener("click", (e: google.maps.MapMouseEvent) => {
			const ll = e.latLng?.toJSON();
			if (ll) setCoords(ll);
		});
	}, [map]);

	// Initialize DrawingManager once
	useEffect(() => {
		if (!map || drawingManagerRef.current) return;
		if (!google.maps.drawing) return; // drawing library must be loaded
		const dm = new google.maps.drawing.DrawingManager({
			drawingMode: null,
			drawingControl: false,
			polygonOptions: {
				fillColor: "#2196F3",
				fillOpacity: 0.5,
				strokeWeight: 2,
				clickable: false,
				editable: true,
				zIndex: 1,
			},
		});
		dm.setMap(map);
		drawingManagerRef.current = dm;

		google.maps.event.addListener(
			dm,
			"polygoncomplete",
			(poly: google.maps.Polygon) => onShapeComplete(poly),
		);
		google.maps.event.addListener(
			dm,
			"rectanglecomplete",
			(rect: google.maps.Rectangle) => onShapeComplete(rect),
		);
		google.maps.event.addListener(
			dm,
			"circlecomplete",
			(circle: google.maps.Circle) => onShapeComplete(circle),
		);
	}, [map]);

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
			drawingManagerRef.current?.setDrawingMode(null);
			setShapeDrawn(true);
		},
		[clearShape],
	);

	const handleCancelDrawing = useCallback(() => {
		clearShape();
		setDrawingMode(null);
		drawingManagerRef.current?.setDrawingMode(null);
		setShapeDrawn(false);
		setBoundaryApplied(false);
	}, [clearShape]);

	const handleApplyDrawing = useCallback(() => {
		if (!shapeRef.current || !map) return;
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
		if (bounds) {
			map.fitBounds(bounds);
		}
		setBoundaryApplied(true);
	}, [map]);

	const handleRemoveBoundaries = useCallback(() => {
		handleCancelDrawing();
	}, [handleCancelDrawing]);

	if (error)
		return <div role="alert">Failed to load Google Maps. Please retry.</div>;
	if (!loaded) return <div>Loading map…</div>;

	return (
		<div className="grid gap-4">
			<div className="flex items-center justify-between gap-4">
				<SearchInputs
					map={map}
					value={{ coords }}
					onChange={(v) => setCoords(v.coords)}
					onSave={(d) => onSave?.(d)}
				/>
				<Map3DToggle map={map} />
				<NestedMapDialog coords={coords} onApply={(c) => setCoords(c)} />
			</div>
			<div className="relative h-[500px] w-full">
				<MapCanvas init={init} onReady={setMap} />
				<PinMarker
					map={map}
					coords={coords}
					draggable
					onDragEnd={(p) => setCoords(p)}
				/>
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
										onClick={() => {
											setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
											drawingManagerRef.current?.setDrawingMode(
												google.maps.drawing.OverlayType.POLYGON,
											);
										}}
									>
										Polygon
									</button>
									<button
										type="button"
										className="rounded bg-blue-600 px-4 py-2 text-white text-xs hover:bg-blue-700"
										onClick={() => {
											setDrawingMode(google.maps.drawing.OverlayType.RECTANGLE);
											drawingManagerRef.current?.setDrawingMode(
												google.maps.drawing.OverlayType.RECTANGLE,
											);
										}}
									>
										Rectangle
									</button>
									<button
										type="button"
										className="rounded bg-blue-600 px-4 py-2 text-white text-xs hover:bg-blue-700"
										onClick={() => {
											setDrawingMode(google.maps.drawing.OverlayType.CIRCLE);
											drawingManagerRef.current?.setDrawingMode(
												google.maps.drawing.OverlayType.CIRCLE,
											);
										}}
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
			</div>
		</div>
	);
}
