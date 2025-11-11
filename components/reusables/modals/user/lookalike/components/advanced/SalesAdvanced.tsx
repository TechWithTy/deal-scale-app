/**
 * Sales-Specific Advanced Options
 * Advanced targeting for sales and buyer behavior
 */

"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { UseFormReturn } from "react-hook-form";
import type { FormValues } from "../../types";

export function SalesAdvanced({ form }: { form: UseFormReturn<FormValues> }) {
	return (
		<Accordion
			type="single"
			collapsible
			className="rounded-lg border border-muted-foreground/20 bg-muted/30"
		>
			<AccordionItem value="sales-advanced" className="border-none">
				<AccordionTrigger className="px-3 py-2 font-medium text-sm hover:no-underline">
					🔧 Advanced Sales Options
				</AccordionTrigger>
				<AccordionContent className="space-y-3 px-3 pb-3">
					{/* Credit Score Threshold */}
					<div>
						<Label htmlFor="minCreditScore">
							Minimum Credit Score: {form.watch("minCreditScore") || 580}
						</Label>
						<Slider
							id="minCreditScore"
							min={300}
							max={850}
							step={10}
							value={[form.watch("minCreditScore") || 580]}
							onValueChange={([value]) =>
								form.setValue("minCreditScore", value)
							}
							className="mt-2"
						/>
						<p className="mt-1 text-muted-foreground text-xs">
							Filter by minimum credit score for buyer qualification
						</p>
					</div>

					{/* Response Rate Threshold */}
					<div>
						<Label htmlFor="minResponseRate">
							Min Response Likelihood: {form.watch("minResponseRate") || 50}%
						</Label>
						<Slider
							id="minResponseRate"
							min={0}
							max={100}
							step={5}
							value={[form.watch("minResponseRate") || 50]}
							onValueChange={([value]) =>
								form.setValue("minResponseRate", value)
							}
							className="mt-2"
						/>
						<p className="mt-1 text-muted-foreground text-xs">
							AI-predicted likelihood to respond to outreach
						</p>
					</div>

					{/* Purchase Intent Score */}
					<div>
						<Label htmlFor="minPurchaseIntent">
							Min Purchase Intent Score: {form.watch("minPurchaseIntent") || 60}
							%
						</Label>
						<Slider
							id="minPurchaseIntent"
							min={0}
							max={100}
							step={5}
							value={[form.watch("minPurchaseIntent") || 60]}
							onValueChange={([value]) =>
								form.setValue("minPurchaseIntent", value)
							}
							className="mt-2"
						/>
						<p className="mt-1 text-muted-foreground text-xs">
							AI score indicating readiness to buy/sell
						</p>
					</div>

					{/* Exclude Low Engagement */}
					<label className="flex items-center gap-2">
						<Checkbox
							checked={form.watch("excludeLowEngagement") ?? false}
							onCheckedChange={(checked) =>
								form.setValue("excludeLowEngagement", Boolean(checked))
							}
						/>
						<div className="flex-1">
							<span className="text-sm">Exclude Low Engagement Leads</span>
							<p className="text-muted-foreground text-xs">
								Remove leads with history of ignoring outreach
							</p>
						</div>
					</label>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
