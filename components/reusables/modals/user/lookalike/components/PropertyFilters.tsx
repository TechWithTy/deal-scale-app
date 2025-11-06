/**
 * Property Filters Component
 * Filters for property type, status, dimensions, and distressed signals
 * @module lookalike/components
 */

"use client";

import { UseFormReturn } from "react-hook-form";
import { AccordionContent } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
	PROPERTY_TYPES,
	PROPERTY_STATUSES,
	DISTRESSED_SIGNALS,
	type FormValues,
} from "../types";

interface PropertyFiltersProps {
	form: UseFormReturn<FormValues>;
}

/**
 * Renders property-related filters
 * Includes property type, status, dimensions, and distressed signals
 */
export function PropertyFilters({ form }: PropertyFiltersProps) {
	return (
		<AccordionContent className="space-y-4 pt-4">
			<div>
				<Label>Property Type</Label>
				<div className="grid grid-cols-3 gap-2 mt-2">
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
				<div className="grid grid-cols-3 gap-2 mt-2">
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

			<div className="grid grid-cols-2 gap-4">
				<div>
					<Label>Price Range</Label>
					<div className="flex gap-2 mt-1">
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
					<div className="flex gap-2 mt-1">
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
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div>
					<Label>Square Footage</Label>
					<div className="flex gap-2 mt-1">
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
					<div className="flex gap-2 mt-1">
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

			<div>
				<Label>Distressed Signals</Label>
				<div className="grid grid-cols-2 gap-2 mt-2">
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
		</AccordionContent>
	);
}
