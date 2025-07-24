"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
	calculateCenter,
	mockFetchAddressesFromApi,
} from "@/constants/utility/maps";
import { usePropertyStore } from "@/lib/stores/leadSearch/drawer";
import type { Coordinate } from "@/types/_dashboard/maps";
import type { Property } from "@/types/_dashboard/property";
import { mapFormSchema } from "@/types/zod/propertyList";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

type MapFormSchemaType = z.infer<typeof mapFormSchema>;
import {
	Search,
	MapPin,
	Home,
	Bed,
	Bath,
	Ruler,
	DollarSign,
} from "lucide-react";
import type React from "react";
import { useRef, useCallback, useEffect } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { campaignSteps } from "@/_tests/tours/campaignTour";
import AdvancedFiltersDialog from "./search/AdvancedFiltersDialog";
import { mockUserProfile } from "@/constants/_faker/profile/userProfile";
import HelpModal from "./search/HelpModal";
import LeadSearchForm from "./search/LeadSearchForm";
import LeadSearchHeader from "./search/LeadSearchHeader";
import MapSection from "./search/MapSection";
import PropertiesList from "./search/PropertiesList";
import WalkThroughModal from "./search/WalkthroughModal";
import { generateFakeProperties } from "@/constants/dashboard/properties";
import { fetchFakeMapMarkers } from "@/constants/_faker/_api/google_maps/mockMapApi";

interface PropertySearchProps {
	initialProperties?: number;
}

const PropertySearch: React.FC<PropertySearchProps> = ({
	initialProperties: initialPropCount = 6,
}) => {
	const [isLoading, setIsLoading] = useState(false);
	const [isSearching, setIsSearching] = useState(false);
	const [hasResults, setHasResults] = useState(false);
	const [showAdvanced, setShowAdvanced] = useState(false);
	const [isTourOpen, setIsTourOpen] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [showAllErrors, setShowAllErrors] = useState(true);
	const [center, setCenter] = useState<Coordinate>({
		lat: 39.7392,
		lng: -104.9903,
	});
	const [markers, setMarkers] = useState<Coordinate[]>([]);
	const [mapBoundary, setMapBoundary] =
		useState<google.maps.LatLngBounds | null>(null);

	const { properties, setProperties, setIsDrawerOpen } = usePropertyStore();

	useEffect(() => {
		setProperties([]);
		setHasResults(false);
	}, [setProperties]);

	const handleStartTour = useCallback(() => setIsTourOpen(true), []);
	const handleCloseTour = useCallback(() => setIsTourOpen(false), []);

	const {
		control,
		handleSubmit: handleFormSubmit,
		formState: { errors, isValid },
		setValue,
	} = useForm<MapFormSchemaType>({
		resolver: zodResolver(mapFormSchema),
		mode: "onChange",
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

	const handleBoundaryChange = (bounds: google.maps.LatLngBounds | null) => {
		setMapBoundary(bounds);
	};

	const onSubmit = (values: MapFormSchemaType) => {
		console.log("Form Submitted:", { values, boundary: mapBoundary });
		setIsSearching(true);
		// Simulate API call
		setTimeout(async () => {
			// Use the mock API to fetch fake markers
			const bounds = mapBoundary
				? {
						north: mapBoundary.getNorthEast().lat(),
						south: mapBoundary.getSouthWest().lat(),
						east: mapBoundary.getNorthEast().lng(),
						west: mapBoundary.getSouthWest().lng(),
					}
				: undefined;

			const newMarkers = await fetchFakeMapMarkers({ bounds });
			const propertyCount = newMarkers.length;
			setMarkers(newMarkers);
			setProperties(generateFakeProperties(propertyCount));
			setIsSearching(false);
			setHasResults(propertyCount > 0);
			toast.success(`Search complete! Found ${propertyCount} properties`);
		}, 1500);
	};

	return (
		<div className="container mx-auto py-6">
			<LeadSearchHeader
				onHelpClick={() => setIsModalOpen(true)}
				title="Leads Search"
				description="Quickly search for properties by location, filters, and more."
				creditsRemaining={
					mockUserProfile.subscription.aiCredits.allotted -
					mockUserProfile.subscription.aiCredits.used
				}
			/>
			<form onSubmit={handleFormSubmit(onSubmit)}>
				<LeadSearchForm
					control={control}
					errors={errors}
					setValue={setValue}
					onAdvancedOpen={() => setShowAdvanced(true)}
					isValid={isValid}
				/>

				{!isValid && Object.keys(errors).length > 0 && (
					<div className="mb-2 rounded border border-red-300 bg-red-50 p-3 text-red-700 text-sm">
						<strong>Fix the following fields:</strong>
						<ul className="mt-1 ml-5 list-disc">
							{Object.entries(errors).map(([field, error]) => {
								const errorMessage =
									typeof error === "object" && error !== null
										? "message" in error
											? (error as { message: string }).message
											: "root" in error
												? (error as { root: { message: string } }).root?.message
												: "Validation error"
										: "Validation error";

								return (
									<li key={field}>
										{field.charAt(0).toUpperCase() + field.slice(1)}:{" "}
										{errorMessage}
									</li>
								);
							})}
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
				onBoundaryChange={handleBoundaryChange}
			/>
			<PropertiesList properties={properties} />
			<WalkThroughModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				videoUrl="https://www.youtube.com/watch?v=hyosynoNbSU"
				title="Welcome To Your Lead Search"
				subtitle="Get help searching and sorting through your properties."
				steps={campaignSteps}
				isTourOpen={isTourOpen}
				onStartTour={handleStartTour}
				onCloseTour={handleCloseTour}
			/>
		</div>
	);
};

export default PropertySearch;
