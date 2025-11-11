/**
 * Property Filters Component
 * Filters for property type, status, dimensions, and distressed signals
 * @module lookalike/components
 */

"use client";

import { AccordionContent } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { UseFormReturn } from "react-hook-form";
import {
	DISTRESSED_SIGNALS,
	EQUITY_POSITIONS,
	type FormValues,
	OWNERSHIP_DURATIONS,
	PROPERTY_STATUSES,
	PROPERTY_TYPES,
} from "../types";
import { PropertyAdvanced } from "./advanced/PropertyAdvanced";
import { PropertyEfficiency } from "./advanced/PropertyEfficiency";

interface PropertyFiltersProps {
	form: UseFormReturn<FormValues>;
}

/**
 * Renders property-related filters
 * Includes property type, status, dimensions, and distressed signals
 */
export function PropertyFilters({ form }: PropertyFiltersProps) {
	return (
		<div className="space-y-4">
			<div>
				<Label>Property Type</Label>
				<div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
					{PROPERTY_TYPES.map((type) => (
						<label key={type.value} className="flex items-center gap-2">
							<Checkbox
								checked={form.watch("propertyTypes")?.includes(type.value)}
								onCheckedChange={(checked) => {
									const current = form.watch("propertyTypes") || [];
									form.setValue(
										"propertyTypes",
										checked
											? [...current, type.value]
											: current.filter((t) => t !== type.value),
									);
								}}
							/>
							<span className="text-sm">{type.label}</span>
						</label>
					))}
				</div>
			</div>

			<div>
				<Label>Property Status</Label>
				<div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
					{PROPERTY_STATUSES.map((status) => (
						<label key={status.value} className="flex items-center gap-2">
							<Checkbox
								checked={form.watch("propertyStatus")?.includes(status.value)}
								onCheckedChange={(checked) => {
									const current = form.watch("propertyStatus") || [];
									form.setValue(
										"propertyStatus",
										checked
											? [...current, status.value]
											: current.filter((s) => s !== status.value),
									);
								}}
							/>
							<span className="text-sm">{status.label}</span>
						</label>
					))}
				</div>
			</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
				<div>
					<Label>Price Range</Label>
					<div className="mt-1 flex gap-2">
						<Input
							type="number"
							placeholder="Min $"
							{...form.register("priceMin", { valueAsNumber: true })}
						/>
						<Input
							type="number"
							placeholder="Max $"
							{...form.register("priceMax", { valueAsNumber: true })}
						/>
					</div>
				</div>

				<div>
					<Label>Bedrooms</Label>
					<div className="mt-1 flex gap-2">
						<Input
							type="number"
							placeholder="Min"
							{...form.register("bedroomsMin", { valueAsNumber: true })}
						/>
						<Input
							type="number"
							placeholder="Max"
							{...form.register("bedroomsMax", { valueAsNumber: true })}
						/>
					</div>
				</div>

				<div>
					<Label>Bathrooms</Label>
					<div className="mt-1 flex gap-2">
						<Input
							type="number"
							placeholder="Min"
							{...form.register("bathroomsMin", { valueAsNumber: true })}
						/>
						<Input
							type="number"
							placeholder="Max"
							{...form.register("bathroomsMax", { valueAsNumber: true })}
						/>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
				<div>
					<Label>Square Footage</Label>
					<div className="mt-1 flex gap-2">
						<Input
							type="number"
							placeholder="Min sqft"
							{...form.register("sqftMin", { valueAsNumber: true })}
						/>
						<Input
							type="number"
							placeholder="Max sqft"
							{...form.register("sqftMax", { valueAsNumber: true })}
						/>
					</div>
				</div>

				<div>
					<Label>Year Built</Label>
					<div className="mt-1 flex gap-2">
						<Input
							type="number"
							placeholder="Min year"
							{...form.register("yearBuiltMin", { valueAsNumber: true })}
						/>
						<Input
							type="number"
							placeholder="Max year"
							{...form.register("yearBuiltMax", { valueAsNumber: true })}
						/>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
				<div>
					<Label>Ownership Duration</Label>
					<div className="mt-2 space-y-2">
						{OWNERSHIP_DURATIONS.map((duration) => (
							<label key={duration.value} className="flex items-center gap-2">
								<Checkbox
									checked={form
										.watch("ownershipDuration")
										?.includes(duration.value)}
									onCheckedChange={(checked) => {
										const current = form.watch("ownershipDuration") || [];
										form.setValue(
											"ownershipDuration",
											checked
												? [...current, duration.value]
												: current.filter((d) => d !== duration.value),
										);
									}}
								/>
								<span className="text-sm">{duration.label}</span>
							</label>
						))}
					</div>
				</div>

				<div>
					<Label>Equity Position</Label>
					<div className="mt-2 space-y-2">
						{EQUITY_POSITIONS.map((equity) => (
							<label key={equity.value} className="flex items-center gap-2">
								<Checkbox
									checked={form.watch("equityPosition")?.includes(equity.value)}
									onCheckedChange={(checked) => {
										const current = form.watch("equityPosition") || [];
										form.setValue(
											"equityPosition",
											checked
												? [...current, equity.value]
												: current.filter((e) => e !== equity.value),
										);
									}}
								/>
								<span className="text-sm">{equity.label}</span>
							</label>
						))}
					</div>
				</div>
			</div>

			<div>
				<Label>Distressed Signals</Label>
				<div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
					{DISTRESSED_SIGNALS.map((signal) => (
						<label key={signal.value} className="flex items-center gap-2">
							<Checkbox
								checked={form
									.watch("distressedSignals")
									?.includes(signal.value)}
								onCheckedChange={(checked) => {
									const current = form.watch("distressedSignals") || [];
									form.setValue(
										"distressedSignals",
										checked
											? [...current, signal.value]
											: current.filter((s) => s !== signal.value),
									);
								}}
							/>
							<span className="text-sm">{signal.label}</span>
						</label>
					))}
				</div>
			</div>

			{/* Ownership Filters */}
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
				<div>
					<Label htmlFor="corporate">Corporate Ownership</Label>
					<Select
						value={form.watch("corporateOwnership") || "all"}
						onValueChange={(value) =>
							form.setValue("corporateOwnership", value)
						}
					>
						<SelectTrigger id="corporate" className="mt-1.5">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">No preference</SelectItem>
							<SelectItem value="only">Only corporate</SelectItem>
							<SelectItem value="exclude">Exclude corporate</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div>
					<Label htmlFor="absentee">Absentee Owner</Label>
					<Select
						value={form.watch("absenteeOwner") || "all"}
						onValueChange={(value) => form.setValue("absenteeOwner", value)}
					>
						<SelectTrigger id="absentee" className="mt-1.5">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">No preference</SelectItem>
							<SelectItem value="only">Only absentee</SelectItem>
							<SelectItem value="exclude">Exclude absentee</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Property-Specific Nested Options */}
			<PropertyEfficiency form={form} />
			<PropertyAdvanced form={form} />
		</div>
	);
}
