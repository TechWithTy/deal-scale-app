// import MapComponent from "@/components/maps/_depr";
// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
// 	Dialog,
// 	DialogContent,
// 	DialogHeader,
// 	DialogTitle,
// 	DialogTrigger,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import LeadSearchHeader from "../steps/LeadSearchHeader";
// import LeadSearchForm from "../steps/LeadSearchForm";
// import AdvancedFiltersDialog from "../steps/AdvancedFiltersDialog";
// import MapSection from "../steps/MapSection";
// import PropertiesList from "../steps/PropertiesList";
// import HelpModal from "../steps/HelpModal";
// import { Label } from "@/components/ui/label";
// import {
// 	Select,
// 	SelectContent,
// 	SelectItem,
// 	SelectTrigger,
// 	SelectValue,
// } from "@/components/ui/select";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { HelpCircle, Search, Sliders } from "lucide-react";
// import React, { useState } from "react";
// import { Controller, useForm } from "react-hook-form";

// import { campaignSteps } from "@/_tests/tours/campaignTour";
// import {
// 	calculateCenter,
// 	mockFetchAddressesFromApi,
// } from "@/constants/utility/maps";
// import { checkForSQLInjection } from "@/constants/utility/sqlCheck";
// import { usePropertyStore } from "@/lib/stores/leadSearch/drawer";
// import type { Coordinate, MapFormSchemaType } from "@/types/_dashboard/maps";
// import { mapFormSchema } from "@/types/zod/propertyList";
// import { toast } from "sonner";
// import PropertySearchModal from "../../reusables/tutorials/walkthroughModal";
// import { Heading } from "../../ui/heading";

// export default function LeadsComponent() {
// 	const [showAdvanced, setShowAdvanced] = useState(false);
// 	const [markers, setMarkers] = useState<Coordinate[]>([
// 		{ lat: 39.7392, lng: -104.9903 },
// 		{ lat: 39.7294, lng: -104.8319 },
// 	]);
// 	const [center, setCenter] = useState<Coordinate>({
// 		lat: 39.7392,
// 		lng: -104.9903,
// 	});
// 	const [isModalOpen, setIsModalOpen] = useState(false);
// 	const [isTourOpen, setIsTourOpen] = useState(false);

// 	const handleOpenModal = () => setIsModalOpen(true);
// 	const handleCloseModal = () => setIsModalOpen(false);

// 	const handleStartTour = () => setIsTourOpen(true);
// 	const handleCloseTour = () => setIsTourOpen(false);

// 	const {
// 		properties,

// 		isDrawerOpen, // Drawer visibility state
// 		setIsDrawerOpen, // Action to control drawer state
// 	} = usePropertyStore();

// 	const { control, handleSubmit, formState: { errors } } = useForm<MapFormSchemaType>({
// 		resolver: zodResolver(mapFormSchema),
// 		defaultValues: {
// 			location: "",
// 			marketStatus: "",
// 			beds: "",
// 			baths: "",
// 			propertyType: "",
// 			radius: undefined,
// 			pastDays: undefined,
// 			dateStart: undefined,
// 			dateEnd: undefined,
// 			mlsOnly: false,
// 		},
// 	});

// 	const onSubmit = async (data: MapFormSchemaType) => {
// 		toast("Submitted");
// 		const fetchedCoordinates = await mockFetchAddressesFromApi([data.location]);
// 		const newMarkers = fetchedCoordinates.map((coord) => ({
// 			lat: coord.lat,
// 			lng: coord.lng,
// 		}));
// 		if (newMarkers && newMarkers.length > 0) {
// 			setMarkers(newMarkers);
// 			const newCenter = calculateCenter(newMarkers);
// 			setCenter(newCenter);
// 		}
// 	};
// 		if (newMarkers && newMarkers.length > 0) {
// 			setMarkers(newMarkers);


// 	return (
// 		<form
// 			onSubmit={handleSubmit(onSubmit)}
// 			className="flex h-screen w-full flex-col"
// 		>
// 			<div className="flex w-full flex-col items-center text-center">
// 				<Heading
// 					title="Lead Search"
// 					description="See a list of existing leads and follow ups, or create new leads."
// 				/>

