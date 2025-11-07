/**
 * Social-Specific Advanced Options
 * Advanced social profile quality and engagement scores
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

export function SocialAdvanced({ form }: { form: UseFormReturn<FormValues> }) {
	return (
		<Accordion
			type="single"
			collapsible
			className="rounded-lg border border-muted-foreground/20 bg-muted/30"
		>
			<AccordionItem value="social-advanced" className="border-none">
				<AccordionTrigger className="px-3 py-2 font-medium text-sm hover:no-underline">
					🔧 Advanced Social Scores
				</AccordionTrigger>
				<AccordionContent className="space-y-3 px-3 pb-3">
					{/* Social Influence Score */}
					<div>
						<Label htmlFor="minInfluenceScore">
							Min Influence Score: {form.watch("minInfluenceScore") || 30}
						</Label>
						<Slider
							id="minInfluenceScore"
							min={0}
							max={100}
							step={5}
							value={[form.watch("minInfluenceScore") || 30]}
							onValueChange={([value]) =>
								form.setValue("minInfluenceScore", value)
							}
							className="mt-2"
						/>
						<p className="mt-1 text-muted-foreground text-xs">
							Social reach and engagement level (0 = Low, 100 = High)
						</p>
					</div>

					{/* Minimum Connections */}
					<div>
						<Label htmlFor="minConnections">
							Min Connections/Friends: {form.watch("minConnections") || 50}
						</Label>
						<Slider
							id="minConnections"
							min={0}
							max={1000}
							step={50}
							value={[form.watch("minConnections") || 50]}
							onValueChange={([value]) =>
								form.setValue("minConnections", value)
							}
							className="mt-2"
						/>
						<p className="mt-1 text-muted-foreground text-xs">
							Minimum number of social connections required
						</p>
					</div>

					{/* Profile Completeness */}
					<div>
						<Label htmlFor="minProfileCompleteness">
							Min Profile Completeness:{" "}
							{form.watch("minProfileCompleteness") || 60}%
						</Label>
						<Slider
							id="minProfileCompleteness"
							min={0}
							max={100}
							step={10}
							value={[form.watch("minProfileCompleteness") || 60]}
							onValueChange={([value]) =>
								form.setValue("minProfileCompleteness", value)
							}
							className="mt-2"
						/>
						<p className="mt-1 text-muted-foreground text-xs">
							Profile information completeness (bio, photo, work history, etc.)
						</p>
					</div>

					{/* Engagement Rate */}
					<div>
						<Label htmlFor="minEngagementRate">
							Min Engagement Rate: {form.watch("minEngagementRate") || 20}%
						</Label>
						<Slider
							id="minEngagementRate"
							min={0}
							max={100}
							step={5}
							value={[form.watch("minEngagementRate") || 20]}
							onValueChange={([value]) =>
								form.setValue("minEngagementRate", value)
							}
							className="mt-2"
						/>
						<p className="mt-1 text-muted-foreground text-xs">
							Average likes, comments, shares relative to follower count
						</p>
					</div>

					{/* Account Age */}
					<div>
						<Label htmlFor="minAccountAge">
							Min Account Age (months): {form.watch("minAccountAge") || 6}
						</Label>
						<Slider
							id="minAccountAge"
							min={0}
							max={120}
							step={6}
							value={[form.watch("minAccountAge") || 6]}
							onValueChange={([value]) => form.setValue("minAccountAge", value)}
							className="mt-2"
						/>
						<p className="mt-1 text-muted-foreground text-xs">
							Minimum age of social account (newer = potential fake)
						</p>
					</div>

					{/* Require Verified */}
					<label className="flex items-center gap-2">
						<Checkbox
							checked={form.watch("requireVerified") ?? false}
							onCheckedChange={(checked) =>
								form.setValue("requireVerified", Boolean(checked))
							}
						/>
						<div className="flex-1">
							<span className="text-sm">Require Verified Accounts Only</span>
							<p className="text-muted-foreground text-xs">
								Platform-verified badges (may reduce results significantly)
							</p>
						</div>
					</label>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
