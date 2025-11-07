/**
 * Geographic-Specific Advanced Options
 * Advanced location quality and accessibility scores
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

export function GeographicAdvanced({
	form,
}: { form: UseFormReturn<FormValues> }) {
	return (
		<Accordion
			type="single"
			collapsible
			className="rounded-lg border border-muted-foreground/20 bg-muted/30"
		>
			<AccordionItem value="geo-advanced" className="border-none">
				<AccordionTrigger className="px-3 py-2 font-medium text-sm hover:no-underline">
					🔧 Advanced Location Scores
				</AccordionTrigger>
				<AccordionContent className="space-y-3 px-3 pb-3">
					{/* Walk Score */}
					<div>
						<Label htmlFor="minWalkScore">
							Min Walk Score: {form.watch("minWalkScore") || 50}
						</Label>
						<Slider
							id="minWalkScore"
							min={0}
							max={100}
							step={5}
							value={[form.watch("minWalkScore") || 50]}
							onValueChange={([value]) => form.setValue("minWalkScore", value)}
							className="mt-2"
						/>
						<p className="mt-1 text-muted-foreground text-xs">
							0 = Car-dependent, 100 = Walker's Paradise
						</p>
					</div>

					{/* Transit Score */}
					<div>
						<Label htmlFor="minTransitScore">
							Min Transit Score: {form.watch("minTransitScore") || 40}
						</Label>
						<Slider
							id="minTransitScore"
							min={0}
							max={100}
							step={5}
							value={[form.watch("minTransitScore") || 40]}
							onValueChange={([value]) =>
								form.setValue("minTransitScore", value)
							}
							className="mt-2"
						/>
						<p className="mt-1 text-muted-foreground text-xs">
							Public transportation accessibility (0 = None, 100 = Excellent)
						</p>
					</div>

					{/* Bike Score */}
					<div>
						<Label htmlFor="minBikeScore">
							Min Bike Score: {form.watch("minBikeScore") || 40}
						</Label>
						<Slider
							id="minBikeScore"
							min={0}
							max={100}
							step={5}
							value={[form.watch("minBikeScore") || 40]}
							onValueChange={([value]) => form.setValue("minBikeScore", value)}
							className="mt-2"
						/>
						<p className="mt-1 text-muted-foreground text-xs">
							Bikeability of area (0 = Not bikeable, 100 = Very bikeable)
						</p>
					</div>

					{/* Market Appreciation */}
					<div>
						<Label htmlFor="minAppreciation">
							Min 5-Year Appreciation: {form.watch("minAppreciation") || 10}%
						</Label>
						<Slider
							id="minAppreciation"
							min={0}
							max={50}
							step={5}
							value={[form.watch("minAppreciation") || 10]}
							onValueChange={([value]) =>
								form.setValue("minAppreciation", value)
							}
							className="mt-2"
						/>
						<p className="mt-1 text-muted-foreground text-xs">
							Historical 5-year property value appreciation rate
						</p>
					</div>

					{/* Population Growth */}
					<div>
						<Label htmlFor="minPopGrowth">
							Min Population Growth: {form.watch("minPopGrowth") || 0}%
						</Label>
						<Slider
							id="minPopGrowth"
							min={-10}
							max={20}
							step={1}
							value={[form.watch("minPopGrowth") || 0]}
							onValueChange={([value]) => form.setValue("minPopGrowth", value)}
							className="mt-2"
						/>
						<p className="mt-1 text-muted-foreground text-xs">
							5-year population growth rate (can be negative)
						</p>
					</div>

					{/* Proximity Options */}
					<label className="flex items-center gap-2">
						<Checkbox
							checked={form.watch("requireUrbanProximity") ?? false}
							onCheckedChange={(checked) =>
								form.setValue("requireUrbanProximity", Boolean(checked))
							}
						/>
						<div className="flex-1">
							<span className="text-sm">Require Urban Proximity</span>
							<p className="text-muted-foreground text-xs">
								Within 30 miles of major city center
							</p>
						</div>
					</label>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
