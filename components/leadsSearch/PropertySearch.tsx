"use client";

import { Button } from "@/components/ui/button";
import { usePropertyStore } from "@/lib/stores/leadSearch/drawer";
import type { Coordinate } from "@/types/_dashboard/maps";
import { mapFormSchema } from "@/types/zod/propertyList";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

type MapFormSchemaType = z.infer<typeof mapFormSchema>;
import { Search, Sparkles } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { campaignSteps } from "@/_tests/tours/campaignTour";
import AdvancedFiltersDialog from "./search/AdvancedFiltersDialog";
import HelpModal from "./search/HelpModal";
import LeadSearchForm from "./search/LeadSearchForm";
import LeadSearchHeader from "./search/LeadSearchHeader";
import {
	useRemainingAI,
	useRemainingLeads,
	useUserStore,
} from "@/lib/stores/userStore";
import PropertiesList from "./search/PropertiesList";
import WalkThroughModal from "./search/WalkthroughModal";
import { generateFakeProperties } from "@/constants/dashboard/properties";
import { fetchFakeMapMarkers } from "@/constants/_faker/_api/google_maps/mockMapApi";
import { SaveToListModal } from "@/components/property/modals/SaveToListModal";
import type { Property as DashboardProperty } from "@/types/_dashboard/property";
import MapArea from "./search/MapArea";
import { buildPropertyFromPlace, openStreetView } from "./search/helpers";
import type { ACSeed } from "external/google-maps-two/components/composit/utils/autocomplete";

interface PropertySearchProps {
	initialProperties?: number;
}

