"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
	isRealtorProperty,
	isRentCastProperty,
	type Property,
	type RentCastProperty,
} from "@/types/_dashboard/property";
import { Pencil } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePropertyMarketView } from "@/lib/stores/property/marketView";
import { mockRentCastMappedProperties } from "@/constants/dashboard/rentcast_properties";

interface PropertyOverviewCardProps {
	property: Property;
}

// --- Helper Functions ---
const formatCurrency = (value: number | null | undefined): string => {
	if (value === null || value === undefined) return "N/A";
	return `$${value.toLocaleString()}`;
};

const PropertyOverviewCard: React.FC<PropertyOverviewCardProps> = ({
	property,
}) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const [isEditing, setIsEditing] = useState(false);

	// --- Derived Data using useMemo for performance and clarity ---

	const { marketView } = usePropertyMarketView();

	// Premium sample for non-RentCast properties
	const premiumSample = (mockRentCastMappedProperties || [])[0] as
		| RentCastProperty
		| undefined;

	const owner = useMemo(() => {
		// Show agent only for On (Default) Realtor view
		if (marketView === "on_default" && isRealtorProperty(property)) {
			return property.metadata.agent.name || "Unknown Agent";
		}
		// Otherwise we don't have a reliable agent; show owner placeholder
		return "-";
	}, [property, marketView]);

	const [ownerName, setOwnerName] = useState(owner);
	const [tempOwnerName, setTempOwnerName] = useState(owner);

	const valueInfo = useMemo(() => {
		// On (Default): Realtor list price
		if (marketView === "on_default" && isRealtorProperty(property)) {
			return { value: property.metadata.listPrice ?? 0, label: "List Price" };
		}
		// On (Premium): RentCast listing price when available (fallback last sale)
		if (marketView === "on_premium") {
			const rc: RentCastProperty | undefined = isRentCastProperty(property)
				? property
				: premiumSample;
			const listingPrice = rc?.listing?.price ?? null;
			const lastSale = rc?.metadata.lastSalePrice ?? null;
			return {
				value: listingPrice ?? lastSale ?? 0,
				label: listingPrice
					? "Listing Price (Premium)"
					: "Last Sale Price (Premium)",
			};
		}
		// Off-Market: prefer last sale price
		if (marketView === "off") {
			if (isRentCastProperty(property)) {
				return {
					value: property.metadata.lastSalePrice ?? 0,
					label: "Last Sale Price",
				};
			}
			if (premiumSample) {
				return {
					value: premiumSample.metadata.lastSalePrice ?? 0,
					label: "Last Sale Price",
				};
			}
		}
		// Fallback for assessed value (RentCast)
		if (isRentCastProperty(property)) {
			const assessments = property.metadata.taxAssessments;
			if (assessments && Object.keys(assessments).length > 0) {
				const latestYear = Math.max(...Object.keys(assessments).map(Number));
				return {
					value: assessments[latestYear]?.value ?? 0,
					label: `Assessed Value (${latestYear})`,
				};
			}
		}
		return { value: 0, label: "Est. Value" };
	}, [property, marketView, premiumSample]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const equityInfo = useMemo(() => {
		// Define a helper type for optional mortgage balance on metadata
		type MetadataWithMortgage = { mortgageBalance?: number };

		// Access `mortgageBalance` in a type-safe manner without using `any`.
		const mortgageBalance =
			(property.metadata as MetadataWithMortgage).mortgageBalance ?? 0;
		const propertyValue = valueInfo.value;

		if (propertyValue <= 0) {
			return { equity: 0, percentage: 0, status: "N/A" };
		}

		const equity = propertyValue - mortgageBalance;
		const percentage = (equity / propertyValue) * 100;

		let status: "High" | "Medium" | "Low" | "N/A" = "Low";
		if (percentage > 70) status = "High";
		else if (percentage > 40) status = "Medium";

		return { equity, percentage, status };
	}, [valueInfo]);

	const lastSale = useMemo(() => {
		if (isRentCastProperty(property)) {
			return {
				date: property.metadata.lastSaleDate,
				price: property.metadata.lastSalePrice,
			};
		}
		if (premiumSample) {
			return {
				date: premiumSample.metadata.lastSaleDate,
				price: premiumSample.metadata.lastSalePrice,
			};
		}
		return { date: null, price: null };
	}, [property, premiumSample]);

	const hoaFee = useMemo(() => {
		if (isRealtorProperty(property)) return property.metadata.hoaFee;
		if (isRentCastProperty(property)) return property.metadata.hoa?.fee;
		return null;
	}, [property]);

	const annualTaxes = useMemo(() => {
		if (isRentCastProperty(property)) {
			const taxes = property.metadata.propertyTaxes;
			if (taxes && Object.keys(taxes).length > 0) {
				const latestYear = Math.max(...Object.keys(taxes).map(Number));
				return { amount: taxes[latestYear]?.total, year: latestYear };
			}
		}
		return null;
	}, [property]);

	const occupancy = useMemo(() => {
		if (
			isRentCastProperty(property) &&
			property.metadata.ownerOccupied !== undefined
		) {
			return property.metadata.ownerOccupied
				? "Owner Occupied"
				: "Tenant Occupied";
		}
		return "Unknown";
	}, [property]);

	const mlsOverview = useMemo(() => {
		// On default: Realtor status + mlsId
		if (marketView === "on_default" && isRealtorProperty(property)) {
			return {
				status: property.metadata.status || "N/A",
				mlsId: property.metadata.mlsId || null,
				listingType: null,
				mlsName: property.metadata.mls || null,
				builder: null,
			};
		}
		// On premium: RentCast listing snapshot
		if (marketView === "on_premium") {
			const rc: RentCastProperty | undefined = isRentCastProperty(property)
				? property
				: premiumSample;
			return {
				status: rc?.listing?.status || "Inactive",
				mlsId: rc?.listing?.mlsNumber || null,
				listingType: rc?.listing?.listingType || null,
				mlsName: rc?.listing?.mlsName || null,
				builder: rc?.listing?.builder?.name || null,
			};
		}
		// Off-market: Inactive, try to show listing mls if present
		if (marketView === "off") {
			const rc: RentCastProperty | undefined = isRentCastProperty(property)
				? property
				: premiumSample;
			return {
				status: "Inactive",
				mlsId: rc?.listing?.mlsNumber || null,
				listingType: rc?.listing?.listingType || null,
				mlsName: rc?.listing?.mlsName || null,
				builder: null, // Builder not relevant for off-market
			};
		}
		return {
			status: "N/A",
			mlsId: null as string | null,
			listingType: null,
			mlsName: null,
			builder: null,
		};
	}, [property, marketView, premiumSample]);

	// --- Handlers ---
	const handleSave = useCallback(() => {
		setOwnerName(tempOwnerName);
		setIsEditing(false);
	}, [tempOwnerName]);

	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === "Enter") {
			handleSave();
		} else if (event.key === "Escape") {
			setTempOwnerName(ownerName);
			setIsEditing(false);
		}
	};

	// --- Effects ---
	useEffect(() => {
		setOwnerName(owner);
		setTempOwnerName(owner);
	}, [owner]);

	useEffect(() => {
		if (isEditing) {
			inputRef.current?.focus();
			const handleClickOutside = (event: MouseEvent) => {
				if (
					inputRef.current &&
					!inputRef.current.contains(event.target as Node)
				) {
					handleSave();
				}
			};
			document.addEventListener("mousedown", handleClickOutside);
			return () =>
				document.removeEventListener("mousedown", handleClickOutside);
		}
	}, [isEditing, handleSave]);

	const equityStatusColor: Record<string, string> = {
		High: "text-green-500",
		Medium: "text-yellow-500",
		Low: "text-red-500",
	};

	return (
		<Card className="my-16 dark:bg-gray-800 dark:text-white">
			<CardContent className="p-6 py-16 sm:p-10">
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
					{/* Owner/Agent Name */}
					<div className="text-center lg:text-left">
						<h2 className="mb-2 font-semibold">
							{marketView === "on_default" && isRealtorProperty(property)
								? "Agent Name"
								: "Owner Name"}
						</h2>
						<div className="flex items-center justify-center space-x-2 lg:justify-start">
							{isEditing ? (
								<input
									ref={inputRef}
									type="text"
									value={tempOwnerName}
									onChange={(e) => setTempOwnerName(e.target.value)}
									maxLength={50}
									onKeyDown={handleKeyDown}
									className="w-full max-w-xs rounded border border-gray-300 p-1 dark:bg-gray-700 dark:text-white"
								/>
							) : (
								<span>{ownerName}</span>
							)}

							{!isEditing && (
								<Pencil
									onClick={() => setIsEditing(true)}
									className="h-4 w-4 cursor-pointer text-blue-500"
								/>
							)}
						</div>
					</div>

					{/* Mortgages (Placeholder) */}
					<div className="text-center lg:text-left">
						<h2 className="mb-2 font-semibold">
							Mortgages
							<span className="ml-2 rounded-full bg-gray-200 px-2 text-sm dark:bg-gray-700 dark:text-gray-300">
								0
							</span>
						</h2>
						<div>-</div>
					</div>

					{/* Equity */}
					<div className="text-center lg:text-left">
						<h2 className="mb-2 font-semibgray-500d">
							Equity <span className="text-gray-500 text-sm">(est.)</span>
						</h2>
						<div className="flex items-center justify-center lg:justify-start">
							{`${formatCurrency(equityInfo.equity)} | ${equityInfo.percentage.toFixed(0)}%`}
							{equityInfo.status !== "N/A" && (
								<span
									className={`ml-2 text-sm ${equityStatusColor[equityInfo.status]}`}
								>
									{equityInfo.status}
								</span>
							)}
						</div>
					</div>

					{/* Occupancy */}
					<div className="text-center lg:text-left">
						<h2 className="mb-2 font-semibold">Occupancy</h2>
						<div>{occupancy}</div>
					</div>

					{/* HOA Fee */}
					<div className="text-center lg:text-left">
						<h2 className="mb-2 font-semibold">HOA Fee</h2>
						<div>{hoaFee ? `${formatCurrency(hoaFee)}/mo` : "N/A"}</div>
					</div>

					{/* Annual Taxes */}
					<div className="text-center lg:text-left">
						<h2 className="mb-2 font-semibold">Annual Taxes</h2>
						<div>
							{annualTaxes
								? `${formatCurrency(annualTaxes.amount)} (${annualTaxes.year})`
								: "N/A"}
						</div>
					</div>

					{/* Est. Value */}
					<div className="text-center lg:text-left">
						<h2 className="mb-2 font-semibold">{valueInfo.label}</h2>
						<div>{formatCurrency(valueInfo.value)}</div>
					</div>

					{/* Last Sale */}
					<div className="text-center lg:text-left">
						<h2 className="mb-2 font-semibold">Last Sale</h2>
						<div>
							{lastSale.date || "N/A"}
							{lastSale.price && ` - ${formatCurrency(lastSale.price)}`}
						</div>
					</div>

					{/* MLS */}
					<div className="text-center lg:text-left">
						<h2 className="mb-2 font-semibold">MLS</h2>
						<div>
							{mlsOverview.status}{" "}
							{mlsOverview.mlsId && `(${mlsOverview.mlsId})`}
						</div>
					</div>

					{/* Listing Type */}
					{mlsOverview.listingType && (
						<div className="text-center lg:text-left">
							<h2 className="mb-2 font-semibold">Listing Type</h2>
							<div>{mlsOverview.listingType}</div>
						</div>
					)}

					{/* MLS Name */}
					{mlsOverview.mlsName && (
						<div className="text-center lg:text-left">
							<h2 className="mb-2 font-semibold">MLS Name</h2>
							<div>{mlsOverview.mlsName}</div>
						</div>
					)}

					{/* Builder */}
					{mlsOverview.builder && (
						<div className="text-center lg:text-left">
							<h2 className="mb-2 font-semibold">Builder</h2>
							<div>{mlsOverview.builder}</div>
						</div>
					)}

					{/* Rent (Placeholder) */}
					<div className="text-center lg:text-left">
						<h2 className="mb-2 font-semibold">
							Rent <span className="text-gray-500 text-sm">(est.)</span>
						</h2>
						<div>$2,750.00/mo</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default PropertyOverviewCard;
