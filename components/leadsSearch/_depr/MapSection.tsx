// import type { Coordinate } from "@/types/_dashboard/maps";
// import {
// 	GoogleMap,
// 	LoadScript,
// 	Marker,
// 	DrawingManager,
// } from "@react-google-maps/api";
// import type { FC } from "react";

// interface MapSectionProps {
// 	markers: Coordinate[];
// 	center: Coordinate;
// 	mapKey?: string;
// 	drawingMode: google.maps.drawing.OverlayType | null;
// 	shapeDrawn: boolean;
// 	boundaryApplied: boolean;
// 	onDrawPolygon: () => void;
// 	onDrawRectangle: () => void;
// 	onDrawCircle: () => void;
// 	onDrawPolyline: () => void;
// 	onCancelDrawing: () => void;
// 	onApplyDrawing: () => void;
// 	onRemoveBoundaries: () => void;
// 	onShapeComplete: (shape: any) => void;
// }

// const mapContainerStyle = {
// 	width: "100%",
// 	height: "350px",
// };

// const mapOptions = {
// 	mapTypeId: "roadmap",
// 	disableDefaultUI: true,
// 	zoomControl: true,
// };

// const MapSection: FC<MapSectionProps> = ({
// 	markers,
// 	center,
// 	mapKey,
// 	drawingMode,
// 	shapeDrawn,
// 	boundaryApplied,
// 	onDrawPolygon,
// 	onDrawRectangle,
// 	onDrawCircle,
// 	onDrawPolyline,
// 	onCancelDrawing,
// 	onApplyDrawing,
// 	onRemoveBoundaries,
// 	onShapeComplete,
// }) => (
// 	<LoadScript
// 		googleMapsApiKey={mapKey || process.env.NEXT_PUBLIC_GMAPS_KEY || ""}
// 		libraries={["drawing"]}
// 	>
// 		<div style={{ position: "relative", width: "100%", height: "350px" }}>
// 			<GoogleMap
// 				mapContainerStyle={mapContainerStyle}
// 				center={center}
// 				zoom={12}
// 				options={mapOptions}
// 			>
// 				{/* Markers */}
// 				{markers.map((marker, idx) => (
// 					<Marker
// 						key={`${marker.lat},${marker.lng}${idx}`}
// 						position={{ lat: marker.lat, lng: marker.lng }}
// 					/>
// 				))}
// 				{/* Drawing Controls Overlay */}
// 				{!boundaryApplied && (
// 					<div
// 						className="-translate-x-1/2 absolute top-10 left-1/2 z-10 transform rounded-lg bg-white p-2 text-center opacity-80 shadow-lg transition-opacity duration-300 hover:opacity-100 lg:top-2"
// 						style={{ pointerEvents: "auto" }}
// 					>
// 						{!drawingMode ? (
// 							<p className="mb-2 font-semibold text-gray-800 text-sm">
// 								Draw a shape around the properties you’d like to search for
// 							</p>
// 						) : (
// 							<p className="mb-2 font-semibold text-gray-800 text-sm">
// 								Start Drawing!
// 							</p>
// 						)}
// 						{/* Drawing buttons */}
// 						{!shapeDrawn && (
// 							<div className="mb-2 flex flex-col items-center space-y-2">
// 								<div className="flex justify-center space-x-2">
// 									<button
// 										type="button"
// 										className="rounded bg-blue-600 px-4 py-2 text-white text-xs hover:bg-blue-700"
// 										onClick={onDrawPolygon}
// 									>
// 										Polygon
// 									</button>
// 									<button
// 										type="button"
// 										className="rounded bg-blue-600 px-4 py-2 text-white text-xs hover:bg-blue-700"
// 										onClick={onDrawRectangle}
// 									>
// 										Rectangle
// 									</button>
// 									<button
// 										type="button"
// 										className="rounded bg-blue-600 px-4 py-2 text-white text-xs hover:bg-blue-700"
// 										onClick={onDrawCircle}
// 									>
// 										Circle
// 									</button>
// 									<button
// 										type="button"
// 										className="rounded bg-blue-600 px-4 py-2 text-white text-xs hover:bg-blue-700"
// 										onClick={onDrawPolyline}
// 									>
// 										Polyline
// 									</button>
// 								</div>
// 								{/* Cancel button */}
// 								{drawingMode && (
// 									<button
// 										type="button"
// 										className="mt-2 rounded bg-red-600 px-4 py-2 text-white text-xs hover:bg-red-700"
// 										onClick={onCancelDrawing}
// 									>
// 										Cancel Drawing
// 									</button>
// 								)}
// 							</div>
// 						)}
// 						{/* Apply and Cancel buttons after drawing */}
// 						{shapeDrawn && (
// 							<div className="flex justify-center space-x-4">
// 								<button
// 									type="button"
// 									onClick={onCancelDrawing}
// 									className="rounded bg-gray-300 px-4 py-1 text-black shadow hover:bg-gray-400"
// 								>
// 									Cancel
// 								</button>
// 								<button
// 									onClick={onApplyDrawing}
// 									type="button"
// 									className="rounded bg-blue-600 px-4 py-1 text-white shadow hover:bg-blue-700"
// 								>
// 									Apply
// 								</button>
// 							</div>
// 						)}
// 					</div>
// 				)}
// 				{/* Remove Boundaries */}
// 				{boundaryApplied && (
// 					<button
// 						onClick={onRemoveBoundaries}
// 						type="button"
// 						className="absolute top-4 right-4 z-10 flex cursor-pointer items-center rounded-lg bg-red-500 px-4 py-2 text-white shadow-lg hover:bg-red-600"
// 					>
// 						<span className="mr-2">Remove Boundaries</span>
// 						<button type="button">&#x2715;</button>
// 					</button>
// 				)}
// 				{/* Drawing Manager */}
// 				<DrawingManager
// 					onPolygonComplete={onShapeComplete}
// 					onRectangleComplete={onShapeComplete}
// 					onCircleComplete={onShapeComplete}
// 					onPolylineComplete={onShapeComplete}
// 					options={{
// 						drawingControl: false,
// 						drawingMode: drawingMode,
// 						polygonOptions: {
// 							fillColor: "#2196F3",
// 							fillOpacity: 0.5,
// 							strokeWeight: 2,
// 							clickable: false,
// 							editable: true,
// 							zIndex: 1,
// 						},
// 					}}
// 				/>
// 			</GoogleMap>
// 		</div>
// 	</LoadScript>
// );

// export default MapSection;