// 				<div className="mt-2 mb-4 flex w-full justify-center">
// 					<button
// 						onClick={handleOpenModal}
// 						type="button"
// 						title="Get Help Navigating Lead Generation"
// 						className="animate-bounce rounded-full bg-blue-500 p-2 text-white hover:animate-none sm:mt-5 dark:bg-green-700 dark:text-gray-300"
// 					>
// 						<HelpCircle size={20} />
// 					</button>
// 				</div>
// 			</div>

// 			{/* Input fields container */}
// 			<div className="border-b p-2">
// 				<div className="mb-4 flex flex-wrap items-center space-x-2 space-y-2 overflow-x-auto whitespace-nowrap sm:space-y-0">
// 					<div className="relative w-full flex-grow sm:w-auto">
// 						<Search className="-translate-y-1/2 absolute top-1/2 left-3 transform text-gray-400" />
// 						<Controller
// 							name="location"
// 							control={control}
// 							render={({ field, fieldState: { error } }) => (
// 								<div>
// 									<Input
// 										className="w-full py-2 pr-4 pl-10"
// 										placeholder="State, Zip, County, Street, Neighborhood, or Address"
// 										{...field}
// 										onChange={(e) => {
// 											const value = e.target.value;
// 											if (checkForSQLInjection(value)) {
// 												field.onChange("");
// 											} else {
// 												field.onChange(value);
// 											}
// 										}}
// 										onBlur={() => {
// 											field.onBlur();
// 										}}
// 									/>
// 								</div>
// 							)}
// 						/>
// 					</div>

// 					{/* Dropdown fields */}

// 					<div className="w-full sm:w-[180px]">
// 						<Controller
// 							name="marketStatus"
// 							control={control}
// 							render={({ field }) => (
// 								<Select
// 									value={field.value || ""}
// 									onValueChange={field.onChange}
// 								>
// 									<SelectTrigger className="w-full">
// 										<SelectValue>{field.value || "Market Status"}</SelectValue>
// 									</SelectTrigger>
// 									<SelectContent>
// 										<SelectItem value="For Rent">For Rent</SelectItem>
// 										<SelectItem value="For Sale">For Sale</SelectItem>
// 										<SelectItem value="Sold">Sold</SelectItem>
// 										<SelectItem value="Pending">Pending</SelectItem>
// 									</SelectContent>
// 								</Select>
// 							)}
// 						/>
// 					</div>

// 					<div className="w-full sm:w-[180px]">
// 						<Controller
// 							name="beds"
// 							control={control}
// 							render={({ field }) => (
// 								<Select
// 									value={field.value || ""}
// 									onValueChange={field.onChange}
// 								>
// 									<SelectTrigger className="w-full">
// 										<SelectValue>{field.value || "Beds"}</SelectValue>
// 									</SelectTrigger>
// 									<SelectContent>
// 										<SelectItem value="1">1 Bed</SelectItem>
// 										<SelectItem value="2">2 Beds</SelectItem>
// 										<SelectItem value="3">3 Beds</SelectItem>
// 										<SelectItem value="4">4 Beds</SelectItem>
// 										<SelectItem value="5+">5+ Beds</SelectItem>
// 									</SelectContent>
// 								</Select>
// 							)}
// 						/>
// 					</div>

