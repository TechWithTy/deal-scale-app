"use client";

import React from "react";

import type { PropertyDetails } from "@/types/_dashboard/maps";
import { v4 as uuidv4 } from "uuid";

interface PropertyCardProps {
	property: PropertyDetails;
}

const handlePrimaryImgError = (
	e: React.SyntheticEvent<HTMLImageElement, Event>,
) => {
	e.currentTarget.style.display = "none";
};

const PropertyCardDataComponent: React.FC<PropertyCardProps> = ({
	property,
}) => {
	// Helper function to format keys for better readability
	// const formatKey = (key: string) => {
	//   return key
	//     .replace(/_/g, ' ') // Replace underscores with spaces
	//     .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
	// };

	// Function to render the property details with labels and values
	const renderPropertyDetails = (label: string, value: string | null) => {
		return (
			<div className="mb-4 flex flex-col items-start">
				<span className="font-semibold text-gray-500 dark:text-gray-400">
					{label}
				</span>
				<span>
					{value !== null && value !== undefined && value !== "" ? value : "-"}
				</span>
			</div>
		);
	};

	return (
		<div className="my-2 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800 dark:shadow-lg">
			<h2 className="mb-4 font-bold text-xl dark:text-white">
				Property Information
			</h2>
			<div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
				{renderPropertyDetails("Agent", property.agent)}
				{/* * Render Agent Email as clickable mailto link with wrapping */}
				<div className="mb-4 flex flex-col items-start break-all">
					<span className="font-semibold text-gray-500 dark:text-gray-400">
						Agent Email
					</span>
					{property.agent_email ? (
						<a
							href={`mailto:${property.agent_email}`}
							className="break-all text-blue-600 underline"
							target="_blank"
							rel="noopener noreferrer"
						>
							{property.agent_email}
						</a>
					) : (
						<span>-</span>
					)}
				</div>
				{/* * Render Alt Photos as thumbnails with lightbox modal preview */}
				{(() => {
					const [lightboxOpen, setLightboxOpen] = React.useState(false);
					const [activePhoto, setActivePhoto] = React.useState<string | null>(
						null,
					);
					const photos: string[] = Array.isArray(property.alt_photos)
						? property.alt_photos
						: property.alt_photos
							? [property.alt_photos]
							: [];

					return (
						<div className="mb-4 flex flex-col items-start">
							<span className="font-semibold text-gray-500 dark:text-gray-400">
								Alt Photos
							</span>
							{photos.length > 0 ? (
								<div className="mt-2 flex max-w-full space-x-2 overflow-x-auto">
									{photos.slice(0, 5).map((url, idx) => (
										<button
											key={url}
											type="button"
											className="focus:outline-none"
											onClick={() => {
												setActivePhoto(url);
												setLightboxOpen(true);
											}}
										>
											<img
												src={url}
												alt={`Property ${idx + 1} ${property.latitude} ${property.longitude}`}
												className="h-16 w-24 rounded border object-cover transition-transform hover:scale-105"
												loading="lazy"
											/>
										</button>
									))}
									{photos.length > 5 && (
										<span className="self-center text-gray-400 text-xs">
											+{photos.length - 5} more
										</span>
									)}
								</div>
							) : (
								<div className="flex h-16 w-24 items-center justify-center rounded bg-gray-200">
									<span className="text-gray-400">No Photos</span>
								</div>
							)}

							{/* Lightbox modal */}
							{lightboxOpen && activePhoto && (
								<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
									<div className="relative">
										<img
											src={activePhoto}
											alt="Full property view"
											className="max-h-[80vh] max-w-[90vw] rounded shadow-lg"
										/>
										<button
											type="button"
											onClick={() => setLightboxOpen(false)}
											className="absolute top-2 right-2 rounded-full bg-white p-1 shadow"
											aria-label="Close"
										>
											&#10005;
										</button>
									</div>
								</div>
							)}
						</div>
					);
				})()}

				{renderPropertyDetails(
					"Assessed Value",
					property.assessed_value?.toLocaleString?.() ??
						property.assessed_value?.toString?.() ??
						"-",
				)}
				{renderPropertyDetails("Bedrooms", property.beds?.toString() ?? "-")}
				{renderPropertyDetails("Broker", property.broker ?? "-")}
				{renderPropertyDetails("Broker Phone", property.broker_phone ?? "-")}
				{renderPropertyDetails(
					"Broker Website",
					property.broker_website ?? "-",
				)}
				{renderPropertyDetails("City", property.city)}
				{renderPropertyDetails("County", property.county)}
				{renderPropertyDetails(
					"Days on MLS",
					property.days_on_mls?.toString() ?? "-",
				)}
				{renderPropertyDetails(
					"Estimated Value",
					property.estimated_value?.toLocaleString?.() ??
						property.estimated_value?.toString?.() ??
						"-",
				)}
				{renderPropertyDetails("FIPS Code", property.fips_code)}
				{renderPropertyDetails(
					"Full Bathrooms",
					property.full_baths?.toString() ?? "-",
				)}
				{renderPropertyDetails("Full Street Line", property.full_street_line)}
				{renderPropertyDetails(
					"Partial Bathrooms",
					property.half_baths?.toString() ?? "-",
				)}
				{renderPropertyDetails(
					"HOA Fee",
					property.hoa_fee?.toLocaleString?.() ??
						property.hoa_fee?.toString?.() ??
						"-",
				)}
				{renderPropertyDetails("Last Sold Date", property.last_sold_date)}
				{renderPropertyDetails(
					"Latitude",
					property.latitude?.toString() ?? "-",
				)}
				{renderPropertyDetails("List Date", property.list_date)}
				{renderPropertyDetails(
					"List Price",
					property.list_price?.toLocaleString?.() ??
						property.list_price?.toString?.() ??
						"-",
				)}
				{renderPropertyDetails(
					"Longitude",
					property.longitude?.toString() ?? "-",
				)}
				{renderPropertyDetails(
					"Lot Sqft",
					property.lot_sqft?.toLocaleString?.() ??
						property.lot_sqft?.toString?.() ??
						"-",
				)}
				{renderPropertyDetails("MLS", property.mls)}
				{renderPropertyDetails("MLS ID", property.mls_id)}
				{renderPropertyDetails("Nearby Schools", property.nearby_schools)}
				{renderPropertyDetails("Neighborhoods", property.neighborhoods)}
				{renderPropertyDetails(
					"Parking Garage",
					property.parking_garage?.toString() ?? "-",
				)}
				{renderPropertyDetails(
					"Price Per Sqft",
					property.price_per_sqft?.toLocaleString?.() ??
						property.price_per_sqft?.toString?.() ??
						"-",
				)}
				{/* * Render Primary Photo as an embedded image if available, else show placeholder */}
				<div className="mb-4 flex flex-col items-start">
					<span className="font-semibold text-gray-500 dark:text-gray-400">
						Primary Photo
					</span>
					{property.primary_photo ? (
						<img
							src={property.primary_photo}
							alt="Primary property"
							className="mt-2 h-24 w-36 rounded border object-cover"
							loading="lazy"
							onError={handlePrimaryImgError}
						/>
					) : (
						<span className="text-gray-400">No Photo</span>
					)}
				</div>
				{renderPropertyDetails("Property URL", property.property_url)}
				{renderPropertyDetails(
					"Sold Price",
					property.sold_price?.toLocaleString?.() ??
						property.sold_price?.toString?.() ??
						"-",
				)}
				{renderPropertyDetails(
					"Living Area",
					property.sqft !== null && property.sqft !== undefined
						? `${property.sqft.toLocaleString()} SqFt.`
						: "-",
				)}
				{renderPropertyDetails("State", property.state)}
				{renderPropertyDetails("Status", property.status)}
				{renderPropertyDetails("Stories", property.stories?.toString() ?? "-")}
				{renderPropertyDetails("Street", property.street)}
				{renderPropertyDetails("Style", property.style)}
				{renderPropertyDetails("Unit", property.unit ?? "-")}
				{renderPropertyDetails(
					"Year Built",
					property.year_built?.toString() ?? "-",
				)}
				{renderPropertyDetails("Zip Code", property.zip_code)}
				{renderPropertyDetails(
					"Mortgage Balance",
					property.mortgage_balance?.toLocaleString?.() ??
						property.mortgage_balance?.toString?.() ??
						"-",
				)}
				<div className="col-span-2 mb-4 flex flex-col items-start sm:col-span-3 lg:col-span-4">
					<span className="font-semibold text-gray-500 dark:text-gray-400">
						Text
					</span>
					<span className="whitespace-pre-line break-words">
						{property.text ? property.text : "-"}
					</span>
				</div>

				{/* --- Attributes below are not in PropertyDetails type, kept as comments for future reference --- */}
				{/* // {renderPropertyDetails("Property Use", property.property_use)}
  // {renderPropertyDetails("Residential Units", property.residential_units)}
  // {renderPropertyDetails("Basement", property.basement)}
  // {renderPropertyDetails("Basement Size", property.basement_size)}
  // {renderPropertyDetails("Fireplaces", property.fireplaces)}
  // {renderPropertyDetails("Air Conditioning", property.air_conditioning)}
  // {renderPropertyDetails("Heating", property.heating)}
  // {renderPropertyDetails("Heating Fuel", property.heating_fuel)}
  // {renderPropertyDetails("Water Source", property.water_source)}
  // {renderPropertyDetails("Garage", property.garage)}
  // {renderPropertyDetails("Garage Size", property.garage_size)}
  // {renderPropertyDetails("Carport", property.carport)}
  // {renderPropertyDetails("Porch", property.porch)}
  // {renderPropertyDetails("Patio", property.patio)}
  // {renderPropertyDetails("Pool", property.pool)}
				{renderPropertyDetails("Bedrooms", property.beds)}
				{renderPropertyDetails("Full Bathrooms", property.full_baths)}
				{renderPropertyDetails("Partial Bathrooms", property.half_baths ?? "-")}
				{renderPropertyDetails(
					"Living Area",
					`${property.sqft?.toLocaleString()} SqFt.`,
				)}
				{renderPropertyDetails("Stories", property.stories)}
				{renderPropertyDetails("Property Use", property.property_use)}
				{renderPropertyDetails("Residential Units", property.residential_units)}
				{renderPropertyDetails("Basement", property.basement)}
				{renderPropertyDetails("Basement Size", property.basement_size)}
				{renderPropertyDetails("Parking Spaces", property.parking_garage)}
				{renderPropertyDetails("Fireplaces", property.fireplaces)}
				{renderPropertyDetails("Air Conditioning", property.air_conditioning)}
				{renderPropertyDetails("Heating", property.heating)}
				{renderPropertyDetails("Heating Fuel", property.heating_fuel)}
				{renderPropertyDetails("Water Source", property.water_source ?? "-")}
				{renderPropertyDetails(
					"Garage",
					property.garage ?? "Type Not Specified",
				)}
				{renderPropertyDetails("Garage Size", property.garage_size)}
				{renderPropertyDetails("Carport", property.carport ?? "No")}
				{renderPropertyDetails("Porch", property.porch)}
				{renderPropertyDetails("Patio", property.patio)}
				{renderPropertyDetails("Pool", property.pool ?? "No")} */}
			</div>
		</div>
	);
};

export default PropertyCardDataComponent;
