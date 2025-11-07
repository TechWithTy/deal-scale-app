/**
 * General Options Component
 * Compliance, enrichment, and data quality settings
 * @module lookalike/components
 */

"use client";

import { FeatureGuard } from "@/components/access/FeatureGuard";
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
import type { FormValues } from "../types";

interface GeneralOptionsProps {
	form: UseFormReturn<FormValues>;
}

/**
 * Renders general configuration options
 * Includes compliance settings, enrichment levels, and data quality filters
 */
export function GeneralOptions({ form }: GeneralOptionsProps) {
	const socialEnrichmentEnabled = form.watch("socialEnrichment") ?? false;

	return (
		<div className="space-y-4">
			{/* Social Profile Enrichment */}
			<div className="space-y-3 rounded-lg border border-blue-500/30 bg-blue-500/5 p-3">
				<Label className="flex items-center gap-2 font-semibold text-sm">
					📱 Social Profile Enrichment
				</Label>

				<label className="flex items-center gap-2">
					<Checkbox
						checked={socialEnrichmentEnabled}
						onCheckedChange={(checked) => {
							form.setValue("socialEnrichment", Boolean(checked));
							// Auto-enable requireEmail when social enrichment is enabled
							if (checked) {
								form.setValue("requireEmail", true);
							}
						}}
					/>
					<div className="flex-1">
						<span className="font-medium text-sm">
							Enable Social Profile Data
						</span>
						<p className="text-muted-foreground text-xs">
							Find Facebook, LinkedIn, Instagram profiles, friends lists,
							interests, and social connections
						</p>
					</div>
				</label>

				{socialEnrichmentEnabled && (
					<div className="ml-6 space-y-2 border-blue-500/30 border-l-2 pl-3">
						<label className="flex items-center gap-2">
							<Checkbox
								checked={form.watch("includeFriendsData") ?? true}
								onCheckedChange={(checked) =>
									form.setValue("includeFriendsData", Boolean(checked))
								}
							/>
							<div className="flex-1">
								<span className="font-medium text-xs">
									Include Friends & Connections
								</span>
								<p className="text-muted-foreground text-xs">
									Fetch mutual connections, friend counts, and network data
								</p>
							</div>
						</label>

						<label className="flex items-center gap-2">
							<Checkbox
								checked={form.watch("includeInterests") ?? true}
								onCheckedChange={(checked) =>
									form.setValue("includeInterests", Boolean(checked))
								}
							/>
							<div className="flex-1">
								<span className="font-medium text-xs">
									Include Interests & Pages Liked
								</span>
								<p className="text-muted-foreground text-xs">
									Gather followed pages, interests, groups, and engagement data
								</p>
							</div>
						</label>

						<label className="flex items-center gap-2">
							<Checkbox
								checked={form.watch("includeEmployment") ?? true}
								onCheckedChange={(checked) =>
									form.setValue("includeEmployment", Boolean(checked))
								}
							/>
							<div className="flex-1">
								<span className="font-medium text-xs">
									Include Employment History
								</span>
								<p className="text-muted-foreground text-xs">
									Current employer, job title, work history from LinkedIn
								</p>
							</div>
						</label>
					</div>
				)}

				{socialEnrichmentEnabled && (
					<div className="rounded border border-yellow-500/30 bg-yellow-500/10 p-2">
						<p className="flex items-start gap-2 text-xs text-yellow-700 dark:text-yellow-400">
							<span className="shrink-0 font-bold">ℹ️</span>
							<span>
								Social enrichment requires email addresses and may increase
								processing time by 2-3x. Additional costs apply based on data
								sources accessed.
							</span>
						</p>
					</div>
				)}
			</div>

			{/* Basic Compliance Options */}
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
				<label className="flex cursor-not-allowed items-center gap-2 opacity-60">
					<Checkbox checked={true} disabled={true} />
					<span className="text-sm">DNC Compliance (exclude DNC numbers)</span>
				</label>

				<label className="flex cursor-not-allowed items-center gap-2 opacity-60">
					<Checkbox checked={true} disabled={true} />
					<span className="text-sm">TCPA Opt-In Required</span>
				</label>

				<label className="flex cursor-not-allowed items-center gap-2 opacity-60">
					<Checkbox checked={true} disabled={true} />
					<span className="text-sm">Require Valid Phone</span>
				</label>

				<label className="flex items-center gap-2">
					<Checkbox
						checked={form.watch("requireEmail") || socialEnrichmentEnabled}
						onCheckedChange={(checked) => {
							if (!socialEnrichmentEnabled) {
								form.setValue("requireEmail", Boolean(checked));
							}
						}}
						disabled={socialEnrichmentEnabled}
					/>
					<div className="flex-1">
						<span className="text-sm">Require Valid Email</span>
						{socialEnrichmentEnabled && (
							<p className="text-muted-foreground text-xs">
								Required for social profile enrichment
							</p>
						)}
					</div>
				</label>
			</div>

			<div>
				<Label htmlFor="enrichmentLevel">Enrichment Level</Label>
				<Select
					value={form.watch("enrichmentLevel") || "premium"}
					onValueChange={(value) =>
						form.setValue(
							"enrichmentLevel",
							value as "none" | "free" | "premium" | "hybrid",
						)
					}
				>
					<SelectTrigger id="enrichmentLevel">
						<SelectValue placeholder="Select enrichment level" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="none">None (No enrichment)</SelectItem>
						<FeatureGuard
							featureKey="lookalike.enrichment.free"
							fallbackMode="disable"
							fallbackTier="Starter"
						>
							<SelectItem value="free">Free (Basic enrichment)</SelectItem>
						</FeatureGuard>
						<SelectItem value="premium">Premium (Available to all)</SelectItem>
						<FeatureGuard
							featureKey="lookalike.enrichment.hybrid"
							fallbackMode="disable"
							fallbackTier="Enterprise"
						>
							<SelectItem value="hybrid">Hybrid (Free + Premium)</SelectItem>
						</FeatureGuard>
					</SelectContent>
				</Select>
				<p className="mt-1 text-muted-foreground text-xs">
					{form.watch("enrichmentLevel") === "none" &&
						"No additional data enrichment will be applied"}
					{form.watch("enrichmentLevel") === "free" &&
						"Basic enrichment with free data sources"}
					{form.watch("enrichmentLevel") === "premium" &&
						"Premium enrichment provides the most accurate and complete data"}
					{form.watch("enrichmentLevel") === "hybrid" &&
						"Combines free and premium data sources for optimal coverage"}
				</p>
			</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
				<div>
					<Label htmlFor="recency">Data Recency (days)</Label>
					<Input
						id="recency"
						type="number"
						{...form.register("dataRecencyDays", { valueAsNumber: true })}
						placeholder="90"
					/>
				</div>

				<div>
					<Label htmlFor="corporate" className="whitespace-nowrap">
						Corporate Ownership
					</Label>
					<Select
						value={form.watch("corporateOwnership") || "all"}
						onValueChange={(value) =>
							form.setValue("corporateOwnership", value)
						}
					>
						<SelectTrigger id="corporate">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">No preference</SelectItem>
							<SelectItem value="only">Only corporate</SelectItem>
							<SelectItem value="exclude">Exclude corporate</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div>
				<Label htmlFor="absentee" className="whitespace-nowrap">
					Absentee Owner
				</Label>
				<Select
					value={form.watch("absenteeOwner") || "all"}
					onValueChange={(value) => form.setValue("absenteeOwner", value)}
				>
					<SelectTrigger id="absentee">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">No preference</SelectItem>
						<SelectItem value="only">Only absentee</SelectItem>
						<SelectItem value="exclude">Exclude absentee</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Efficiency & Deduplication Options */}
			<div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
				<Label className="flex items-center gap-2 font-semibold text-sm">
					⚡ Efficiency Options
				</Label>

				<div className="grid grid-cols-1 gap-3">
					<label className="flex items-center gap-2">
						<Checkbox
							checked={form.watch("skipDuplicates") ?? true}
							onCheckedChange={(checked) =>
								form.setValue("skipDuplicates", Boolean(checked))
							}
						/>
						<div className="flex-1">
							<span className="font-medium text-sm">Skip Duplicate Leads</span>
							<p className="text-muted-foreground text-xs">
								Exclude leads that already exist in your system
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
							<span className="font-medium text-sm">
								Skip Already Skip-Traced
							</span>
							<p className="text-muted-foreground text-xs">
								Exclude leads you've already enriched to avoid duplicate charges
							</p>
						</div>
					</label>

					<label className="flex items-center gap-2">
						<Checkbox
							checked={form.watch("skipExistingCampaigns") ?? true}
							onCheckedChange={(checked) =>
								form.setValue("skipExistingCampaigns", Boolean(checked))
							}
						/>
						<div className="flex-1">
							<span className="font-medium text-sm">
								Skip Leads in Active Campaigns
							</span>
							<p className="text-muted-foreground text-xs">
								Exclude leads currently being contacted to avoid double outreach
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
							<span className="font-medium text-sm">Skip Your DNC List</span>
							<p className="text-muted-foreground text-xs">
								Exclude leads on your personal Do Not Contact list
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
							<span className="font-medium text-sm">
								Skip Previously Contacted
							</span>
							<p className="text-muted-foreground text-xs">
								Exclude all leads you've ever contacted (includes closed
								campaigns)
							</p>
						</div>
					</label>
				</div>
			</div>
		</div>
	);
}
