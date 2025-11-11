/**
 * Social-Specific Efficiency Options
 * Cost-saving filters for social enrichment
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
import type { UseFormReturn } from "react-hook-form";
import type { FormValues } from "../../types";

export function SocialEfficiency({
	form,
}: { form: UseFormReturn<FormValues> }) {
	return (
		<Accordion
			type="single"
			collapsible
			className="rounded-lg border border-primary/20 bg-primary/5"
		>
			<AccordionItem value="social-efficiency" className="border-none">
				<AccordionTrigger className="px-3 py-2 font-medium text-sm hover:no-underline">
					⚡ Social Enrichment Efficiency
				</AccordionTrigger>
				<AccordionContent className="space-y-2 px-3 pb-3">
					<label className="flex items-center gap-2">
						<Checkbox
							checked={form.watch("skipNoEmail") ?? true}
							onCheckedChange={(checked) =>
								form.setValue("skipNoEmail", Boolean(checked))
							}
						/>
						<div className="flex-1">
							<span className="text-sm">Skip Leads Without Email</span>
							<p className="text-muted-foreground text-xs">
								Social enrichment requires email addresses
							</p>
						</div>
					</label>

					<label className="flex items-center gap-2">
						<Checkbox
							checked={form.watch("skipAlreadyEnriched") ?? true}
							onCheckedChange={(checked) =>
								form.setValue("skipAlreadyEnriched", Boolean(checked))
							}
						/>
						<div className="flex-1">
							<span className="text-sm">Skip Already Enriched Profiles</span>
							<p className="text-muted-foreground text-xs">
								Avoid duplicate social data charges
							</p>
						</div>
					</label>

					<label className="flex items-center gap-2">
						<Checkbox
							checked={form.watch("skipInactiveProfiles") ?? false}
							onCheckedChange={(checked) =>
								form.setValue("skipInactiveProfiles", Boolean(checked))
							}
						/>
						<div className="flex-1">
							<span className="text-sm">Skip Inactive Social Profiles</span>
							<p className="text-muted-foreground text-xs">
								Exclude profiles with no activity in 12+ months
							</p>
						</div>
					</label>

					<label className="flex items-center gap-2">
						<Checkbox
							checked={form.watch("skipPrivateProfiles") ?? false}
							onCheckedChange={(checked) =>
								form.setValue("skipPrivateProfiles", Boolean(checked))
							}
						/>
						<div className="flex-1">
							<span className="text-sm">Skip Private/Protected Profiles</span>
							<p className="text-muted-foreground text-xs">
								Exclude profiles with restricted visibility
							</p>
						</div>
					</label>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
