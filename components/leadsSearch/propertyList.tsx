"use client";

import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Drawer, DrawerClose, DrawerContent } from "@/components/ui/drawer";
import { Progress } from "@/components/ui/progress";
import { MockUserProfile } from "@/constants/_faker/profile/userProfile";
import { usePropertyStore } from "@/lib/stores/leadSearch/drawer"; // Zustand store import
import { useModalStore } from "@/lib/stores/leadSearch/leadListStore";
import type { Property } from "@/types/_dashboard/property";
import { isRealtorProperty } from "@/types/_dashboard/property";
import { X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import PropertyCard from "./propertyCard";
import SkipTraceDialog from "../maps/properties/utils/createListModal";

interface PropertyListProps {
	properties: Property[];
}

const MIN_DRAWER_HEIGHT = 100; // Set a minimum height for the drawer to prevent it from being closed completely.
const cardLoadOptions = [12, 24, 48, 96]; // You can add more options if needed
// * PropertyListView now manages selected properties for list creation
const PropertyListView: React.FC<PropertyListProps> = ({ properties }) => {
	const [searchTerm, setSearchTerm] = useState("");
	const filteredProperties = properties.filter((property) => {
		if (isRealtorProperty(property)) {
			const searchText =
				`${property.address.street || ""} ${property.address.city || ""}`.toLowerCase();
			return searchText.includes(searchTerm.toLowerCase());
		}

		// For RentCastProperty, use address fields for search
		const rentCastProperty = property;
		const searchText = [
			rentCastProperty.address.street,
			rentCastProperty.address.city,
			rentCastProperty.address.state,
			rentCastProperty.address.zipCode,
			rentCastProperty.metadata.legalDescription,
			rentCastProperty.metadata.subdivision,
			rentCastProperty.metadata.zoning,
		]
			.filter(Boolean)
			.join(" ")
			.toLowerCase();
		return searchText.includes(searchTerm.toLowerCase());
	});

	// ...existing hooks and state
	const availableListNames = MockUserProfile.companyInfo.leadLists.map(
		(list) => list.listName,
	);
	const openSkipTraceDialog = () => {
		useModalStore.getState().openModal("skipTrace", {
			properties: filteredProperties.filter((p) =>
				selectedPropertyIds.includes(p.id ?? ""),
			),
			availableListNames,
			costPerRecord: 0.1,
		});
	};
	// todo: Move selection state to Zustand/global if needed for cross-component access
	const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);

	const {
		isDrawerOpen,
		setIsDrawerOpen,
		drawerHeight,
		setDrawerHeight,
		visibleProperties,
		progressValue,
		listSizeLabel,
		hasMore,
		isLoading,
		loadMoreProperties,
	} = usePropertyStore();

	// State to manage the max cards per load
	const [maxCardsPerLoad, setMaxCardsPerLoad] = useState(6); // Default to 6 cards per load

	// Start resizing the drawer
	const startResizing = (event: React.MouseEvent) => {
		event.preventDefault();
		window.addEventListener("mousemove", resizeDrawer);
		window.addEventListener("mouseup", stopResizing);
	};

	// Resize the drawer's height
	const resizeDrawer = (event: globalThis.MouseEvent) => {
		const newHeight = window.innerHeight - event.clientY;
		if (newHeight >= MIN_DRAWER_HEIGHT && newHeight <= window.innerHeight) {
			setDrawerHeight(newHeight); // Update drawer height using Zustand
		}
	};

	// Stop resizing
	const stopResizing = () => {
		window.removeEventListener("mousemove", resizeDrawer);
		window.removeEventListener("mouseup", stopResizing);
	};

	// Handle dropdown change for max cards per load
	const handleMaxCardsChange = (
		event: React.ChangeEvent<HTMLSelectElement>,
	) => {
		setMaxCardsPerLoad(Number.parseInt(event.target.value));
	};

	// Don't render anything if there are not enough properties
	if (properties.length <= 1) {
		return null;
	}

	// Handle property selection
	const handlePropertySelect = (propertyId: string) => {
		if (selectedPropertyIds.includes(propertyId)) {
			setSelectedPropertyIds(
				selectedPropertyIds.filter((id) => id !== propertyId),
			);
		} else {
			setSelectedPropertyIds([...selectedPropertyIds, propertyId]);
		}
	};

	return (
		<div
			style={{ position: "absolute", right: 0, width: "400px", height: "100%" }}
		>
			<Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
				<DrawerContent className="p-0" style={{ maxHeight: drawerHeight }}>
					{/* Drawer header and resize bar */}
					<div
						className="my-5 flex cursor-ns-resize items-center justify-between bg-secondary p-4"
						onMouseDown={startResizing}
					>
						<h2 className="font-semibold text-lg">
							{properties.length} Properties Fetched
						</h2>
						<DrawerClose asChild>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setIsDrawerOpen(false)}
							>
								<X className="h-4 w-4" />
							</Button>
						</DrawerClose>
					</div>

					<CardContent
						className="overflow-auto"
						style={{ height: drawerHeight - 60 }}
					>
						<div className="space-y-4">
							<div className="my-5 space-y-2">
								<h3 className="font-semibold text-lg">
									List Size ({listSizeLabel})
								</h3>
								<div className="flex items-center space-x-4">
									<span>Specific</span>
									<Progress value={progressValue} className="flex-1" />
									<span>Broad</span>
								</div>
								<p>Your list size is defined by your search and filters.</p>
								{progressValue === 75 && (
									<p className="font-semibold text-red-600">
										Your list is too broad.
									</p>
								)}
								{/* Controls: search + actions */}
								<div className="mb-6 flex flex-col items-center justify-center gap-4 md:flex-row md:gap-8">
									{/* Search bar */}
									<input
										type="text"
										placeholder="Search by description..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="w-full max-w-xs rounded-md border border-gray-300 px-4 py-2 text-base shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
									/>
									<div className="flex items-center gap-2">
										{selectedPropertyIds.length > 0 && (
											<button
												type="button"
												className="rounded-md border border-gray-200 bg-white px-4 py-2 font-medium text-red-600 text-sm shadow-sm transition hover:bg-red-50 dark:border-gray-700 dark:bg-gray-900 dark:text-red-400 dark:hover:bg-gray-800"
												onClick={() => setSelectedPropertyIds([])}
												aria-label="Clear all selected properties"
											>
												Clear Selected
											</button>
										)}
									</div>
									<div className="flex items-center gap-2">
										{selectedPropertyIds.length !==
											filteredProperties.filter((p) => p.id).length && (
											<button
												type="button"
												className="rounded-md border border-gray-200 bg-white px-4 py-2 font-medium text-blue-600 text-sm shadow-sm transition hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-900 dark:text-blue-400 dark:hover:bg-gray-800"
												onClick={() => {
													const allPropertyIds = filteredProperties
														.filter((p) => p.id)
														.map((p) => p.id);
													setSelectedPropertyIds(allPropertyIds);
												}}
												aria-label="Select all properties"
											>
												Select All
											</button>
										)}
									</div>

									{/* Create List button */}
									<button
										type="button"
										className={`rounded-md bg-orange-600 px-6 py-2 font-semibold text-base text-white shadow-sm transition hover:bg-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 dark:bg-orange-500 dark:hover:bg-orange-600 ${
											selectedPropertyIds.length === 0
												? "cursor-not-allowed opacity-60"
												: ""
										}`}
										disabled={selectedPropertyIds.length === 0}
										aria-disabled={selectedPropertyIds.length === 0}
										onClick={openSkipTraceDialog}
									>
										Create List
										{selectedPropertyIds.length > 0 &&
											` (${selectedPropertyIds.length} Selected)`}
									</button>
								</div>
							</div>

							{/* Property List */}
							<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
								{filteredProperties.map((property) => {
									if (!property.id) return null;
									return (
										<div key={property.id} className="p-4">
											<PropertyCard
												property={property}
												selected={selectedPropertyIds.includes(property.id)}
												onSelect={() =>
													property.id && handlePropertySelect(property.id)
												}
											/>
										</div>
									);
								})}
							</div>

							{/* Load More Button */}
							<div className="flex justify-center py-4">
								<Button
									onClick={() => loadMoreProperties(maxCardsPerLoad)}
									disabled={!hasMore || isLoading}
								>
									{isLoading ? "Loading..." : "Load More Properties"}
								</Button>
							</div>

							{/* Dropdown for Max Cards per Load */}
							<div className="flex justify-center py-4">
								<label htmlFor="maxCardsDropdown" className="mr-2">
									Max Cards per Load:
								</label>
								<select
									id="maxCardsDropdown"
									value={maxCardsPerLoad}
									onChange={handleMaxCardsChange}
									className="rounded border px-2 py-1"
								>
									{cardLoadOptions.map((option) => (
										<option key={option} value={option}>
											{option}
										</option>
									))}
								</select>
							</div>
						</div>
					</CardContent>
				</DrawerContent>
			</Drawer>
		</div>
	);
};

export default PropertyListView;