// 					<div className="w-full sm:w-[180px]">
// 						<Controller
// 							name="baths"
// 							control={control}
// 							render={({ field }) => (
// 								<Select
// 									value={field.value || ""}
// 									onValueChange={field.onChange}
// 								>
// 									<SelectTrigger className="w-full">
// 										<SelectValue>{field.value || "Baths"}</SelectValue>
// 									</SelectTrigger>
// 									<SelectContent>
// 										<SelectItem value="1">1 Bath</SelectItem>
// 										<SelectItem value="2">2 Baths</SelectItem>
// 										<SelectItem value="3">3 Baths</SelectItem>
// 										<SelectItem value="4">4 Baths</SelectItem>
// 										<SelectItem value="5+">5+ Baths</SelectItem>
// 									</SelectContent>
// 								</Select>
// 							)}
// 						/>
// 					</div>
// 					<div className="flex w-full space-x-2 sm:w-auto">
// 						<div className="mt-2 w-full sm:w-[180px]">
// 							<Controller
// 								name="propertyType"
// 								control={control}
// 								render={({ field }) => (
// 									<Select
// 										value={field.value || ""}
// 										onValueChange={field.onChange}
// 									>
// 										<SelectTrigger className="w-full">
// 											<SelectValue>
// 												{field.value || "Property Type"}
// 											</SelectValue>
// 										</SelectTrigger>
// 										<SelectContent>
// 											<SelectItem value="single_family">
// 												Single Family Home
// 											</SelectItem>
// 											<SelectItem value="Condo">Condo</SelectItem>
// 											<SelectItem value="Townhouse">Townhouse</SelectItem>
// 											<SelectItem value="Multi-Family">
// 												Multi-Family Home
// 											</SelectItem>
// 											<SelectItem value="Apartment">Apartment</SelectItem>
// 											<SelectItem value="Commercial">Commercial</SelectItem>
// 											<SelectItem value="Land">Land</SelectItem>
// 											<SelectItem value="New Construction">
// 												New Construction
// 											</SelectItem>
// 											<SelectItem value="Mobile Home">Mobile Home</SelectItem>
// 											<SelectItem value="Farm/Ranch">Farm/Ranch</SelectItem>
// 										</SelectContent>
// 									</Select>
// 								)}
// 							/>
// 						</div>

// 						{/* Centered Advanced Button */}
// 						<div className="mt-2 flex w-full justify-center sm:w-auto sm:justify-start">
// 							<Dialog open={showAdvanced} onOpenChange={setShowAdvanced}>
// 								<DialogTrigger asChild>
// 									<Button variant="outline" className="flex items-center">
// 										Advanced
// 										<Sliders className="ml-2 h-4 w-4" />
// 									</Button>
// 								</DialogTrigger>
// 								<DialogContent>
// 									<DialogHeader>
// 										<DialogTitle>Advanced Filters</DialogTitle>
// 									</DialogHeader>

// 									<div className="grid gap-4 py-4">
// 										{/* Restored Advanced Filter Fields */}
// 										<Controller
// 											name="advanced.radius"
// 											control={control}
// 											render={({ field, fieldState: { error } }) => (
// 												<div className="grid grid-cols-2 items-center gap-4">
// 													<Label htmlFor="radius">Radius</Label>
// 													<Input
// 														id="radius"
// 														type="text"
// 														inputMode="decimal"
// 														placeholder="Enter radius"
// 														{...field}
// 														value={field.value}
// 														onChange={(e) => {
// 															const value = e.target.value;
// 															if (
// 																/^\d{0,6}(\.\d{0,5})?$/.test(value) &&
// 																!checkForSQLInjection(value)
// 															) {
// 																field.onChange(value);
// 															}
// 														}}
// 														onBlur={(e) => {
// 															if (
// 																!/^\d{1,6}(\.\d{1,5})?$/.test(e.target.value)
// 															) {
// 																field.onChange("");
// 															}
// 														}}
// 													/>
// 													{error && (
// 														<p className="text-red-500">{error.message}</p>
// 													)}
// 												</div>
// 											)}
// 										/>

// 										<Controller
// 											name="advanced.pastDays"
// 											control={control}
// 											render={({ field, fieldState: { error } }) => (
// 												<div className="grid grid-cols-2 items-center gap-4">
// 													<Label htmlFor="past_days">Past Days</Label>
// 													<Input
// 														id="past_days"
// 														type="text"
// 														inputMode="numeric"
// 														placeholder="Enter days"
// 														{...field}
// 														value={field.value}
// 														onChange={(e) => {
// 															const value = e.target.value;
// 															if (
// 																/^\d{0,5}$/.test(value) &&
// 																!checkForSQLInjection(value)
// 															) {
// 																field.onChange(value);
// 															}
// 														}}
// 														onBlur={field.onBlur}
// 													/>
// 													{error && (
// 														<p className="text-red-500">{error.message}</p>
// 													)}
// 												</div>
// 											)}
// 										/>

// 										<Controller
// 											name="advanced.dateFrom"
// 											control={control}
// 											render={({ field }) => (
// 												<div className="grid grid-cols-2 items-center gap-4">
// 													<Label htmlFor="date_from">Date From</Label>
// 													<Input id="date_from" type="date" {...field} />
// 												</div>
// 											)}
// 										/>

