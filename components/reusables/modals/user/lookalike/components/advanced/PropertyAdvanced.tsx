/**
 * Property-Specific Advanced Options
 * Advanced property scores and quality metrics
 */

"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { UseFormReturn } from "react-hook-form";
import type { FormValues } from "../../types";

export function PropertyAdvanced({
	form,
}: { form: UseFormReturn<FormValues> }) {
	return (
		<Accordion
			type="single"
			collapsible
			className="rounded-lg border border-muted-foreground/20 bg-muted/30"
		>
			<AccordionItem value="property-advanced" className="border-none">
				<AccordionTrigger className="px-3 py-2 font-medium text-sm hover:no-underline">
					🔧 Advanced Property Scores
				</AccordionTrigger>
				<AccordionContent className="space-y-3 px-3 pb-3">
					{/* Flood Risk Score */}
					<div>
						<Label htmlFor="maxFloodScore">
							Max Flood Risk Score: {form.watch("maxFloodScore") || 30}
						</Label>
						<Slider
							id="maxFloodScore"
							min={0}
							max={100}
							step={5}
							value={[form.watch("maxFloodScore") || 30]}
							onValueChange={([value]) => form.setValue("maxFloodScore", value)}
							className="mt-2"
						/>
						<p className="mt-1 text-muted-foreground text-xs">
							0 = No flood risk, 100 = High flood risk. Lower is better.
						</p>
					</div>

					{/* Crime Score */}
					<div>
						<Label htmlFor="maxCrimeScore">
							Max Crime Score: {form.watch("maxCrimeScore") || 50}
						</Label>
						<Slider
							id="maxCrimeScore"
							min={0}
							max={100}
							step={5}
							value={[form.watch("maxCrimeScore") || 50]}
							onValueChange={([value]) => form.setValue("maxCrimeScore", value)}
							className="mt-2"
						/>
						<p className="mt-1 text-muted-foreground text-xs">
							0 = Very safe, 100 = High crime. Lower is safer.
						</p>
					</div>

					{/* Air Quality Index */}
					<div>
						<Label htmlFor="minAirQuality">
							Min Air Quality Score: {form.watch("minAirQuality") || 60}
						</Label>
						<Slider
							id="minAirQuality"
							min={0}
							max={100}
							step={5}
							value={[form.watch("minAirQuality") || 60]}
							onValueChange={([value]) => form.setValue("minAirQuality", value)}
							className="mt-2"
						/>
						<p className="mt-1 text-muted-foreground text-xs">
							0 = Poor air quality, 100 = Excellent. Higher is better.
						</p>
					</div>

					{/* Property Condition Score */}
					<div>
						<Label htmlFor="minConditionScore">
							Min Condition Score: {form.watch("minConditionScore") || 50}
						</Label>
						<Slider
							id="minConditionScore"
							min={0}
							max={100}
							step={5}
							value={[form.watch("minConditionScore") || 50]}
							onValueChange={([value]) =>
								form.setValue("minConditionScore", value)
							}
							className="mt-2"
						/>
						<p className="mt-1 text-muted-foreground text-xs">
							AI-assessed property condition (0 = Poor, 100 = Excellent)
						</p>
					</div>

					{/* School Rating */}
					<div>
						<Label htmlFor="minSchoolRating">
							Min School Rating: {form.watch("minSchoolRating") || 5}/10
						</Label>
						<Slider
							id="minSchoolRating"
							min={1}
							max={10}
							step={1}
							value={[form.watch("minSchoolRating") || 5]}
							onValueChange={([value]) =>
								form.setValue("minSchoolRating", value)
							}
							className="mt-2"
						/>
						<p className="mt-1 text-muted-foreground text-xs">
							Average school rating in area (1-10 scale)
						</p>
					</div>

					{/* Require Recent Photos */}
					<label className="flex items-center gap-2">
						<Checkbox
							checked={form.watch("requireRecentPhotos") ?? false}
							onCheckedChange={(checked) =>
								form.setValue("requireRecentPhotos", Boolean(checked))
							}
						/>
						<div className="flex-1">
							<span className="text-sm">Require Recent Property Photos</span>
							<p className="text-muted-foreground text-xs">
								Only include properties with photos from last 6 months
							</p>
						</div>
					</label>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
