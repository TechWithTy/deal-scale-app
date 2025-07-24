import PageContainer from "@/components/layout/page-container";
import PropertyMap from "@/components/maps/properties/propertyMap";
import WholesaleCalculator from "@/components/property/page/calculations/wholesale";
import ContactInformationCard from "@/components/property/page/contactCard";
import ForeclosuresComponent from "@/components/property/page/forclusureLiens";
import LandLocationInformationComponent from "@/components/property/page/landLocationInformation";
import {
	CurrentMortgageTable,
	LastSaleTable,
} from "@/components/property/page/lastSaleCurrentMortgage";
import LinkedPropertiesComponent from "@/components/property/page/linkedProperties";
import MLSTableComponent from "@/components/property/page/mlsData";
import {
	MortgageHistoryTable,
	SaleHistoryTable,
} from "@/components/property/page/mortgageHistory";
import OwnershipInformationComponent from "@/components/property/page/ownerInformation";
import PropertyCardDataComponent from "@/components/property/page/propertyDetailsCard";
import PropertyHeader from "@/components/property/page/propertyHeader";
import PropertyOverviewCard from "@/components/property/page/propertyOverviewCard";
import TaxInformationComponent from "@/components/property/page/taxInformation";
import {
	exampleLinkedPropertyData,
	foreclosureData,
	liensData,
	mortgageData,
	saleData,
	saleHistoryData,
} from "@/constants/dashboard/profileInfo";
import { detailed_properties_saved } from "@/constants/dashboard/properties";
import { emptyAgentProperty } from "@/constants/dashboard/testProperties";
import {
	calculateOwnershipLength,
	convertSqftToAcres,
} from "@/constants/utility/property";
import type { PropertyDetails } from "@/types/_dashboard/maps";
import { notFound } from "next/navigation";
import AmortizationCalculator from "../../../../components/property/page/calculations/amortizationCalculator";
import PropertyTabsList from "./utils/propertyTabs";
// Async function to fetch property data
async function fetchProperty(id: string): Promise<PropertyDetails | null> {
	try {
		const response = await fetch(`https://api.example.com/properties/${id}`, {
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			return null;
		}

		const property: PropertyDetails = await response.json();
		return property;
	} catch (error) {
		console.error("Failed to fetch property data:", error);
		return null;
	}
}

export default async function PropertyPage({
	params,
}: {
	params: { id: string };
}) {
	const { id } = params;

	// Fetch property data
	let property = await fetchProperty(id);

	// If property data is not found, use the default one
	if (!property) {
		property = detailed_properties_saved[0];
	}

	// If still no property data, render a 404 page
	if (!property) {
		notFound();
	}
	const equity =
		property.estimated_value && property.mortgage_balance
			? property.estimated_value - property.mortgage_balance
			: 0;

	const equityPercentage = property.estimated_value
		? (equity / property.estimated_value) * 100
		: 0;

	let equityStatus = "Low";
	if (equityPercentage > 70) {
		equityStatus = "High";
	} else if (equityPercentage > 40) {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		equityStatus = "Medium";
	}

	const ownershipData = {
		owner1_name: "Not Available", // Placeholder if owner information is not available
		owner2_name: "Not Available", // Placeholder if owner information is not available
		ownership_length: calculateOwnershipLength(property.last_sold_date),
		mailing_address: `${property.full_street_line}, ${property.city}, ${property.state} ${property.zip_code}`,
	};

	const landLocationData = {
		lot_size: `${convertSqftToAcres(property.lot_sqft)} acres`, // Convert sqft to acres
		lot_area: property.lot_sqft
			? `${property.lot_sqft.toLocaleString()} sqft`
			: "N/A", // Safe handling for lot_sqft
		property_class: property.style,
		// apn: property.apn,
		// zoning: property.zoning,
		census_tract: "-", // Placeholder if not available
		block: "-", // Placeholder if not available
		lot_number: "-", // Placeholder if not available
		neighborhood_name: property.neighborhoods,
		neighborhood_type: "Subdivision", // Assumed from the property type
		// legal_description: property.legal_description,
	};

	const mlsData = {
		mls: property.mls,
		mls_id: property.mls_id,
		list_date: property.list_date,
		list_price: property.list_price,
		sold_price: property.sold_price,
		status: property.status,
		property_url: property.property_url,
	};
	const taxInfo = {
		// apn: property.apn,
		tax_year: 2024, // Hardcoded or dynamically set
		tax_amount: property.hoa_fee
			? `$${property.hoa_fee.toLocaleString()}`
			: "N/A",
		assessment_year: 2024, // Hardcoded or dynamically set
		total_assessed_value: property.assessed_value
			? `$${property.assessed_value.toLocaleString()}`
			: "N/A",
		market_land_value: property.assessed_value
			? `$${property.assessed_value.toLocaleString()}`
			: "N/A",
		market_value: property.estimated_value
			? `$${property.estimated_value.toLocaleString()}`
			: "N/A",
		market_improvement_value: "-", // Placeholder
		assessed_land_value: "-", // Placeholder
		assessed_improvement_value: "-", // Placeholder
		county: property.county ?? "N/A",
	};

	const tabsData = [
		{
			value: "overview",
			label: "Overview",
			content: (
				<>
					<ContactInformationCard property={emptyAgentProperty} />
					<WholesaleCalculator />
					<AmortizationCalculator />
				</>
			),
		},
		{
			value: "property-details",
			label: "Property Details",
			content: (
				<>
					<OwnershipInformationComponent ownership={ownershipData} />
					<PropertyCardDataComponent property={property} />
					<LandLocationInformationComponent landLocation={landLocationData} />
				</>
			),
		},
		{
			value: "mls-details",
			label: "MLS Details",
			content: <MLSTableComponent mlsData={mlsData} />,
		},
		{
			value: "tax-information",
			label: "Tax Information",
			content: <TaxInformationComponent taxInfo={taxInfo} />,
		},
		{
			value: "linked-properties",
			label: "Linked Properties",
			content: (
				<LinkedPropertiesComponent
					totalProperties={exampleLinkedPropertyData.totalProperties}
					totalOpenLoanAmount={exampleLinkedPropertyData.totalOpenLoanAmount}
					totalEstimatedValue={exampleLinkedPropertyData.totalEstimatedValue}
					totalEquity={exampleLinkedPropertyData.totalEquity}
					linkedProperties={exampleLinkedPropertyData.linkedProperties}
				/>
			),
		},
		{
			value: "foreclosures-liens",
			label: "Foreclosures & Liens",
			content: (
				<ForeclosuresComponent
					foreclosureData={foreclosureData}
					liensData={liensData}
				/>
			),
		},
		{
			value: "mortgage-transactions",
			label: "Mortgage & Transactions",
			content: (
				<>
					<LastSaleTable sale={saleData} />
					<CurrentMortgageTable mortgage={mortgageData[0]} />
					<MortgageHistoryTable mortgages={mortgageData} />
					<SaleHistoryTable sales={saleHistoryData} />
				</>
			),
		},
	];

	return (
		<PageContainer scrollable={true}>
			<div className=" h-auto w-full space-y-4">
				{/* Full-width container */}
				<PropertyHeader property={property} />

				{/* Google Maps replacing Placeholder Image */}
				<div className="relative mb-4 h-64 w-full">
					<PropertyMap
						latitude={property.latitude}
						longitude={property.longitude}
						address={`${property.street}, ${property.city}, ${property.state} ${property.zip_code}`}
						details={`${property.beds} bed | ${property.full_baths} bath | ${property.sqft} sqft | ${property.year_built} year built`}
					/>
				</div>

				{/* Property Details */}
				<PropertyOverviewCard property={property} />

				<PropertyTabsList tabsData={tabsData} />
			</div>
		</PageContainer>
	);
}
