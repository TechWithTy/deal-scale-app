import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import type { OAuthData } from "@/types/userProfile/connectedAccounts";
import type { ProfileFormValues } from "@/types/zod/userSetup/profile-form-schema";
import {
	Building2,
	CheckCircle2,
	Circle,
	Facebook,
	Linkedin,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { InitialOauthSetupData } from "../../../utils/const/connectedAccounts";
import HashtagInput from "../../../utils/socials/hashtags";
import SearchTermsInput from "../../../utils/socials/searchTerms";
import { InviteFriendsCard } from "@/components/reusables/cards/InviteFriendsCard";

/**
 * OAuth Setup Props
 *
 * @description Strict type for form
 * @description Initial OAuth data
 */
export interface OAuthSetupProps {
	form: UseFormReturn<ProfileFormValues>;
	loading: boolean;
	initialData?: InitialOauthSetupData;
}

const defaultOAuthData: OAuthData = {
	accessToken: "",
	expiresIn: 0,
	tokenType: "",
	scope: "",
	refreshToken: "",
};

interface OAuthProvider {
	id: string;
	name: string;
	description: string;
	icon: React.ReactNode;
	color: string;
	bgColor: string;
	borderColor: string;
}

const oauthProviders: OAuthProvider[] = [
	{
		id: "meta",
		name: "Meta (Facebook)",
		description:
			"Connect your Facebook business account for social media campaigns",
		icon: <Facebook className="h-6 w-6" />,
		color: "text-blue-600",
		bgColor: "bg-blue-50 dark:bg-blue-950",
		borderColor: "border-blue-200 dark:border-blue-800",
	},
	{
		id: "linkedIn",
		name: "LinkedIn",
		description:
			"Sync with LinkedIn for professional networking and lead generation",
		icon: <Linkedin className="h-6 w-6" />,
		color: "text-blue-700",
		bgColor: "bg-blue-50 dark:bg-blue-950",
		borderColor: "border-blue-300 dark:border-blue-800",
	},
	{
		id: "goHighLevel",
		name: "GoHighLevel",
		description:
			"Integrate with GoHighLevel CRM for automated workflows and campaigns",
		icon: (
			<svg
				className="h-6 w-6"
				viewBox="0 0 24 24"
				fill="currentColor"
				aria-label="GoHighLevel icon"
			>
				<title>GoHighLevel</title>
				<path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
			</svg>
		),
		color: "text-green-600",
		bgColor: "bg-green-50 dark:bg-green-950",
		borderColor: "border-green-200 dark:border-green-800",
	},
	{
		id: "loftyCRM",
		name: "Lofty CRM",
		description:
			"Connect Lofty CRM for real estate lead management and automation",
		icon: <Building2 className="h-6 w-6" />,
		color: "text-purple-600",
		bgColor: "bg-purple-50 dark:bg-purple-950",
		borderColor: "border-purple-200 dark:border-purple-800",
	},
];

/**
 * OAuth Setup Component
 *
 * @description Manages OAuth state for all supported social login providers
 * @description Follows DRY and type-safe patterns (see user rules)
 */
export const OAuthSetup: React.FC<OAuthSetupProps> = ({
	form,
	loading,
	initialData,
}) => {
	// * State for each provider's OAuth data
	const [oauthStates, setOauthStates] = useState<
		Record<string, OAuthData | null>
	>({
		meta: null,
		linkedIn: null,
		goHighLevel: null,
		loftyCRM: null,
	});

	// ! Extract initial OAuth data from the profile
	useEffect(() => {
		if (initialData) {
			setOauthStates({
				meta: initialData.connectedAccounts.facebook ?? null,
				linkedIn: initialData.connectedAccounts.linkedIn ?? null,
				goHighLevel: null, // TODO: Add to initialData type
				loftyCRM: null, // TODO: Add to initialData type
			});
		}
	}, [initialData]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (initialData) {
			// * Set the form values for connected accounts and social media tags
			form.setValue(
				"socialMediaCampaignAccounts.oauthData.facebook",
				initialData.connectedAccounts.facebook ?? defaultOAuthData,
			);
			form.setValue(
				"socialMediaCampaignAccounts.oauthData.linkedIn",
				initialData.connectedAccounts.linkedIn ?? defaultOAuthData,
			);
			form.setValue("socialMediatags", initialData.socialMediaTags || []);
		}
	}, [initialData]);

	// ! Handle OAuth login flow for different services
	const handleOAuthLogin = (providerId: string) => {
		const simulatedOAuthData: OAuthData = {
			accessToken: `${providerId}_access_token_${Date.now()}`,
			refreshToken: `${providerId}_refresh_token_${Date.now()}`,
			expiresIn: 3600,
			tokenType: "Bearer",
			scope: "user_profile,email",
		};

		// Update state
		setOauthStates((prev) => ({
			...prev,
			[providerId]: simulatedOAuthData,
		}));

		// Update form values based on provider
		switch (providerId) {
			case "meta":
				form.setValue(
					"socialMediaCampaignAccounts.oauthData.facebook",
					simulatedOAuthData,
				);
				break;
			case "linkedIn":
				form.setValue(
					"socialMediaCampaignAccounts.oauthData.linkedIn",
					simulatedOAuthData,
				);
				break;
			// TODO: Add form fields for GoHighLevel and Lofty CRM
			default:
				break;
		}
	};

	// ! Handle disconnect
	const handleDisconnect = (providerId: string) => {
		setOauthStates((prev) => ({
			...prev,
			[providerId]: null,
		}));

		// Clear form values
		switch (providerId) {
			case "meta":
				form.setValue(
					"socialMediaCampaignAccounts.oauthData.facebook",
					defaultOAuthData,
				);
				break;
			case "linkedIn":
				form.setValue(
					"socialMediaCampaignAccounts.oauthData.linkedIn",
					defaultOAuthData,
				);
				break;
			default:
				break;
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<h3 className="mb-2 font-semibold text-lg">Connected Accounts</h3>
				<p className="text-muted-foreground text-sm">
					Connect your business accounts to enable automated campaigns, lead
					management, and social media integration.
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				{oauthProviders.map((provider) => {
					const isConnected = !!oauthStates[provider.id];

					return (
						<Card
							key={provider.id}
							className={`transition-all ${
								isConnected
									? `border-2 shadow-lg hover:shadow-xl ${provider.bgColor} ${provider.borderColor}`
									: "border-2 border-muted-foreground/20 border-dashed bg-muted/20 hover:border-muted-foreground/40 hover:shadow-md"
							}`}
						>
							<CardHeader className="pb-3">
								<div className="flex items-start justify-between">
									<div className="flex flex-1 items-center gap-3">
										<div
											className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-lg transition-all ${
												isConnected
													? `${provider.color} ${provider.borderColor} border-2 bg-white dark:bg-gray-900`
													: `${provider.bgColor} ${provider.color} opacity-50`
											}`}
										>
											{provider.icon}
										</div>
										<div className="min-w-0 flex-1">
											<CardTitle className="mb-1 flex items-center gap-2 text-base">
												{provider.name}
											</CardTitle>
											{isConnected && (
												<Badge
													variant="default"
													className="bg-green-600 hover:bg-green-700"
												>
													<CheckCircle2 className="mr-1 h-3 w-3" />
													Connected
												</Badge>
											)}
										</div>
									</div>
								</div>
								<CardDescription
									className={`mt-2 text-xs leading-relaxed ${
										isConnected ? "text-foreground/70" : "text-muted-foreground"
									}`}
								>
									{provider.description}
								</CardDescription>
							</CardHeader>
							<CardContent className="pt-0">
								{isConnected ? (
									<div className="space-y-3">
										<div className="rounded-lg border-2 border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950">
											<div className="flex items-center gap-2 text-xs">
												<CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
												<span className="font-semibold text-green-900 dark:text-green-100">
													Active Connection
												</span>
											</div>
											<p className="mt-1 text-green-700 text-xs dark:text-green-300">
												Connected on{" "}
												{new Date().toLocaleDateString("en-US", {
													month: "short",
													day: "numeric",
													year: "numeric",
												})}
											</p>
										</div>
										<div className="flex gap-2">
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={() => handleOAuthLogin(provider.id)}
												disabled={loading}
												className="flex-1"
											>
												🔄 Refresh
											</Button>
											<Button
												type="button"
												variant="destructive"
												size="sm"
												onClick={() => handleDisconnect(provider.id)}
												disabled={loading}
												className="flex-1"
											>
												✕ Disconnect
											</Button>
										</div>
									</div>
								) : (
									<div className="space-y-3">
										<div className="rounded-lg border border-muted-foreground/30 border-dashed bg-muted/50 p-3 text-center">
											<Circle className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
											<p className="font-medium text-muted-foreground text-xs">
												Not Connected
											</p>
										</div>
										<Button
											type="button"
											className="w-full"
											onClick={() => handleOAuthLogin(provider.id)}
											disabled={loading}
										>
											Connect {provider.name}
										</Button>
									</div>
								)}
							</CardContent>
						</Card>
					);
				})}
			</div>

			{/* Social Media Configuration */}
			<div className="mt-8 space-y-6">
				<div>
					<h3 className="mb-1 font-semibold text-base">
						Social Media & Campaign Settings
					</h3>
					<p className="text-muted-foreground text-sm">
						Configure hashtags and search terms for automated campaigns and SEO
						optimization
					</p>
				</div>

				{/* Hashtag Input */}
				<FormField
					control={form.control}
					name="socialMediatags"
					render={({ field, fieldState: { error } }) => (
						<FormItem>
							<HashtagInput
								form={form}
								loading={loading}
								minHashtags={5}
								maxHashtags={10}
								required={false}
							/>
							<FormMessage>{error?.message}</FormMessage>
						</FormItem>
					)}
				/>

				{/* Search Terms Input */}
				<FormField
					control={form.control}
					name="searchTerms"
					render={({ field, fieldState: { error } }) => (
						<FormItem>
							<SearchTermsInput
								form={form}
								loading={loading}
								minTerms={3}
								maxTerms={15}
								required={false}
								fieldName="searchTerms"
							/>
							<FormMessage>{error?.message}</FormMessage>
						</FormItem>
					)}
				/>
			</div>

			{/* Invite Friends Section */}
			<div className="mt-8">
				<InviteFriendsCard
					referralUrl={`https://dealscale.app/ref/${Math.random().toString(36).substring(2, 9).toUpperCase()}`}
					userName="DealScale User"
					rewardType="credits"
					rewardAmount={50}
					showStats={true}
					stats={{
						totalInvitesSent: 0,
						pendingSignups: 0,
						successfulReferrals: 0,
						rewardsEarned: 0,
					}}
					onShare={(platform) => {
						console.log(`Shared via ${platform}`);
						// TODO: Track analytics
					}}
				/>
			</div>
		</div>
	);
};
