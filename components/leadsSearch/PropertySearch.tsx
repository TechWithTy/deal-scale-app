import { Button } from "@/components/ui/button";
import {
	calculateCenter,
	mockFetchAddressesFromApi,
} from "@/constants/utility/maps";
import { usePropertyStore } from "@/lib/stores/leadSearch/drawer";
// * Import mock property data generator
import type { Coordinate, MapFormSchemaType } from "@/types/_dashboard/maps";
import { mapFormSchema } from "@/types/zod/propertyList";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";
// * PropertySearch.tsx
// ! Main property search component combining all subcomponents for the leads search feature
import React, { useRef } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { campaignSteps } from "@/_tests/tours/campaignTour";
import AdvancedFiltersDialog from "./steps/AdvancedFiltersDialog";
import { mockUserProfile } from "@/constants/_faker/profile/userProfile";
import HelpModal from "./steps/HelpModal";
import LeadSearchForm from "./steps/LeadSearchForm";
import LeadSearchHeader from "./steps/LeadSearchHeader";
import MapSection from "./steps/MapSection";
import PropertiesList from "./propertyList";
import WalkThroughModal from "../reusables/tutorials/walkthroughModal";
// ! Use named import, not default
import { generateFakeProperties } from "@/constants/dashboard/properties";

