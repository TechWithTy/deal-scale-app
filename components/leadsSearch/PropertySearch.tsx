import { Button } from "@/components/ui/button";
import {
	calculateCenter,
	mockFetchAddressesFromApi,
} from "@/constants/utility/maps";
import { usePropertyStore } from "@/lib/stores/leadSearch/drawer";
import type { Coordinate, MapFormSchemaType } from "@/types/_dashboard/maps";
import { mapFormSchema } from "@/types/zod/propertyList";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";
// * PropertySearch.tsx
// ! Main property search component combining all subcomponents for the leads search feature
import type React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import AdvancedFiltersDialog from "./steps/AdvancedFiltersDialog";
import HelpModal from "./steps/HelpModal";
import LeadSearchForm from "./steps/LeadSearchForm";
import LeadSearchHeader from "./steps/LeadSearchHeader";
import MapSection from "./steps/MapSection";
import PropertiesList from "./steps/PropertiesList";

const PropertySearch: React.FC = () => {
	const [showAdvanced, setShowAdvanced] = useState(false);
	const [markers, setMarkers] = useState<Coordinate[]>([
		{ lat: 39.7392, lng: -104.9903 },
		{ lat: 39.7294, lng: -104.8319 },
	]);
	const [center, setCenter] = useState<Coordinate>({
		lat: 39.7392,
		lng: -104.9903,
	});
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleOpenModal = () => setIsModalOpen(true);
	const handleCloseModal = () => setIsModalOpen(false);

	const { properties } = usePropertyStore();

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<MapFormSchemaType>({
		resolver: zodResolver(mapFormSchema),
		defaultValues: {
			location: "",
			marketStatus: "",
			beds: "",
			baths: "",
			propertyType: "",
			advanced: {
				radius: "",
				pastDays: "",
				dateFrom: "",
				dateTo: "",
				mlsOnly: false,
				foreclosure: false,
				proxy: "",
				extraPropertyData: false,
				excludePending: false,
				limit: "",
			},
		},
	});

	const onSubmit = async (data: MapFormSchemaType) => {
		toast("Submitted");
		const fetchedCoordinates = await mockFetchAddressesFromApi([data.location]);
		const newMarkers = fetchedCoordinates.map((coord) => ({
			lat: coord.lat,
			lng: coord.lng,
		}));
		if (newMarkers && newMarkers.length > 0) {
			setMarkers(newMarkers);
			const newCenter = calculateCenter(newMarkers);
			setCenter(newCenter);
		}
	};

	return (
		<div className="container mx-auto py-6">
			<LeadSearchHeader
				onHelpClick={handleOpenModal}
				title="Leads Search"
				description="Quickly search for properties by location, filters, and more."
			/>
			<form onSubmit={handleSubmit(onSubmit)}>
				<LeadSearchForm
					control={control}
					errors={errors}
					onAdvancedOpen={() => setShowAdvanced(true)}
				/>
				<div className="mt-4 flex justify-end">
					<Button type="submit" className="gap-2">
						<Search className="h-4 w-4" /> Search
					</Button>
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
			/>
			<PropertiesList properties={properties} />
			<HelpModal open={isModalOpen} onClose={handleCloseModal}>
				<p>
					Use the search form above to find leads by location and filter
					criteria. Click Advanced for more options.
				</p>
			</HelpModal>
		</div>
	);
};

export default PropertySearch;