const PropertySearch: React.FC<PropertySearchProps> = () => {
	const [isSearching, setIsSearching] = useState(false);
	const [hasResults, setHasResults] = useState(false);
	const [showAdvanced, setShowAdvanced] = useState(false);
	const [isTourOpen, setIsTourOpen] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [center, setCenter] = useState<Coordinate>({
		lat: 39.7392,
		lng: -104.9903,
	});
	const [markers, setMarkers] = useState<Coordinate[]>([]);
	const [selectedPlace, setSelectedPlace] = useState<{
		placeId?: string;
		location?: google.maps.LatLngLiteral;
	} | null>(null);
	const [saveOpen, setSaveOpen] = useState(false);
	const [saveProperty, setSaveProperty] = useState<DashboardProperty | null>(
		null,
	);

	const { properties, setProperties, setIsDrawerOpen } = usePropertyStore();
	const remainingLeads = useRemainingLeads();
	const remainingAi = useRemainingAI();
	const consumeLeads = useUserStore((s) => s.consumeLeads);
	const consumeAi = useUserStore((s) => s.consumeAI);

	const [isAnalyzing, setIsAnalyzing] = useState(false);

	const {
		control,
		handleSubmit: handleFormSubmit,
		formState: { errors, isValid },
		setValue,
		watch,
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

	useEffect(() => {
		setProperties([]);
		setHasResults(false);
	}, [setProperties]);

	const handleStartTour = useCallback(() => setIsTourOpen(true), []);
	const handleCloseTour = useCallback(() => setIsTourOpen(false), []);

	const locationValue = watch("location");
	const normalizedLocation = locationValue?.trim() ?? "";
	const canAnalyze = isValid && remainingAi > 0 && !isAnalyzing;
	const analyzeTooltip = !isValid
		? "Enter valid search criteria to analyze"
		: remainingAi <= 0
			? "No AI credits remaining"
			: undefined;

	// Boundary currently unused in this view

	const onSubmit = (values: MapFormSchemaType) => {
		setIsSearching(true);
		// Simulate API call
		setTimeout(async () => {
			const bounds = {
				north: center.lat + 0.01,
				south: center.lat - 0.01,
				east: center.lng + 0.01,
				west: center.lng - 0.01,
			};

			const newMarkers = await fetchFakeMapMarkers({ bounds });
			const propertyCount = newMarkers.length;
			setMarkers(newMarkers);
			setProperties(generateFakeProperties(propertyCount));
			setIsSearching(false);
			setHasResults(propertyCount > 0);
			consumeLeads(propertyCount);
			toast.success(`Search complete! Found ${propertyCount} properties`);
		}, 1500);
	};

	return (
		<div className="container mx-auto py-6">
			<LeadSearchHeader
				onHelpClick={() => setIsModalOpen(true)}
				title="Off-Market Property Leads Search | Deal Scale"
				description="Find motivated sellers and hidden real estate opportunities fast. Use AI-powered search filters by location, property type, and seller profile to uncover exclusive off-market leads."
				creditsRemaining={remainingLeads}
			/>
			<form onSubmit={handleFormSubmit(onSubmit)}>
				<LeadSearchForm
					control={control}
					errors={errors}
					setValue={setValue}
					onAdvancedOpen={() => setShowAdvanced(true)}
					isValid={isValid}
					onPlaceSelected={(seed: ACSeed) => {
						if (seed.location) {
							const loc = seed.location; // Capture in local variable
							setCenter(loc);
							setMarkers((prev) => [
								...prev,
								{ lat: loc.lat, lng: loc.lng }, // Use captured variable
							]);
							setProperties([
								...(properties || []),
								...generateFakeProperties(1),
							]);
							setHasResults(true);
							setSelectedPlace({
								placeId: seed.placeId,
								location: loc, // Use captured variable
							});
						}
					}}
				/>

				{/* Validation panel omitted to reduce visual noise */}
				<div className="my-4 flex flex-wrap items-center justify-center gap-3">
					<div className="group relative">
						<Button
							type="submit"
							className="gap-2"
							disabled={!isValid || remainingLeads <= 0}
						>
							<Search className="h-4 w-4" /> Search
						</Button>
						{(!isValid || remainingLeads <= 0) && (
							<span className="-translate-x-1/2 -translate-y-full pointer-events-none absolute top-0 left-1/2 z-10 w-max rounded bg-gray-800 px-3 py-1 text-white text-xs opacity-0 transition-opacity duration-200 group-hover:opacity-100">
								{!isValid
									? "Enter valid search criteria to search"
									: "No lead credits remaining"}
							</span>
						)}
					</div>
					<div className="group relative">
						<Button
							type="button"
							className="gap-2 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-600 text-white shadow-lg transition hover:from-purple-600 hover:via-fuchsia-600 hover:to-purple-700 disabled:from-muted disabled:via-muted disabled:to-muted"
							disabled={!canAnalyze}
							onClick={() => {
								if (!canAnalyze) return;
								setIsAnalyzing(true);
								toast.info("Running market analysis...");
								setTimeout(() => {
									consumeAi(1);
									toast.success("Analysis complete! Insights ready.");
									setIsAnalyzing(false);
								}, 1400);
							}}
						>
							<Sparkles className="h-4 w-4" /> Analyze
						</Button>
						{!canAnalyze && analyzeTooltip && (
							<span className="-translate-x-1/2 -translate-y-full pointer-events-none absolute top-0 left-1/2 z-10 w-max rounded bg-gray-800 px-3 py-1 text-white text-xs opacity-0 transition-opacity duration-200 group-hover:opacity-100">
								{analyzeTooltip}
							</span>
						)}
					</div>
					{hasResults && properties && properties.length > 0 && (
						<Button
							type="button"
							className="gap-2"
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
			<MapArea
				center={center}
				markers={markers}
				selectedPlace={selectedPlace}
				onCenterChange={(c) => setCenter(c)}
				onSelectPlace={({ placeId, location }) => {
					if (!location) return;
					setCenter(location);
					setMarkers((prev) => [
						...prev,
						{ lat: location.lat, lng: location.lng },
					]);
					setProperties([...(properties || []), ...generateFakeProperties(1)]);
					setHasResults(true);
					setSelectedPlace({ placeId, location });
				}}
				onResultsChange={(coords) => {
					setMarkers(coords);
					setProperties([
						...(properties || []),
						...generateFakeProperties(coords.length),
					]);
					setHasResults(coords.length > 0);
				}}
				onViewPlace={({ position }) => openStreetView(position)}
				onAddToList={({ position, name, address }) => {
					const prop = buildPropertyFromPlace({ position, name, address });
					setSaveProperty(prop);
					setSaveOpen(true);
				}}
			/>
			{saveProperty && (
				<SaveToListModal
					isOpen={saveOpen}
					onClose={() => setSaveOpen(false)}
					property={saveProperty}
					onSave={() => {
						toast.success("Saved to list", {
							description: saveProperty.address.fullStreetLine,
						});
					}}
				/>
			)}
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
