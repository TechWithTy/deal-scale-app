// import { MockInHouseLeadAgrigator } from "@/constants/dashboard/properties";
// import { usePropertyStore } from "@/lib/stores/leadSearch/drawer";
// import MapContainer from "../properties/mapContainer";
// import DrawingControls from "../properties/drawingControls";
// import MarkersLayer from "../properties/markersLayer";
// import React, { useRef, useEffect } from "react";
// import PropertyListView from "../properties/propertyList";

// interface MapComponentProps {
// 	apiKey: string;
// 	center: { lat: number; lng: number };
// 	markers: { lat: number; lng: number }[];
// 	zoom: number;
// }

// const mapContainerStyle = {
// 	width: "100%",
// 	height: "100%",
// };

// const MapComponent: React.FC<MapComponentProps> = ({
// 	apiKey,
// 	center,
// 	markers,
// 	zoom,
// }) => {
// 	// Get the relevant state from Zustand store
// 	const {
// 		visibleProperties, // Zustand-managed properties list
// 		setProperties, // Action to set properties in the store
// 		isDrawerOpen, // Drawer visibility state
// 		loadMoreProperties, // Action to load more properties (pagination)
// 		hasMore, // Whether there are more properties to load
// 		isLoading, // Loading state
// 	} = usePropertyStore();

// 	const [drawingMode, setDrawingMode] =
// 		React.useState<google.maps.drawing.OverlayType | null>(null);
// 	const [shapeDrawn, setShapeDrawn] = React.useState(false);
// 	const [boundaryApplied, setBoundaryApplied] = React.useState(false);
// 	const shapeRef = useRef<any>(null);

// 	const onShapeComplete = (shape: any) => {
// 		if (shapeRef.current) {
// 			shapeRef.current.setMap(null); // Remove previous shape if exists
// 		}
// 		shapeRef.current = shape; // Store the new shape
// 		setDrawingMode(null);
// 		setShapeDrawn(true);
// 	};

// 	const handleCancel = () => {
// 		if (shapeRef.current) {
// 			shapeRef.current.setMap(null); // Remove shape from map
// 			shapeRef.current = null; // Clear the reference
// 		}
// 		setDrawingMode(null); // Stop the drawing mode
// 		setShapeDrawn(false); // Reset shape drawn state
// 		// console.log('Drawing canceled');
// 	};

// 	const handleApply = () => {
// 		if (shapeRef.current) {
// 			setBoundaryApplied(true);
// 			setShapeDrawn(false);
// 			// console.log('Drawing applied');
// 		}
// 	};

// 	const handleRemoveBoundaries = () => {
// 		if (shapeRef.current) {
// 			shapeRef.current.setMap(null); // Remove the shape completely
// 			shapeRef.current = null;
// 		}
// 		setBoundaryApplied(false);
// 		// console.log('Boundaries removed');
// 	};

// 	// Load properties into the Zustand store, but don't override unless necessary
// 	// useEffect(() => {
// 	//   // Assuming fetchProperties is a function that fetches new properties from an API
// 	//   const fetchProperties = async () => {
// 	//     const newProperties = await fetch('https://api.example.com/properties').then(res => res.json());
// 	//     if (newProperties && newProperties.length > 0) {
// 	//       setProperties((prevProperties) => [...prevProperties, ...newProperties]);
// 	//     }
// 	//   };

// 	//   fetchProperties();
// 	// }, [setProperties]);

// 	// Log the state of visibleProperties and isDrawerOpen whenever they change

// 	useEffect(() => {
// 		setProperties(MockInHouseLeadAgrigator); // Use mock data to initialize Zustand properties
// 	}, [setProperties]);

// 	useEffect(() => {}, [visibleProperties, isDrawerOpen]);

// 	return (
// 		<MapContainer
// 			apiKey={apiKey}
// 			center={center}
// 			zoom={zoom}
// 			mapContainerStyle={mapContainerStyle}
// 		>
// 			{/* Markers */}
// 			<MarkersLayer markers={markers} />

// 			{/* Drawing Controls */}
// 			{!boundaryApplied && (
// 				<DrawingControls
// 					drawingMode={drawingMode}
// 					setDrawingMode={setDrawingMode}
// 				/>
// 			)}

// 			{/* Remove Boundaries */}
// 			{boundaryApplied && (
// 				<div
// 					onClick={handleRemoveBoundaries}
// 					className="absolute top-4 right-4 z-10 flex cursor-pointer items-center rounded-lg bg-red-500 px-4 py-2 text-white shadow-lg hover:bg-red-600"
// 				>
// 					<span className="mr-2">Remove Boundaries</span>
// 					<button>&#x2715;</button>
// 				</div>
// 			)}

// 			{/* Drawing Manager */}
// 			<DrawingManager
// 				onPolygonComplete={onShapeComplete}
// 				onRectangleComplete={onShapeComplete}
// 				onCircleComplete={onShapeComplete}
// 				onPolylineComplete={onShapeComplete}
// 				options={{
// 					drawingControl: false,
// 					drawingMode: drawingMode,
// 					polygonOptions: {
// 						fillColor: "#2196F3",
// 						fillOpacity: 0.5,
// 						strokeWeight: 2,
// 						clickable: false,
// 						editable: true,
// 						zIndex: 1,
// 					},
// 				}}
// 			/>

// 			{/* Property List View (Drawer) */}
// 			{isDrawerOpen && visibleProperties.length > 0 && (
// 				<div
// 					className="absolute bottom-0 left-0 z-50 w-full"
// 					style={{ maxWidth: "100%", overflow: "hidden" }}
// 				>
// 					<PropertyListView properties={visibleProperties} />
// 					{hasMore && !isLoading && (
// 						<div className="flex justify-center p-4">
// 							<button onClick={loadMoreProperties}>Load More Properties</button>
// 						</div>
// 					)}
// 				</div>
// 			)}
// 		</MapContainer>
// 	);
// };

// export default MapComponent;
