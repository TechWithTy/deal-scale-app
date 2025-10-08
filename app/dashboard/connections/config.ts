import {
	Activity,
	Rss,
	ShieldCheck,
	Webhook,
	type LucideIcon,
} from "lucide-react";

import type { ButtonProps } from "@/components/ui/button";
import type { WebhookStage } from "@/lib/stores/dashboard";

export type ActivityRow = {
	id: string;
	stage: WebhookStage;
	event: string;
	endpoint: string;
	status: number;
	latency: string;
	response: string;
	createdAt: string;
};

export const connectionActivity: ActivityRow[] = [
	{
		id: "incoming-1",
		stage: "incoming",
		event: "lead.status.updated",
		endpoint: "/api/webhooks/org-demo/incoming",
		status: 200,
		latency: "248 ms",
		response: "OK",
		createdAt: "Oct 08, 14:32",
	},
	{
		id: "incoming-2",
		stage: "incoming",
		event: "lead.created",
		endpoint: "/api/webhooks/org-demo/incoming",
		status: 401,
		latency: "112 ms",
		response: "Invalid signature",
		createdAt: "Oct 08, 13:58",
	},
	{
		id: "outgoing-1",
		stage: "outgoing",
		event: "message.sent",
		endpoint: "https://crm.example.com/hooks/dealscale",
		status: 200,
		latency: "391 ms",
		response: "Accepted",
		createdAt: "Oct 08, 14:35",
	},
	{
		id: "outgoing-2",
		stage: "outgoing",
		event: "lead.status.changed",
		endpoint: "https://crm.example.com/hooks/dealscale",
		status: 500,
		latency: "640 ms",
		response: "Timeout",
		createdAt: "Oct 08, 14:12",
	},
	{
		id: "feeds-1",
		stage: "feeds",
		event: "feed.refresh",
		endpoint: "RSS subscription — Topline Pro",
		status: 200,
		latency: "82 ms",
		response: "Cached",
		createdAt: "Oct 08, 14:36",
	},
];

export type StageHighlight = { title: string; description: string };

export const connectionHighlights: Record<WebhookStage, StageHighlight[]> = {
	incoming: [
		{
			title: "Signature verification",
			description:
				"HMAC-SHA256 validation with rotating secrets keeps every CRM event trusted.",
		},
		{
			title: "Replay protection",
			description:
				"Requests older than 5 minutes are rejected automatically using timestamp headers.",
		},
	],
	outgoing: [
		{
			title: "Smart retries",
			description:
				"Automatic exponential backoff protects your CRM while guaranteeing delivery attempts.",
		},
		{
			title: "Delivery insights",
			description:
				"Monitor latency, response codes, and signatures across every connected destination.",
		},
	],
	feeds: [
		{
			title: "Secure tokens",
			description:
				"Append feed tokens to authenticate dashboards or partners consuming the activity stream.",
		},
		{
			title: "Real-time mirroring",
			description:
				"Every webhook delivery is transformed into a structured feed item for analytics tooling.",
		},
	],
};

export type StageCardConfig = {
	icon: LucideIcon;
	highlightIcon: LucideIcon;
	title: string;
	description: string;
	buttonLabel: string;
	buttonVariant: ButtonProps["variant"];
	footer: string;
};

export const connectionStageCards: Record<WebhookStage, StageCardConfig> = {
	incoming: {
		icon: Webhook,
		highlightIcon: ShieldCheck,
		title: "Accept CRM events",
		description:
			"Generate secure endpoints for HubSpot, Salesforce, or custom CRMs.",
		buttonLabel: "Configure Incoming Webhook",
		buttonVariant: "default",
		footer:
			"Use the X-DealScale-Signature header to verify authenticity with your org secret.",
	},
	outgoing: {
		icon: Activity,
		highlightIcon: Webhook,
		title: "Broadcast DealScale updates",
		description:
			"Deliver AI replies, lead status changes, and handoffs to downstream systems.",
		buttonLabel: "Configure Outgoing Webhook",
		buttonVariant: "secondary",
		footer: "Customize retries, events, and response logging per destination.",
	},
	feeds: {
		icon: Rss,
		highlightIcon: Rss,
		title: "Share activity feeds",
		description:
			"Offer read-only RSS or JSON feeds to partner dashboards and RevOps teams.",
		buttonLabel: "View Feed Options",
		buttonVariant: "outline",
		footer:
			"Feeds reuse outgoing signatures so subscribers can trust every broadcast event.",
	},
};
