"use server";

import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { Suspense } from "react";

// Dynamic imports for client components
const PropertyHeaderWrapper = dynamic(
	() => import("@/components/property/page/PropertyHeaderWrapper"),
	{ ssr: false },
);

import PropertyMap from "@/components/maps/properties/propertyMap";
// Static imports
import {
	calculateOwnershipLength,
	convertSqftToAcres,
} from "@/constants/utility/property";
import {
	createEmptyProperty,
	formatPropertyAddress,
	formatPropertyDetails,
	getPrimaryImage,
} from "@/lib/utils/propertyUtils";
import type { Property } from "@/types/_dashboard/property";
import { isRealtorProperty } from "@/types/_dashboard/property";
const PageContainer = dynamic(
	() => import("@/components/layout/page-container"),
	{ ssr: false },
);
import { getCalculatorComponent } from "external/calculators";
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
import { Skeleton } from "@/components/ui/skeleton";

// Replaced legacy AI score card with external summary client wrapper
import AISummaryCardClient from "@/components/property/page/AISummaryCardClient";
import ContactCard from "@/components/property/page/contactCard";
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
import { emptyAgentProperty as testProperty } from "@/constants/dashboard/testProperties";
import {
	createOffMarketRentCastMock,
	createOnMarketRentCastMock,
} from "@/lib/utils/rentcastFactory";
import { createRealtorProperty } from "@/types/_dashboard/property";
import { z } from "zod";
import PropertyTabsList from "./utils/propertyTabs";

// Dynamically import the client component with no SSR
const PropertyPageClient = dynamic(
	() => import("@/components/property/page/PropertyPageClient"),
	{
		ssr: false,
		loading: () => <Skeleton className="h-64 w-full" />,
	},
);

// Client wrapper that adapts MLS details to current Market View
const MLSDetailsClient = dynamic(
	() => import("@/components/property/page/MLSDetailsClient"),
	{ ssr: false },
);

const WholesaleCalculatorCard = getCalculatorComponent("wholesale");
const AmortizationCalculatorCard = getCalculatorComponent("amortization");

// Async function to fetch property data
async function fetchProperty(id: string): Promise<Property | null> {
	try {
		// First try to get the base URL from environment variables
		const baseUrl =
			process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
		const response = await fetch(`${baseUrl}/properties/${id}`, {
			headers: {
				"Content-Type": "application/json",
			},
			// Add caching for better performance
			next: { revalidate: 60 * 60 }, // Revalidate every hour
		});

		if (!response.ok) {
			console.warn(`Failed to fetch property ${id}: ${response.statusText}`);
			return null;
		}

		// Validate and narrow the response before treating it as Property
		const PropertySchema = z
			.object({
				address: z
					.object({
						street: z.string(),
						city: z.string(),
						state: z.string(),
						zipCode: z.string(),
						unit: z.string().optional().nullable(),
						fullStreetLine: z.string().optional().nullable(),
						latitude: z.number().optional().nullable(),
						longitude: z.number().optional().nullable(),
					})
					.passthrough(),
				details: z
					.object({
						sqft: z.number().optional().nullable(),
						lotSqft: z.number().optional().nullable(),
						style: z.string().optional().nullable(),
					})
					.passthrough(),
			})
			.passthrough();

		const raw = await response.json().catch(() => ({}));
		const parsed = PropertySchema.safeParse(raw);
		if (!parsed.success) {
			console.warn("Property response did not match expected shape");
			return null;
		}
		const property: Property = parsed.data as unknown as Property;
		return property;
	} catch (error) {
		console.error("Failed to fetch property data:", error);
		return null;
	}
}

