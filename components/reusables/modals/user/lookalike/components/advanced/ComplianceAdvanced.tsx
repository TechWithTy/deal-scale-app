/**
 * Compliance-Specific Advanced Options
 * Advanced data quality and validation scores
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

export function ComplianceAdvanced({
	form,
}: { form: UseFormReturn<FormValues> }) {
	return (
		<Accordion
			type="single"
			collapsible
			className="rounded-lg border border-muted-foreground/20 bg-muted/30"
		>
			<AccordionItem value="compliance-advanced" className="border-none">
				<AccordionTrigger className="px-3 py-2 font-medium text-sm hover:no-underline">
					🔧 Advanced Data Quality
				</AccordionTrigger>
				<AccordionContent className="space-y-3 px-3 pb-3">
					{/* Phone Validation Score */}
					<div>
						<Label htmlFor="minPhoneValidity">
							Min Phone Validity Score: {form.watch("minPhoneValidity") || 70}%
						</Label>
						<Slider
							id="minPhoneValidity"
							min={0}
							max={100}
							step={10}
							value={[form.watch("minPhoneValidity") || 70]}
							onValueChange={([value]) =>
								form.setValue("minPhoneValidity", value)
							}
							className="mt-2"
						/>
						<p className="mt-1 text-muted-foreground text-xs">
							Phone number validation confidence (0 = Invalid, 100 = Valid)
						</p>
					</div>

					{/* Email Deliverability */}
					<div>
						<Label htmlFor="minEmailDeliverability">
							Min Email Deliverability:{" "}
							{form.watch("minEmailDeliverability") || 80}%
						</Label>
						<Slider
							id="minEmailDeliverability"
							min={0}
							max={100}
							step={10}
							value={[form.watch("minEmailDeliverability") || 80]}
							onValueChange={([value]) =>
								form.setValue("minEmailDeliverability", value)
							}
							className="mt-2"
						/>
						<p className="mt-1 text-muted-foreground text-xs">
							Email deliverability score (catches spam traps, bounces)
						</p>
					</div>

					{/* Address Validation */}
					<div>
						<Label htmlFor="minAddressValidity">
							Min Address Validity: {form.watch("minAddressValidity") || 75}%
						</Label>
						<Slider
							id="minAddressValidity"
							min={0}
							max={100}
							step={5}
							value={[form.watch("minAddressValidity") || 75]}
							onValueChange={([value]) =>
								form.setValue("minAddressValidity", value)
							}
							className="mt-2"
						/>
						<p className="mt-1 text-muted-foreground text-xs">
							USPS-validated address confidence score
						</p>
					</div>

					{/* Data Freshness */}
					<div>
						<Label htmlFor="maxDataAge">
							Max Data Age (days): {form.watch("maxDataAge") || 90}
						</Label>
						<Slider
							id="maxDataAge"
							min={0}
							max={365}
							step={30}
							value={[form.watch("maxDataAge") || 90]}
							onValueChange={([value]) => form.setValue("maxDataAge", value)}
							className="mt-2"
						/>
						<p className="mt-1 text-muted-foreground text-xs">
							Maximum age of contact data (fresher = more accurate)
						</p>
					</div>

					{/* NCOA Verified */}
					<label className="flex items-center gap-2">
						<Checkbox
							checked={form.watch("requireNcoaVerified") ?? false}
							onCheckedChange={(checked) =>
								form.setValue("requireNcoaVerified", Boolean(checked))
							}
						/>
						<div className="flex-1">
							<span className="text-sm">Require NCOA Verified Addresses</span>
							<p className="text-muted-foreground text-xs">
								National Change of Address database verification
							</p>
						</div>
					</label>

					{/* Wireless Number Detection */}
					<label className="flex items-center gap-2">
						<Checkbox
							checked={form.watch("excludeLandlines") ?? false}
							onCheckedChange={(checked) =>
								form.setValue("excludeLandlines", Boolean(checked))
							}
						/>
						<div className="flex-1">
							<span className="text-sm">Mobile Numbers Only</span>
							<p className="text-muted-foreground text-xs">
								Exclude landlines (better for SMS campaigns)
							</p>
						</div>
					</label>

					{/* Require Multiple Contact Methods */}
					<label className="flex items-center gap-2">
						<Checkbox
							checked={form.watch("requireMultipleContacts") ?? false}
							onCheckedChange={(checked) =>
								form.setValue("requireMultipleContacts", Boolean(checked))
							}
						/>
						<div className="flex-1">
							<span className="text-sm">Require Multiple Contact Methods</span>
							<p className="text-muted-foreground text-xs">
								Must have valid phone AND email (higher quality)
							</p>
						</div>
					</label>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
