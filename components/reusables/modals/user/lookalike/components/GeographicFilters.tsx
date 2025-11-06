/**
 * Geographic Filters Component
 * Location-based filtering for states, cities, ZIP codes, and radius search
 * @module lookalike/components
 */

"use client";

import { UseFormReturn } from "react-hook-form";
import { AccordionContent } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { US_STATES, type FormValues } from "../types";

interface GeographicFiltersProps {
	form: UseFormReturn<FormValues>;
}

/**
 * Renders geographic filtering controls
 * Includes states, cities, ZIP codes, and radius-based search
 */
export function GeographicFilters({ form }: GeographicFiltersProps) {
	return (
		<AccordionContent className="space-y-4 pt-4">
			<div>
				<Label>Include States (select multiple)</Label>
				<div className="grid grid-cols-5 gap-2 mt-2 max-h-[200px] overflow-y-auto border rounded p-2">
					{US_STATES.map((state) => (
						<label key={state} className="flex items-center gap-2">
							<Checkbox
								checked={form.watch("states")?.includes(state)}
								onCheckedChange={(checked) => {
									const current = form.watch("states") || [];
									form.setValue(
										"states",
										checked
											? [...current, state]
											: current.filter((s) => s !== state),
									);
								}}
							/>
							<span className="text-sm">{state}</span>
						</label>
					))}
				</div>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div>
					<Label htmlFor="cities">Cities (comma-separated)</Label>
					<Input
						id="cities"
						{...form.register("cities")}
						placeholder="Denver, Austin, Phoenix"
					/>
				</div>

				<div>
					<Label htmlFor="zipCodes">ZIP Codes (comma-separated)</Label>
					<Input
						id="zipCodes"
						{...form.register("zipCodes")}
						placeholder="80202, 78701, 85001"
					/>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div>
					<Label htmlFor="radiusAddress">Radius Search Address</Label>
					<Input
						id="radiusAddress"
						{...form.register("radiusAddress")}
						placeholder="123 Main St, Denver, CO"
					/>
				</div>

				<div>
					<Label htmlFor="radiusMiles">Radius (miles)</Label>
					<Input
						id="radiusMiles"
						type="number"
						{...form.register("radiusMiles", { valueAsNumber: true })}
						placeholder="25"
					/>
				</div>
			</div>

			<div>
				<Label htmlFor="excludeCities">Exclude Cities (comma-separated)</Label>
				<Input
					id="excludeCities"
					{...form.register("excludeCities")}
					placeholder="Los Angeles, New York"
				/>
			</div>
		</AccordionContent>
	);
}
