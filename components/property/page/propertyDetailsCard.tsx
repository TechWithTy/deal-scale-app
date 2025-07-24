"use client";

import type React from "react";

import type { PropertyDetails } from "@/types/_dashboard/maps";

interface PropertyCardProps {
	property: PropertyDetails;
}

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
				{renderPropertyDetails("Agent Email", property.agent_email ?? "-")}
				{/* agent_phones is an array, consider custom rendering if needed */}
				{renderPropertyDetails("Alt Photos", property.alt_photos)}
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
				{renderPropertyDetails("Primary Photo", property.primary_photo)}
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
				{renderPropertyDetails("Text", property.text)}
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
