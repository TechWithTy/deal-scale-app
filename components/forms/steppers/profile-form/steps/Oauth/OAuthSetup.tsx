import { InviteFriendsCard } from "@/components/reusables/cards/InviteFriendsCard";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { OAuthData } from "@/types/userProfile/connectedAccounts";
import type { ProfileFormValues } from "@/types/zod/userSetup/profile-form-schema";
import {
	Building2,
	CheckCircle2,
	Circle,
	Facebook,
	Linkedin,
	Lock,
	MessageSquare,
	Music4,
	Sparkles,
	Webhook,
} from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { useUserStore } from "@/lib/stores/userStore";
import { hasRequiredTier } from "@/constants/subscription/tiers";
import type { InitialOauthSetupData } from "../../../utils/const/connectedAccounts";
import HashtagInput from "../../../utils/socials/hashtags";
import SearchTermsInput from "../../../utils/socials/searchTerms";

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
	requiredTier?: "Basic" | "Starter" | "Enterprise";
	enterpriseHighlights?: {
		problem: string;
		solution: string;
		benefits: string[];
	};
	featureBlocked?: boolean;
	featureBlockedReason?: string;
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
		id: "spotify",
		name: "Spotify",
		description:
			"Curate branded playlists for waiting rooms, events, and campaign touchpoints",
		icon: <Music4 className="h-6 w-6" />,
		color: "text-green-600",
		bgColor: "bg-green-50 dark:bg-green-950",
		borderColor: "border-green-200 dark:border-green-800",
	},
	{
		id: "twilio",
		name: "Twilio",
		description:
			"Route calls and SMS through Twilio to power outreach, hotlines, and nurturing",
		icon: <MessageSquare className="h-6 w-6" />,
		color: "text-rose-600",
		bgColor: "bg-rose-50 dark:bg-rose-950",
		borderColor: "border-rose-200 dark:border-rose-800",
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
		color: "text-emerald-600",
		bgColor: "bg-emerald-50 dark:bg-emerald-950",
		borderColor: "border-emerald-200 dark:border-emerald-800",
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
	{
		id: "n8n",
		name: "n8n Workflows",
		description:
			"Connect n8n for advanced workflow automation and integration triggers",
		icon: <Webhook className="h-6 w-6" />,
		color: "text-orange-600",
		bgColor: "bg-orange-50 dark:bg-orange-950",
		borderColor: "border-orange-200 dark:border-orange-800",
	},
	{
		id: "discord",
		name: "Discord",
		description:
			"Connect Discord for bot notifications, webhooks, and community integration",
		icon: (
			<svg
				className="h-6 w-6"
				viewBox="0 0 24 24"
				fill="currentColor"
				aria-label="Discord icon"
			>
				<title>Discord</title>
				<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
			</svg>
		),
		color: "text-indigo-600",
		bgColor: "bg-indigo-50 dark:bg-indigo-950",
		borderColor: "border-indigo-200 dark:border-indigo-800",
	},
	{
		id: "kestra",
		name: "Kestra",
		description:
			"Connect Kestra for ML-powered workflow orchestration and data pipeline automation",
		icon: (
			<svg
				className="h-6 w-6"
				viewBox="0 0 24 24"
				fill="currentColor"
				aria-label="Kestra icon"
			>
				<title>Kestra</title>
				<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
			</svg>
		),
		color: "text-pink-600",
		bgColor: "bg-pink-50 dark:bg-pink-950",
		borderColor: "border-pink-200 dark:border-pink-800",
		requiredTier: "Enterprise",
		featureBlocked: true,
		featureBlockedReason:
			"Kestra orchestration is in private beta. Join the waitlist to get early access.",
		enterpriseHighlights: {
			problem:
				"Manual data workflows and disconnected automation tools slow down your team and create errors",
			solution:
				"Kestra unifies your entire data pipeline with AI-powered orchestration, reducing setup time by 80% and eliminating workflow errors",
			benefits: [
				"ML-driven predictive scheduling",
				"Real-time data pipeline monitoring",
				"Auto-scaling workflow execution",
				"Advanced error recovery & retries",
			],
		},
	},
];

const aiProviderOptions = [
	{
		id: "dealscale",
		title: "DealScale Fusion",
		tagline: "Managed AI with guardrails",
		description:
			"Adaptive routing across our proprietary models with live observability, safety rails, and cost controls.",
		recommended: true,
	},
	{
		id: "openai",
		title: "OpenAI GPT",
		tagline: "Best-in-class general reasoning",
		description:
			"Use GPT-4.1 for rich conversations, summarization, and knowledge synthesis.",
	},
	{
		id: "claude",
		title: "Anthropic Claude",
		tagline: "High compliance & long context",
		description:
			"Great for regulated industries needing alignment and traceable outputs.",
	},
	{
		id: "deepseek",
		title: "DeepSeek",
		tagline: "Cost-optimized reasoning",
		description:
			"Efficient for large-scale lead scoring, enrichment, and outbound personalization.",
	},
];