export default async function PropertyPage({
	params,
	searchParams,
}: {
	params: { id: string };
	searchParams?: { provider?: string; market?: string };
}) {
	const { id } = params;
	const provider = searchParams?.provider || undefined; // 'realtor' | 'rentcast'
	const market = searchParams?.market || undefined; // 'on' | 'off'

	// Fetch property data
	let property = await fetchProperty(id);

	// If provider=rentcast is explicitly requested, override fetched data
	if (provider === "rentcast") {
		property =
			market === "off"
				? createOffMarketRentCastMock()
				: createOnMarketRentCastMock();
	}

	// If property data is not found, use the test realtor property
	if (!property) {
		// Transform test property to match Property type
		property = createRealtorProperty({
			address: {
				street: testProperty.street,
				unit: testProperty.unit || undefined,
				city: testProperty.city,
				state: testProperty.state,
				zipCode: testProperty.zip_code,
				fullStreetLine: testProperty.full_street_line,
				latitude: testProperty.latitude,
				longitude: testProperty.longitude,
			},
			details: {
				beds: testProperty.beds,
				fullBaths: testProperty.full_baths,
				halfBaths: testProperty.half_baths || null,
				sqft: testProperty.sqft,
				yearBuilt: testProperty.year_built,
				lotSqft: testProperty.lot_sqft,
				propertyType: testProperty.style,
				stories: testProperty.stories || 1,
				style: testProperty.style,
				construction: "Unknown",
				roof: "Unknown",
				parking: "Unknown",
			},
			metadata: {
				source: "realtor",
				lastUpdated: new Date().toISOString(),
				listPrice: testProperty.list_price,
				pricePerSqft: testProperty.price_per_sqft,
				status: testProperty.status,
				mlsId: testProperty.mls_id,
				mls: testProperty.mls,
				listDate: testProperty.list_date,
				lastSoldDate: testProperty.last_sold_date,
				daysOnMarket: testProperty.days_on_mls,
				hoaFee: testProperty.hoa_fee,
				parkingGarage: testProperty.parking_garage || 0,
				nearbySchools: testProperty.nearby_schools,
				neighborhoods: testProperty.neighborhoods,
				agent: {
					name: testProperty.agent || "",
					email: testProperty.agent_email || "",
					phones: testProperty.agent_phones || [],
					broker: testProperty.broker || "",
				},
			},
			media: {
				images: [
					{
						url: testProperty.primary_photo || "",
						isPrimary: true,
					},
					...(testProperty.alt_photos?.split(", ").map((url: string) => ({
						url: url.trim(),
						isPrimary: false,
					})) || []),
				],
				virtualTours: [],
			},
			description: testProperty.text || "",
		});
	}

	// Calculate property metrics
	const listPrice = isRealtorProperty(property)
		? property.metadata.listPrice
		: 0;
	const equity = listPrice; // Simplified for now, update with actual calculation when mortgage data is available
	const equityPercentage = listPrice ? 100 : 0; // Simplified for now

	const equityStatus =
		equityPercentage > 70 ? "High" : equityPercentage > 40 ? "Medium" : "Low";

	// Ownership data
	const ownershipData = {
		owner1_name: "Not Available", // Will be updated with actual owner data
		owner2_name: "Not Available",
		ownership_length: "Unknown",
		mailing_address: `${property.address.street}, ${property.address.city}, ${property.address.state} ${property.address.zipCode}`,
	};

	// Compute a friendly tab label based on property type
	const detailsTabLabel = (() => {
		const type = (property.details.propertyType || "Property").toString();
		// Normalize to Title Case words
		const title = type
			.split(" ")
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
			.join(" ");
		// Special handling for common types
		if (title.toLowerCase().includes("land")) return "Land Details";
		if (title.toLowerCase().includes("condo")) return "Condo Details";
		if (title.toLowerCase().includes("townhouse")) return "Townhouse Details";
		if (title.toLowerCase().includes("multi")) return "Multi-Family Details";
		if (title.toLowerCase().includes("apartment")) return "Apartment Details";
		if (title.toLowerCase().includes("single")) return "Single Family Details";
		return `${title} Details`;
	})();

	// Prepare property data with calculated fields
	const enhancedProperty = {
		...property,
		equity,
		equityPercentage,
		equityStatus,
		ownershipData,
	};

	const landLocationData = {
		lot_size: property.details.lotSqft
			? `${convertSqftToAcres(property.details.lotSqft)} acres`
			: "N/A",
		lot_area: property.details.lotSqft
			? `${property.details.lotSqft.toLocaleString()} sqft`
			: "N/A",
		property_class: property.details.style,
		census_tract: "-",
		block: "-",
		lot_number: "-",
		neighborhood_name: isRealtorProperty(property)
			? property.metadata.neighborhoods
			: "",
		neighborhood_type: "Subdivision",
	};

	const mlsData = isRealtorProperty(property)
		? {
				mls: property.metadata.mls,
				mls_id: property.metadata.mlsId,
				list_date: property.metadata.listDate,
				list_price: property.metadata.listPrice,
				sold_price: 0, // Will be updated when sold
				status: property.metadata.status,
				property_url: "#", // Will be updated with actual URL
			}
		: {
				mls: "N/A",
				mls_id: "N/A",
				list_date: "N/A",
				list_price: 0,
				sold_price: 0,
				status: "N/A",
				property_url: "#",
			};
	const taxInfo = {
		tax_year: new Date().getFullYear(),
		tax_amount:
			isRealtorProperty(property) && property.metadata.hoaFee
				? `$${property.metadata.hoaFee.toLocaleString()}`
				: "N/A",
		assessment_year: new Date().getFullYear(),
		total_assessed_value: "N/A",
		market_land_value: "N/A",
		market_value: isRealtorProperty(property)
			? `$${property.metadata.listPrice.toLocaleString()}`
			: "N/A",
		market_improvement_value: "N/A",
		assessed_land_value: "N/A",
		assessed_improvement_value: "N/A",
		county: property.address.city ?? "N/A",
	};

	const tabsData = [
		{
			value: "overview",
			label: "Overview",
			content: (
				<>
					<PropertyOverviewCard property={property} />
					<ContactCard property={property} />
					{WholesaleCalculatorCard ? <WholesaleCalculatorCard /> : null}
					{AmortizationCalculatorCard ? <AmortizationCalculatorCard /> : null}
				</>
			),
		},
		{
			value: "property-details",
			label: detailsTabLabel,
			content: (
				<>
					<OwnershipInformationComponent
						ownership={enhancedProperty.ownershipData}
					/>
					<PropertyCardDataComponent property={property} />
					<LandLocationInformationComponent landLocation={landLocationData} />
				</>
			),
		},
		{
			value: "mls-details",
			label: "MLS Details",
			content: <MLSDetailsClient property={property} />,
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
				<PropertyHeaderWrapper
					property={property}
					initialMarketView={
						provider === "rentcast"
							? market === "off"
								? "off"
								: "on_premium"
							: "on_default"
					}
				/>

				{/* Google Maps */}
				<div className="relative mb-8 w-full" style={{ height: "400px" }}>
					<div className="absolute inset-0">
						<PropertyMap
							latitude={property.address.latitude}
							longitude={property.address.longitude}
							address={formatPropertyAddress(property)}
							details={formatPropertyDetails(property)}
						/>
					</div>
				</div>
				<AISummaryCardClient property={property} />
				<PropertyTabsList tabsData={tabsData} />
			</div>
		</PageContainer>
	);
}
