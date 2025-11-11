/**
 * Compliance-Specific Efficiency Options
 * Data quality and compliance cost-saving filters
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

export function ComplianceEfficiency({
	form,
}: { form: UseFormReturn<FormValues> }) {
	return (
		<Accordion
			type="single"
			collapsible
			className="rounded-lg border border-primary/20 bg-primary/5"
		>
			<AccordionItem value="compliance-efficiency" className="border-none">
				<AccordionTrigger className="px-3 py-2 font-medium text-sm hover:no-underline">
					⚡ Data Quality Efficiency
				</AccordionTrigger>
				<AccordionContent className="space-y-2 px-3 pb-3">
					<label className="flex items-center gap-2">
						<Checkbox
							checked={form.watch("skipDuplicates") ?? true}
							onCheckedChange={(checked) =>
								form.setValue("skipDuplicates", Boolean(checked))
							}
						/>
						<div className="flex-1">
							<span className="text-sm">Skip Duplicate Leads</span>
							<p className="text-muted-foreground text-xs">
								Exclude leads already in your system
							</p>
						</div>
					</label>

					<label className="flex items-center gap-2">
						<Checkbox
							checked={form.watch("skipAlreadyTraced") ?? true}
							onCheckedChange={(checked) =>
								form.setValue("skipAlreadyTraced", Boolean(checked))
							}
						/>
						<div className="flex-1">
							<span className="text-sm">Skip Already Skip-Traced</span>
							<p className="text-muted-foreground text-xs">
								Avoid duplicate enrichment charges
							</p>
						</div>
					</label>

					<label className="flex items-center gap-2">
						<Checkbox
							checked={form.watch("skipDncList") ?? true}
							onCheckedChange={(checked) =>
								form.setValue("skipDncList", Boolean(checked))
							}
						/>
						<div className="flex-1">
							<span className="text-sm">Skip Your DNC List</span>
							<p className="text-muted-foreground text-xs">
								Exclude leads on your Do Not Contact list
							</p>
						</div>
					</label>

					<label className="flex items-center gap-2">
						<Checkbox
							checked={form.watch("skipPreviouslyContacted") ?? false}
							onCheckedChange={(checked) =>
								form.setValue("skipPreviouslyContacted", Boolean(checked))
							}
						/>
						<div className="flex-1">
							<span className="text-sm">Skip Previously Contacted</span>
							<p className="text-muted-foreground text-xs">
								Exclude all leads you've ever contacted
							</p>
						</div>
					</label>

					<label className="flex items-center gap-2">
						<Checkbox
							checked={form.watch("skipInvalidData") ?? true}
							onCheckedChange={(checked) =>
								form.setValue("skipInvalidData", Boolean(checked))
							}
						/>
						<div className="flex-1">
							<span className="text-sm">Skip Invalid Data</span>
							<p className="text-muted-foreground text-xs">
								Exclude leads with known bad phone/email/address
							</p>
						</div>
					</label>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