const aiRoutingOptions = [
	{
		id: "balanced",
		label: "Balanced",
		description: "Smartly weights quality vs cost per request.",
	},
	{
		id: "quality",
		label: "Quality First",
		description: "Always favor highest-performing models.",
	},
	{
		id: "economy",
		label: "Cost Saver",
		description: "Route to cost-effective models unless overridden.",
	},
];

const fallbackOptions = [
	{ id: "none", label: "No Fallback" },
	...aiProviderOptions.map((option) => ({
		id: option.id,
		label: option.title,
	})),
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
	// * Get user tier for enterprise feature checking
	const userTier = useUserStore((state) => state.tier);

	// * State for each provider's OAuth data
	const [oauthStates, setOauthStates] = useState<
		Record<string, OAuthData | null>
	>({
		meta: null,
		linkedIn: null,
		spotify: null,
		twilio: null,
		goHighLevel: null,
		loftyCRM: null,
		n8n: null,
		discord: null,
		kestra: null,
	});

	// Generate referral URL client-side only to avoid hydration mismatch
	const [referralUrl, setReferralUrl] = useState("");

	// Generate referral URL on client side only
	useEffect(() => {
		const code = Math.random().toString(36).substring(2, 9).toUpperCase();
		setReferralUrl(`https://dealscale.app/ref/${code}`);
	}, []);

	// ! Extract initial OAuth data from the profile
	useEffect(() => {
		if (initialData) {
			setOauthStates({
				meta: initialData.connectedAccounts.facebook ?? null,
				linkedIn: initialData.connectedAccounts.linkedIn ?? null,
				spotify: initialData.connectedAccounts.spotify ?? null,
				twilio: initialData.connectedAccounts.twilio ?? null,
				goHighLevel: initialData.connectedAccounts.goHighLevel ?? null,
				loftyCRM: initialData.connectedAccounts.loftyCRM ?? null,
				n8n: initialData.connectedAccounts.n8n ?? null,
				discord: initialData.connectedAccounts.discord ?? null,
				kestra: initialData.connectedAccounts.kestra ?? null,
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
			form.setValue(
				"socialMediaCampaignAccounts.oauthData.spotify",
				initialData.connectedAccounts.spotify ?? defaultOAuthData,
			);
			form.setValue(
				"socialMediaCampaignAccounts.oauthData.twilio",
				initialData.connectedAccounts.twilio ?? defaultOAuthData,
			);
			form.setValue("socialMediatags", initialData.socialMediaTags || []);
			if (initialData.aiProvider) {
				form.setValue("aiProvider", initialData.aiProvider as any);
			}
		}
	}, [initialData]);

	// ! Handle OAuth login flow for different services
	const handleOAuthLogin = (providerId: string) => {
		const provider = oauthProviders.find((item) => item.id === providerId);
		if (provider?.featureBlocked) {
			toast.info(
				"This integration is in private beta. Join the waitlist to be notified.",
			);
			return;
		}

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
			case "spotify":
				form.setValue(
					"socialMediaCampaignAccounts.oauthData.spotify",
					simulatedOAuthData,
				);
				break;
			case "twilio":
				form.setValue(
					"socialMediaCampaignAccounts.oauthData.twilio",
					simulatedOAuthData,
				);
				break;
			case "goHighLevel":
				form.setValue(
					"socialMediaCampaignAccounts.oauthData.goHighLevel",
					simulatedOAuthData,
				);
				break;
			case "loftyCRM":
				form.setValue(
					"socialMediaCampaignAccounts.oauthData.loftyCRM",
					simulatedOAuthData,
				);
				break;
			case "n8n":
				form.setValue(
					"socialMediaCampaignAccounts.oauthData.n8n",
					simulatedOAuthData,
				);
				break;
			case "discord":
				form.setValue(
					"socialMediaCampaignAccounts.oauthData.discord",
					simulatedOAuthData,
				);
				break;
			case "kestra":
				form.setValue(
					"socialMediaCampaignAccounts.oauthData.kestra",
					simulatedOAuthData,
				);
				break;
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
			case "spotify":
				form.setValue(
					"socialMediaCampaignAccounts.oauthData.spotify",
					defaultOAuthData,
				);
				break;
			case "twilio":
				form.setValue(
					"socialMediaCampaignAccounts.oauthData.twilio",
					defaultOAuthData,
				);
				break;
			case "goHighLevel":
				form.setValue(
					"socialMediaCampaignAccounts.oauthData.goHighLevel",
					defaultOAuthData,
				);
				break;
			case "loftyCRM":
				form.setValue(
					"socialMediaCampaignAccounts.oauthData.loftyCRM",
					defaultOAuthData,
				);
				break;
			case "n8n":
				form.setValue(
					"socialMediaCampaignAccounts.oauthData.n8n",
					defaultOAuthData,
				);
				break;
			case "discord":
				form.setValue(
					"socialMediaCampaignAccounts.oauthData.discord",
					defaultOAuthData,
				);
				break;
			case "kestra":
				form.setValue(
					"socialMediaCampaignAccounts.oauthData.kestra",
					defaultOAuthData,
				);
				break;
			default:
				break;
		}
	};

	const selectedPrimary = form.watch("aiProvider.primary");
	const selectedFallback = form.watch("aiProvider.fallback");
	const selectedRouting = form.watch("aiProvider.routing");

	const primaryInfo = useMemo(
		() => aiProviderOptions.find((option) => option.id === selectedPrimary),
		[selectedPrimary],
	);

	const fallbackInfo = useMemo(
		() => aiProviderOptions.find((option) => option.id === selectedFallback),
		[selectedFallback],
	);

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
					const hasAccess = provider.featureBlocked
						? false
						: provider.requiredTier
							? hasRequiredTier(userTier, provider.requiredTier)
							: true;
					const isLocked = !hasAccess;

					return (
						<Card
							key={provider.id}
							className={`transition-all ${
								isConnected
									? `border-2 shadow-lg hover:shadow-xl ${provider.bgColor} ${provider.borderColor}`
									: isLocked || provider.featureBlocked
										? "border-2 border-muted-foreground/10 border-dashed bg-muted/10 opacity-75"
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
													: isLocked || provider.featureBlocked
														? "border-2 border-muted-foreground/20 bg-muted/30 text-muted-foreground/40"
														: `${provider.bgColor} ${provider.color} opacity-50`
											}`}
										>
											{isLocked || provider.featureBlocked ? (
												<Lock className="h-6 w-6" />
											) : (
												provider.icon
											)}
										</div>
										<div className="min-w-0 flex-1">
											<CardTitle className="mb-1 flex items-center gap-2 text-base">
												{provider.name}
												{provider.requiredTier && (
													<Badge
														variant="secondary"
														className="bg-amber-100 text-amber-900 text-xs dark:bg-amber-900 dark:text-amber-100"
													>
														{provider.requiredTier}
													</Badge>
												)}
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
										isConnected
											? "text-foreground/70"
											: isLocked || provider.featureBlocked
												? "text-muted-foreground/60"
												: "text-muted-foreground"
									}`}
								>
									{provider.description}
								</CardDescription>
							</CardHeader>
							<CardContent className="pt-0">
								{provider.featureBlocked ? (
									<div className="space-y-3">
										<div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-center dark:border-amber-800 dark:bg-amber-950/40">
											<p className="mb-1 font-semibold text-amber-900 text-xs dark:text-amber-100">
												🚧 In Private Beta
											</p>
											<p className="text-amber-700 text-xs leading-relaxed dark:text-amber-300">
												{provider.featureBlockedReason ??
													"We're polishing this integration before opening access."}
											</p>
										</div>
										<Button
											type="button"
											className="w-full"
											disabled
											variant="outline"
										>
											<Lock className="mr-2 h-4 w-4" /> Join Waitlist
										</Button>
									</div>
								) : isConnected ? (
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

			{/* AI Provider Orchestration */}
			<div className="mt-8 space-y-5">
				<div>
					<h3 className="mb-1 font-semibold text-base">
						AI Provider Orchestration
					</h3>
					<p className="text-muted-foreground text-sm">
						Choose how DealScale orchestrates large language model calls. Mix
						and match providers and routing rules to balance cost, latency, and
						compliance.
					</p>
				</div>
				<div className="grid gap-4 md:grid-cols-3">
					<FormField
						control={form.control}
						name="aiProvider.primary"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-sm font-medium">
									Primary Provider
								</FormLabel>
								<FormControl>
									<Select onValueChange={field.onChange} value={field.value}>
										<SelectTrigger className="mt-1">
											<SelectValue placeholder="Select primary" />
										</SelectTrigger>
										<SelectContent>
											{aiProviderOptions.map((option) => (
												<SelectItem key={option.id} value={option.id}>
													{option.title}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="aiProvider.fallback"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-sm font-medium">
									Fallback Provider
								</FormLabel>
								<FormControl>
									<Select onValueChange={field.onChange} value={field.value}>
										<SelectTrigger className="mt-1">
											<SelectValue placeholder="Select fallback" />
										</SelectTrigger>
										<SelectContent>
											{fallbackOptions.map((option) => (
												<SelectItem key={option.id} value={option.id}>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="aiProvider.routing"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-sm font-medium">
									Routing Strategy
								</FormLabel>
								<FormControl>
									<Select onValueChange={field.onChange} value={field.value}>
										<SelectTrigger className="mt-1">
											<SelectValue placeholder="Select strategy" />
										</SelectTrigger>
										<SelectContent>
											{aiRoutingOptions.map((option) => (
												<SelectItem key={option.id} value={option.id}>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<div className="rounded-lg border border-border/60 bg-card/50 p-4">
					<div className="flex items-center gap-2">
						<Sparkles className="h-4 w-4 text-primary" />
						<p className="font-semibold text-sm text-foreground">
							Execution Plan
						</p>
						{primaryInfo?.recommended && (
							<Badge
								variant="default"
								className="ml-auto bg-primary/10 text-primary"
							>
								Recommended
							</Badge>
						)}
					</div>
					<p className="mt-2 text-muted-foreground text-xs leading-relaxed">
						Requests start with{" "}
						<strong>{primaryInfo?.title ?? "DealScale Fusion"}</strong>
						{selectedFallback !== "none" && fallbackInfo ? (
							<>
								, then automatically fail over to{" "}
								<strong>{fallbackInfo.title}</strong> if a call fails.
							</>
						) : (
							" with no failover configured."
						)}
					</p>
					<p className="text-muted-foreground text-xs leading-relaxed">
						Routing mode:{" "}
						<strong>
							{aiRoutingOptions.find((option) => option.id === selectedRouting)
								?.label ?? "Balanced"}
						</strong>
						—{" "}
						{
							aiRoutingOptions.find((option) => option.id === selectedRouting)
								?.description
						}
					</p>
				</div>
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
				<div className="mb-4 rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 p-4">
					<h3 className="mb-2 font-semibold text-base">
						🎉 Refer Friends & Earn Rewards
					</h3>
					<div className="space-y-3 text-sm">
						<p className="text-foreground/80">
							Share DealScale with your network and earn{" "}
							<span className="font-bold text-primary">50 credits</span> for
							each successful referral!
						</p>
						<div className="grid gap-2 md:grid-cols-3">
							<div className="rounded-md border border-blue-200 bg-blue-50/50 p-3 dark:border-blue-800 dark:bg-blue-950/50">
								<p className="mb-1 flex items-center gap-1 font-semibold text-blue-600 text-xs dark:text-blue-400">
									🤖 AI Credits
								</p>
								<p className="text-muted-foreground text-xs leading-relaxed">
									For AI voice calls, smart responses, lead nurturing, and
									automated conversations.
								</p>
							</div>
							<div className="rounded-md border border-green-200 bg-green-50/50 p-3 dark:border-green-800 dark:bg-green-950/50">
								<p className="mb-1 flex items-center gap-1 font-semibold text-green-600 text-xs dark:text-green-400">
									👥 Lead Credits
								</p>
								<p className="text-muted-foreground text-xs leading-relaxed">
									For accessing verified leads, contact data, and building your
									pipeline.
								</p>
							</div>
							<div className="rounded-md border border-purple-200 bg-purple-50/50 p-3 dark:border-purple-800 dark:bg-purple-950/50">
								<p className="mb-1 flex items-center gap-1 font-semibold text-purple-600 text-xs dark:text-purple-400">
									🔍 Skip Trace Credits
								</p>
								<p className="text-muted-foreground text-xs leading-relaxed">
									For finding property owner info, phone numbers, and contact
									details.
								</p>
							</div>
						</div>
						<div className="rounded-md bg-white/50 p-3 dark:bg-gray-900/50">
							<p className="mb-1 font-semibold text-primary text-xs">
								🎯 How it Works
							</p>
							<p className="text-muted-foreground text-xs leading-relaxed">
								Your friend signs up → Completes profile setup → You both get{" "}
								<span className="font-semibold">50 credits split</span> across
								all three types! No limits on referrals.
							</p>
						</div>
					</div>
				</div>
				{referralUrl && (
					<InviteFriendsCard
						referralUrl={referralUrl}
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
				)}
			</div>
		</div>
	);
};
