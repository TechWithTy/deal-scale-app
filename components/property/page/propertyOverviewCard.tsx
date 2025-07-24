"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
	isRealtorProperty,
	isRentCastProperty,
	type Property,
} from "@/types/_dashboard/property";
import { Pencil } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

	const owner = useMemo(() => {
		if (isRealtorProperty(property)) {
			return property.metadata.agent.name || "Unknown Agent";
		}
		// The RentCast type doesn't specify an owner name, so we use a placeholder.
		// This could be enhanced if owner data is added to the type.
		return "Unknown Owner";
	}, [property]);

	const [ownerName, setOwnerName] = useState(owner);
	const [tempOwnerName, setTempOwnerName] = useState(owner);

	const valueInfo = useMemo(() => {
		if (isRealtorProperty(property)) {
			return { value: property.metadata.listPrice, label: "List Price" };
		}
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
	}, [property]);

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
		if (isRealtorProperty(property)) {
			return { date: property.metadata.lastSoldDate, price: null };
		}
		if (isRentCastProperty(property)) {
			return {
				date: property.metadata.lastSaleDate,
				price: property.metadata.lastSalePrice,
			};
		}
		return { date: null, price: null };
	}, [property]);

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

	const mlsId = useMemo(() => {
		return isRealtorProperty(property) ? property.metadata.mlsId : null;
	}, [property]);

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
							{isRealtorProperty(property) ? "Agent Name" : "Owner Name"}
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
							{isRealtorProperty(property) ? property.metadata.status : "N/A"}{" "}
							{mlsId && `(${mlsId})`}
						</div>
					</div>

					{/* Rent (Placeholder) */}
					<div className="text-center lg:text-left">
						<h2 className="mb-2 font-semgray-500old">
							sm Rent <span className="text-gray-500 text-sm">(est.)</span>
						</h2>
						<div>$2,750.00/mo</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default PropertyOverviewCard;
