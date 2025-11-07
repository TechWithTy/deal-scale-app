/**
 * Social Enrichment Advanced Component
 * Advanced social media data collection and discovery options
 * @module lookalike/components
 */

"use client";

import { FeatureGuard } from "@/components/access/FeatureGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useUserProfileStore } from "@/lib/stores/user/userProfile";
import { ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import type { UseFormReturn } from "react-hook-form";
import type { FormValues } from "../types";
import { SocialAdvanced } from "./advanced/SocialAdvanced";
import { SocialEfficiency } from "./advanced/SocialEfficiency";

interface SocialEnrichmentAdvancedProps {
	form: UseFormReturn<FormValues>;
}

/**
 * Renders advanced social profile enrichment options
 * Requires connected social accounts for platform selection
 */
export function SocialEnrichmentAdvanced({
	form,
}: SocialEnrichmentAdvancedProps) {
	const router = useRouter();
	const socialEnrichmentEnabled = form.watch("socialEnrichment") ?? false;

	// Check for connected accounts
	const connectedAccounts = useUserProfileStore(
		(state) => state.userProfile?.connectedAccounts || {},
	);
	const hasMetaConnected = Boolean(connectedAccounts.facebook);
	const hasLinkedInConnected = Boolean(connectedAccounts.linkedIn);
	const hasInstagramConnected = Boolean(connectedAccounts.instagram);

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

			{/* Social Platforms & Advanced Options */}
			{socialEnrichmentEnabled && (
				<div className="ml-6 space-y-4 border-blue-500/30 border-l-2 pl-4">
					{/* Platform Selection - Requires Connected Accounts */}
					<div className="space-y-3">
						<Label className="font-medium text-sm">
							Social Platforms (Connect Required)
						</Label>
						<div className="grid grid-cols-1 gap-2">
							<label
								className={`flex items-center gap-2 ${!hasMetaConnected ? "opacity-50" : ""}`}
							>
								<Checkbox
									checked={
										hasMetaConnected && (form.watch("includeFacebook") ?? true)
									}
									onCheckedChange={(checked) =>
										form.setValue("includeFacebook", Boolean(checked))
									}
									disabled={!hasMetaConnected}
								/>
								<div className="flex flex-1 items-center justify-between">
									<span className="text-sm">Facebook (Meta)</span>
									{!hasMetaConnected && (
										<Button
											variant="outline"
											size="sm"
											className="h-7 text-xs"
											onClick={() =>
												router.push(
													"/dashboard/profile#oauth?platform=facebook",
												)
											}
										>
											<ExternalLink className="mr-1 h-3 w-3" />
											Connect
										</Button>
									)}
									{hasMetaConnected && (
										<Badge variant="secondary" className="text-[10px]">
											Connected
										</Badge>
									)}
								</div>
							</label>

							<label
								className={`flex items-center gap-2 ${!hasLinkedInConnected ? "opacity-50" : ""}`}
							>
								<Checkbox
									checked={
										hasLinkedInConnected &&
										(form.watch("includeLinkedIn") ?? true)
									}
									onCheckedChange={(checked) =>
										form.setValue("includeLinkedIn", Boolean(checked))
									}
									disabled={!hasLinkedInConnected}
								/>
								<div className="flex flex-1 items-center justify-between">
									<span className="text-sm">LinkedIn</span>
									{!hasLinkedInConnected && (
										<Button
											variant="outline"
											size="sm"
											className="h-7 text-xs"
											onClick={() =>
												router.push(
													"/dashboard/profile#oauth?platform=linkedin",
												)
											}
										>
											<ExternalLink className="mr-1 h-3 w-3" />
											Connect
										</Button>
									)}
									{hasLinkedInConnected && (
										<Badge variant="secondary" className="text-[10px]">
											Connected
										</Badge>
									)}
								</div>
							</label>

							<label
								className={`flex items-center gap-2 ${!hasInstagramConnected ? "opacity-50" : ""}`}
							>
								<Checkbox
									checked={
										hasInstagramConnected &&
										(form.watch("includeInstagram") ?? true)
									}
									onCheckedChange={(checked) =>
										form.setValue("includeInstagram", Boolean(checked))
									}
									disabled={!hasInstagramConnected}
								/>
								<div className="flex flex-1 items-center justify-between">
									<span className="text-sm">Instagram</span>
									{!hasInstagramConnected && (
										<Button
											variant="outline"
											size="sm"
											className="h-7 text-xs"
											onClick={() =>
												router.push(
													"/dashboard/profile#oauth?platform=instagram",
												)
											}
										>
											<ExternalLink className="mr-1 h-3 w-3" />
											Connect
										</Button>
									)}
									{hasInstagramConnected && (
										<Badge variant="secondary" className="text-[10px]">
											Connected
										</Badge>
									)}
								</div>
							</label>
						</div>

						{!hasMetaConnected &&
							!hasLinkedInConnected &&
							!hasInstagramConnected && (
								<div className="rounded border border-yellow-500/30 bg-yellow-500/10 p-2">
									<p className="flex items-start gap-2 text-xs text-yellow-700 dark:text-yellow-400">
										<span className="shrink-0 font-bold">ℹ️</span>
										<span>
											Connect at least one social account to enable
											platform-specific enrichment. Visit your profile settings
											to link accounts.
										</span>
									</p>
								</div>
							)}
					</div>

					{/* Data to Collect */}
					<div className="space-y-3">
						<Label className="font-medium text-sm">Data to Collect</Label>
						<div className="space-y-2">
							{/* Free for Pilot Testers */}
							<FeatureGuard
								featureKey="social.enrichment.friends"
								fallbackMode="disable"
								fallbackTier="Pilot"
							>
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
											Mutual friends, connection counts, network strength
										</p>
										<Badge variant="outline" className="mt-1 text-[10px]">
											Pilot+
										</Badge>
									</div>
								</label>
							</FeatureGuard>

							<FeatureGuard
								featureKey="social.enrichment.interests"
								fallbackMode="disable"
								fallbackTier="Pilot"
							>
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
											Followed pages, interests, groups, engagement data
										</p>
										<Badge variant="outline" className="mt-1 text-[10px]">
											Pilot+
										</Badge>
									</div>
								</label>
							</FeatureGuard>

							<FeatureGuard
								featureKey="social.enrichment.employment"
								fallbackMode="disable"
								fallbackTier="Pilot"
							>
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
										<Badge variant="outline" className="mt-1 text-[10px]">
											Pilot+
										</Badge>
									</div>
								</label>
							</FeatureGuard>

							<FeatureGuard
								featureKey="social.enrichment.username"
								fallbackMode="disable"
								fallbackTier="Pilot"
							>
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
										<Badge variant="outline" className="mt-1 text-[10px]">
											Pilot+
										</Badge>
									</div>
								</label>
							</FeatureGuard>

							{/* Premium Only - Dossier */}
							<FeatureGuard
								featureKey="social.enrichment.dossier"
								fallbackMode="disable"
								fallbackTier="Pro"
							>
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
							</FeatureGuard>
						</div>
					</div>

					{/* Warning */}
					<div className="rounded border border-yellow-500/30 bg-yellow-500/10 p-2">
						<p className="flex items-start gap-2 text-xs text-yellow-700 dark:text-yellow-400">
							<span className="shrink-0 font-bold">ℹ️</span>
							<span>
								Social enrichment requires email addresses and may increase
								processing time by 2-3x. Additional costs apply based on
								platforms and data accessed.
							</span>
						</p>
					</div>

					{/* Social-Specific Nested Options */}
					<SocialEfficiency form={form} />
					<SocialAdvanced form={form} />
				</div>
			)}
		</div>
	);
}
