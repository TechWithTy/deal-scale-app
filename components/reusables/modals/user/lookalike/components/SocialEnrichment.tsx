/**
 * Social Enrichment Component
 * Social media profile discovery and data collection options
 * @module lookalike/components
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { UseFormReturn } from "react-hook-form";
import type { FormValues } from "../types";

interface SocialEnrichmentProps {
	form: UseFormReturn<FormValues>;
}

/**
 * Renders social profile enrichment options
 * Auto-enables email requirement when any social option is selected
 */
export function SocialEnrichment({ form }: SocialEnrichmentProps) {
	const socialEnrichmentEnabled = form.watch("socialEnrichment") ?? false;

	return (
		<div className="space-y-4">
			{/* Main Social Enrichment Toggle */}
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
						Enable Social Profile Enrichment
					</span>
					<p className="text-muted-foreground text-xs">
						Discover social media profiles, connections, and digital footprint
					</p>
				</div>
			</label>

			{/* Social Platforms */}
			{socialEnrichmentEnabled && (
				<div className="ml-6 space-y-4 border-blue-500/30 border-l-2 pl-4">
					{/* Platform Selection */}
					<div className="space-y-3">
						<Label className="font-medium text-sm">Social Platforms</Label>
						<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
							<label className="flex items-center gap-2">
								<Checkbox
									checked={form.watch("includeFacebook") ?? true}
									onCheckedChange={(checked) =>
										form.setValue("includeFacebook", Boolean(checked))
									}
								/>
								<span className="text-sm">Facebook</span>
							</label>

							<label className="flex items-center gap-2">
								<Checkbox
									checked={form.watch("includeLinkedIn") ?? true}
									onCheckedChange={(checked) =>
										form.setValue("includeLinkedIn", Boolean(checked))
									}
								/>
								<span className="text-sm">LinkedIn</span>
							</label>

							<label className="flex items-center gap-2">
								<Checkbox
									checked={form.watch("includeInstagram") ?? true}
									onCheckedChange={(checked) =>
										form.setValue("includeInstagram", Boolean(checked))
									}
								/>
								<span className="text-sm">Instagram</span>
							</label>

							<label className="flex items-center gap-2">
								<Checkbox
									checked={form.watch("includeTwitter") ?? false}
									onCheckedChange={(checked) =>
										form.setValue("includeTwitter", Boolean(checked))
									}
								/>
								<span className="text-sm">Twitter/X</span>
							</label>
						</div>
					</div>

					{/* Data to Collect */}
					<div className="space-y-3">
						<Label className="font-medium text-sm">Data to Collect</Label>
						<div className="space-y-2">
							<label className="flex items-center gap-2">
								<Checkbox
									checked={form.watch("includeFriendsData") ?? true}
									onCheckedChange={(checked) =>
										form.setValue("includeFriendsData", Boolean(checked))
									}
								/>
								<div className="flex-1">
									<span className="font-medium text-xs">
										Friends & Connections
									</span>
									<p className="text-muted-foreground text-xs">
										Mutual friends, connection counts, network data
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
										Interests & Pages Liked
									</span>
									<p className="text-muted-foreground text-xs">
										Followed pages, interests, groups, engagement
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
										Employment History
									</span>
									<p className="text-muted-foreground text-xs">
										Company, job title, work history, estimated income
									</p>
								</div>
							</label>

							<label className="flex items-center gap-2">
								<Checkbox
									checked={form.watch("includeUsername") ?? true}
									onCheckedChange={(checked) =>
										form.setValue("includeUsername", Boolean(checked))
									}
								/>
								<div className="flex-1">
									<span className="font-medium text-xs">
										Usernames & Profile URLs
									</span>
									<p className="text-muted-foreground text-xs">
										Social handles, profile links, platform-specific IDs
									</p>
								</div>
							</label>

							<label className="flex items-center gap-2">
								<Checkbox
									checked={form.watch("includeSocialDossier") ?? false}
									onCheckedChange={(checked) =>
										form.setValue("includeSocialDossier", Boolean(checked))
									}
								/>
								<div className="flex-1">
									<span className="font-medium text-xs">
										Full Social Dossier
									</span>
									<p className="text-muted-foreground text-xs">
										Complete profile analysis, activity patterns, influence
										score
									</p>
									<Badge variant="secondary" className="mt-1 text-[10px]">
										Premium
									</Badge>
								</div>
							</label>
						</div>
					</div>

					{/* Warning */}
					<div className="rounded border border-yellow-500/30 bg-yellow-500/10 p-2">
						<p className="flex items-start gap-2 text-xs text-yellow-700 dark:text-yellow-400">
							<span className="shrink-0 font-bold">ℹ️</span>
							<span>
								Social enrichment requires email addresses and may increase
								processing time by 2-3x. Additional costs apply based on data
								sources and platforms accessed.
							</span>
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