// 										<Controller
// 											name="advanced.dateTo"
// 											control={control}
// 											render={({ field }) => (
// 												<div className="grid grid-cols-2 items-center gap-4">
// 													<Label htmlFor="date_to">Date To</Label>
// 													<Input id="date_to" type="date" {...field} />
// 												</div>
// 											)}
// 										/>

// 										<Controller
// 											name="advanced.mlsOnly"
// 											control={control}
// 											render={({ field }) => (
// 												<div className="flex items-center space-x-2">
// 													<Checkbox
// 														id="mls_only"
// 														checked={field.value}
// 														onCheckedChange={field.onChange}
// 													/>
// 													<Label htmlFor="mls_only">MLS Only</Label>
// 												</div>
// 											)}
// 										/>

// 										<Controller
// 											name="advanced.foreclosure"
// 											control={control}
// 											render={({ field }) => (
// 												<div className="flex items-center space-x-2">
// 													<Checkbox
// 														id="foreclosure"
// 														checked={field.value}
// 														onCheckedChange={field.onChange}
// 													/>
// 													<Label htmlFor="foreclosure">Foreclosure</Label>
// 												</div>
// 											)}
// 										/>

// 										<Controller
// 											name="advanced.proxy"
// 											control={control}
// 											render={({ field, fieldState: { error } }) => (
// 												<div className="grid grid-cols-2 items-center gap-4">
// 													<Label htmlFor="proxy">Proxy</Label>
// 													<Input
// 														id="proxy"
// 														type="text"
// 														placeholder="Ex: http://user:pass@host:port"
// 														{...field}
// 														onChange={(e) => field.onChange(e.target.value)}
// 														onBlur={(e) => {
// 															const value = e.target.value;
// 															if (
// 																/^https?:\/\/.*/.test(value) ||
// 																(value === "" && !checkForSQLInjection(value))
// 															) {
// 																field.onChange(value);
// 															} else {
// 																field.onChange("");
// 															}
// 															field.onBlur();
// 														}}
// 													/>
// 													{error && (
// 														<p className="text-red-500">{error.message}</p>
// 													)}
// 												</div>
// 											)}
// 										/>
// 									</div>
// 								</DialogContent>
// 							</Dialog>
// 						</div>
// 					</div>
// 				</div>
// 				{properties.length > 0 && !isDrawerOpen && (
// 					<div className="relative flex w-full justify-center">
// 						{" "}
// 						{/* Container div to control the button's positioning */}
// 						<Button
// 							type="button"
// 							className="relative w-40 overflow-hidden rounded-md bg-purple-600 px-4 py-2 text-white "
// 							onClick={() => setIsDrawerOpen(true)}
// 						>
// 							Open Properties
// 							{/* The span for the animation, scoped to the button */}
// 							{/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
// <span className="-translate-x-full absolute inset-0 h-full w-full transform animate-light-sweep bg-gradient-to-r from-transparent via-white to-transparent opacity-75"></span>
// 						</Button>
// 					</div>
// 				)}
// 			</div>
// 			<PropertySearchModal
// 				isOpen={isModalOpen}
// 				onClose={handleCloseModal}
// 				videoUrl="https://www.youtube.com/embed/example-video" // Example YouTube video URL
// 				title="Welcome To Your Lead Search"
// 				subtitle="Get help searching and segmenting your leads"
// 				termsUrl="/terms-of-use" // Example URL for terms of use
// 				steps={campaignSteps} // Tour steps (array of objects with content and selectors)
// 				isTourOpen={isTourOpen} // Boolean to track if the tour is currently open
// 				onStartTour={handleStartTour} // Function to start the tour (triggered by button)
// 				onCloseTour={handleCloseTour} // Function to close the tour
// 			/>
// 			{/* Map and other content */}
// 			<div className="relative h-[400px] flex-grow sm:h-[500px]">
// 				<MapComponent
// 					apiKey={process.env.NEXT_PUBLIC_GMAPS_KEY || ""}
// 					center={center}
// 					markers={markers}
// 					zoom={10}
// 				/>
// 			</div>
// 		</form>
// 	);
// }