const normalizeFormValues = (values: unknown): unknown => {
	if (typeof values !== "object" || values === null) return values;
	if (Array.isArray(values)) return values.map(normalizeFormValues);
	return Object.entries(values).reduce(
		(acc, [key, value]) => {
			acc[key] = value === "" ? undefined : normalizeFormValues(value);
			return acc;
		},
		{} as Record<string, unknown>,
	);
};
const PropertySearch: React.FC = () => {
	// * Debug: log form state every render
	const formRef = React.useRef<unknown>(null);
	const [hasResults, setHasResults] = useState(false);
	const { properties, setProperties, isDrawerOpen, setIsDrawerOpen } =
		usePropertyStore();

	// * Set default properties on mount
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	React.useEffect(() => {
		// ! Populate with mock properties initially (replace with API call in production)
		setProperties(generateFakeProperties(12));
		// * Do NOT open the drawer on initial load
	}, []);
	const [showAdvanced, setShowAdvanced] = useState(false);
	const [isTourOpen, setIsTourOpen] = useState(false);
	const [showAllErrors, setShowAllErrors] = React.useState(true);

	const [center, setCenter] = useState<Coordinate>({
		lat: 39.7392,
		lng: -104.9903,
	});
	const [isModalOpen, setIsModalOpen] = useState(false);
	const handleStartTour = () => setIsTourOpen(true);
	const handleCloseTour = () => setIsTourOpen(false);
	const [markers, setMarkers] = useState<Coordinate[]>([
		{ lat: 39.7392, lng: -104.9903 },
		{ lat: 39.7294, lng: -104.8319 },
	]);
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

	const clearShape = () => {
		if (shapeRef.current) {
			shapeRef.current.setMap(null);
			shapeRef.current = null;
		}
	};

	const handleDrawPolygon = () => {
		if (shapeDrawn && !boundaryApplied) handleCancelDrawing();
		setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
	};
	const handleDrawRectangle = () => {
		if (shapeDrawn && !boundaryApplied) handleCancelDrawing();
		setDrawingMode(google.maps.drawing.OverlayType.RECTANGLE);
	};
	const handleDrawCircle = () => {
		if (shapeDrawn && !boundaryApplied) handleCancelDrawing();
		setDrawingMode(google.maps.drawing.OverlayType.CIRCLE);
	};
	const handleDrawPolyline = () => {
		if (shapeDrawn && !boundaryApplied) handleCancelDrawing();
		setDrawingMode(google.maps.drawing.OverlayType.POLYLINE);
	};

	const handleCancelDrawing = () => {
		clearShape();
		setDrawingMode(null);
		setShapeDrawn(false);
	};

	const handleRemoveBoundaries = () => {
		clearShape();
		setBoundaryApplied(false);
		// Optionally: reset property filters
	};

	// Store the most recent shape bounds for use on Apply
	const [pendingMarkerBounds, setPendingMarkerBounds] = useState<
		{ north: number; south: number; east: number; west: number } | undefined
	>(undefined);

	const handleShapeComplete = (
		shape:
			| google.maps.Polygon
			| google.maps.Rectangle
			| google.maps.Circle
			| google.maps.Polyline,
	) => {
		clearShape();
		shapeRef.current = shape;
		setDrawingMode(null);
		setShapeDrawn(true);

		// Extract bounds and store for use on Apply
		let bounds:
			| { north: number; south: number; east: number; west: number }
			| undefined = undefined;
		if (shape instanceof window.google.maps.Rectangle) {
			const b = shape.getBounds();
			if (b) {
				bounds = {
					north: b.getNorthEast().lat(),
					south: b.getSouthWest().lat(),
					east: b.getNorthEast().lng(),
					west: b.getSouthWest().lng(),
				};
			}
		} else if (shape instanceof window.google.maps.Circle) {
			const center = shape.getCenter();
			const radius = shape.getRadius();
			if (center && typeof radius === "number") {
				const lat = center.lat();
				const lng = center.lng();
				const deltaDeg = radius / 111320; // rough meters to degrees
				bounds = {
					north: lat + deltaDeg,
					south: lat - deltaDeg,
					east: lng + deltaDeg,
					west: lng - deltaDeg,
				};
			}
		} else if (shape instanceof window.google.maps.Polygon) {
			const path = shape.getPath();
			if (path && path.getLength() > 0) {
				let north = -90;
				let south = 90;
				let east = -180;
				let west = 180;
				for (let i = 0; i < path.getLength(); i++) {
					const point = path.getAt(i);
					north = Math.max(north, point.lat());
					south = Math.min(south, point.lat());
					east = Math.max(east, point.lng());
					west = Math.min(west, point.lng());
				}
				bounds = { north, south, east, west };
			}
		}
		setPendingMarkerBounds(bounds);
	};

	// Only fetch and set markers when user presses Apply
	const handleApplyDrawing = async () => {
		if (!shapeRef.current) return;
		setBoundaryApplied(true);
		setShapeDrawn(false);
		if (!pendingMarkerBounds) return;
		const { fetchFakeMapMarkers } = await import(
			"@/constants/_faker/_api/google_maps/mockMapApi"
		);
		const fakeMarkers = await fetchFakeMapMarkers({
			bounds: pendingMarkerBounds,
			count: 10,
		});
		setMarkers(fakeMarkers);
		// * If we have results, show the 'Show Results' button
		setHasResults(fakeMarkers.length > 0);
		if (fakeMarkers.length > 0) {
			setCenter(fakeMarkers[0]);
		}
	};
	const handleOpenModal = () => setIsModalOpen(true);
	const handleCloseModal = () => setIsModalOpen(false);

	// moved above useEffect to avoid usage-before-declaration
	// const { properties, setProperties } = usePropertyStore();

	const {
		control,
		handleSubmit,

		formState: { errors, isValid },
		getValues,
	} = useForm<MapFormSchemaType>({
		resolver: zodResolver(mapFormSchema),
		mode: "onChange", // * Enable real-time validation
		defaultValues: {
			location: "",
			marketStatus: undefined,
			beds: undefined,
			baths: undefined,
			propertyType: undefined,
			advanced: {
				radius: undefined,
				pastDays: undefined,
				dateFrom: undefined,
				dateTo: undefined,
				mlsOnly: false,
				foreclosure: false,
				proxy: undefined,
				extraPropertyData: false,
				excludePending: false,
				limit: undefined,
			},
		},
	});

	const onSubmit = async (data: MapFormSchemaType) => {
		// If form is invalid, show all errors
		if (!isValid) {
			setShowAllErrors(true);
			return;
		}
		const normalizedData = normalizeFormValues(data);
		console.log("[DEBUG] onSubmit normalizedData:", normalizedData);

		console.log("[DEBUG] onSubmit called with data:", data); // *
		toast("Submitted");
		const fetchedCoordinates = await mockFetchAddressesFromApi([data.location]);
		console.log("[DEBUG] fetchedCoordinates:", fetchedCoordinates); // *
		const newMarkers = fetchedCoordinates.map((coord) => ({
			lat: coord.lat,
			lng: coord.lng,
		}));
		console.log("[DEBUG] newMarkers:", newMarkers); // *
		if (newMarkers && newMarkers.length > 0) {
			setMarkers(newMarkers);
			const newCenter = calculateCenter(newMarkers);
			console.log("[DEBUG] newCenter:", newCenter); // *
			setCenter(newCenter);
		}
		// * Set new properties after search
		const newProperties = generateFakeProperties(12); // Replace with real API call in prod
		console.log("[DEBUG] newProperties:", newProperties); // *
		setProperties(newProperties);
		setHasResults(newProperties.length > 0);
		console.log("[DEBUG] hasResults:", newProperties.length > 0); // *
		// Do NOT open the drawer here
	};

	return (
		<div className="container mx-auto py-6">
			<LeadSearchHeader
				onHelpClick={handleOpenModal}
				title="Leads Search"
				description="Quickly search for properties by location, filters, and more."
				creditsRemaining={
					mockUserProfile.subscription.aiCredits.allotted -
					mockUserProfile.subscription.aiCredits.used
				}
			/>
			<form
				onSubmit={handleSubmit(onSubmit, (errors) => {
					console.log("[DEBUG] Form validation errors:", errors);
				})}
			>
				<LeadSearchForm
					control={control}
					errors={errors}
					onAdvancedOpen={() => setShowAdvanced(true)}
					isValid={isValid}
				/>

				{/* Show validation errors above the Search button if form is invalid */}
				{!isValid && Object.keys(errors).length > 0 && (
					<div className="mb-2 rounded border border-red-300 bg-red-50 p-3 text-red-700 text-sm">
						<strong>Fix the following fields:</strong>
						<ul className="mt-1 ml-5 list-disc">
							{Object.entries(errors).map(([field, error]) => (
								<li key={field}>
									{field.charAt(0).toUpperCase() + field.slice(1)}:{" "}
									{error?.message ||
										(typeof error === "object" &&
											error !== null &&
											"root" in error &&
											(error as unknown as { root: { message: string } }).root
												?.message)}
								</li>
							))}
						</ul>
					</div>
				)}
				<div className="my-4 flex flex-col items-center gap-3 md:flex-row md:justify-center">
					<div className="group relative w-full max-w-xs md:w-auto">
						<Button
							type="submit"
							className="w-full gap-2 md:w-auto"
							disabled={!isValid}
						>
							<Search className="h-4 w-4" /> Search
						</Button>
						{!isValid && (
							<span className="-translate-x-1/2 -translate-y-full pointer-events-none absolute top-0 left-1/2 z-10 w-max rounded bg-gray-800 px-3 py-1 text-white text-xs opacity-0 transition-opacity duration-200 group-hover:opacity-100">
								Enter valid search criteria to save
							</span>
						)}
					</div>
					{hasResults && properties && properties.length > 0 && (
						<Button
							type="button"
							className="w-full max-w-xs gap-2 md:w-auto"
							onClick={() => {
								console.log(
									"[DEBUG] Show Results clicked, properties:",
									properties,
								);
								setIsDrawerOpen(true);
							}}
						>
							Show Results
						</Button>
					)}
				</div>
			</form>
			<AdvancedFiltersDialog
				open={showAdvanced}
				onClose={() => setShowAdvanced(false)}
				control={control}
				errors={errors}
			/>
			<MapSection
				markers={markers}
				center={center}
				mapKey={process.env.NEXT_PUBLIC_GMAPS_KEY}
				drawingMode={drawingMode}
				shapeDrawn={shapeDrawn}
				boundaryApplied={boundaryApplied}
				onDrawPolygon={handleDrawPolygon}
				onDrawRectangle={handleDrawRectangle}
				onDrawCircle={handleDrawCircle}
				onDrawPolyline={handleDrawPolyline}
				onCancelDrawing={handleCancelDrawing}
				onApplyDrawing={handleApplyDrawing}
				onRemoveBoundaries={handleRemoveBoundaries}
				onShapeComplete={handleShapeComplete}
			/>
			<PropertiesList properties={properties} />
			<WalkThroughModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				videoUrl="https://www.youtube.com/watch?v=hyosynoNbSU" // Example YouTube video URL
				title="Welcome To Your Lead Search"
				subtitle="Get help searching and sorting through your properties."
				// Add the following props to enable the tour
				steps={campaignSteps} // Tour steps (array of objects with content and selectors)
				isTourOpen={isTourOpen} // Boolean to track if the tour is currently open
				onStartTour={handleStartTour} // Function to start the tour (triggered by button)
				onCloseTour={handleCloseTour} // Function to close the tour
			/>
		</div>
	);
};

export default PropertySearch;
