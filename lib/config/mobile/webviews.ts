import { z } from "zod";

const idSchema = z
	.string()
	.trim()
	.min(3)
	.max(40)
	.regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, or dashes only.");

const urlSchema = z
	.string()
	.trim()
	.url({ message: "Must be a valid HTTPS URL." })
	.refine(
		(value) => value.startsWith("https://"),
		"Only HTTPS endpoints are allowed.",
	);

const pathSchema = z
	.string()
	.trim()
	.regex(
		/^\/[a-z0-9\-/_]*$/i,
		"Fallback paths must be relative and start with '/'.",
	)
	.optional();

const analyticsSchema = z
	.object({
		page: z.string().trim().min(3).max(80),
		eventPrefix: z.string().trim().min(3).max(60),
	})
	.optional();

const webviewManifestSchema = z.object({
	id: idSchema,
	title: z.string().trim().min(4).max(80),
	description: z.string().trim().min(8).max(160),
	uri: urlSchema,
	allowedOrigins: z.array(urlSchema).min(1),
	offlineFallbackPath: pathSchema,
	featureFlags: z.array(z.string().trim().min(2).max(60)).default([]),
	analytics: analyticsSchema,
	allowedMessagingTopics: z
		.array(z.string().trim().min(2).max(50))
		.default(["navigation", "analytics"]),
});

const rawWebviewManifests = [
	{
		id: "insights-dashboard",
		title: "Partner Insights Dashboard",
		description:
			"Embed the full analytics workspace for partners that prefer the web dashboard experience.",
		uri: "https://partners.dealscale.app/dashboard",
		allowedOrigins: [
			"https://partners.dealscale.app",
			"https://partners.dealscale-staging.app",
		],
		offlineFallbackPath: "/offline/partner-dashboard",
		featureFlags: ["webview.enabled", "analytics.vitals"],
		analytics: {
			page: "mobile-webview-partner-dashboard",
			eventPrefix: "partner_dashboard",
		},
		allowedMessagingTopics: ["analytics", "session", "notifications"],
	},
	{
		id: "contracts-hub",
		title: "Contracts & Signatures",
		description:
			"Surface the web-based contract execution flow with secure session bridging and audit logging.",
		uri: "https://contracts.dealscale.app/sign",
		allowedOrigins: ["https://contracts.dealscale.app"],
		offlineFallbackPath: "/offline/contracts",
		featureFlags: ["webview.enabled", "contracts.esign"],
		analytics: {
			page: "mobile-webview-contracts",
			eventPrefix: "contracts_hub",
		},
		allowedMessagingTopics: ["session", "alerts"],
	},
] as const;

const parsedManifests = webviewManifestSchema
	.array()
	.parse(rawWebviewManifests)
	.map((manifest) => ({
		...manifest,
		featureFlags: [...manifest.featureFlags],
		allowedOrigins: [...manifest.allowedOrigins],
		allowedMessagingTopics: [...manifest.allowedMessagingTopics],
	}));

export type MobileWebviewManifest = z.infer<typeof webviewManifestSchema>;

export const getMobileWebviewManifests = (): readonly MobileWebviewManifest[] =>
	parsedManifests;
