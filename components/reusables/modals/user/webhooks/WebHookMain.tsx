"use client";

import { categoryConfig } from "@/app/dashboard/connections/config";
import WalkThroughModal from "@/components/leadsSearch/search/WalkthroughModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockUserProfile } from "@/constants/_faker/profile/userProfile";
import { enrichmentOptions } from "@/constants/skip-trace/enrichmentOptions";
import {
	type WebhookCategory,
	type WebhookStage,
	useModalStore,
} from "@/lib/stores/dashboard";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import WebhookFeedPreview, { type FeedItemType } from "./WebhookFeedPreview";
import WebhookHistory from "./WebhookHistory";
import type { WebhookEntryType } from "./WebhookHistory";
import WebhookModalActions from "./WebhookModalActions";
import WebhookPayloadSection from "./WebhookPayloadSection";
import WebhookUrlInput from "./WebhookUrlInput";
type WebhookHistoryByStage = Record<
	"incoming" | "outgoing",
	WebhookEntryType[]
>;

type WebhookSetupOption = {
	value: string;
	label: string;
	description: string;
	eventPrefix: string;
	pathSegment: string;
	isFree?: boolean;
	cost?: number;
};

type LeadHandlingMode = "add" | "sync";

const webhookSetupOptions: Record<WebhookCategory, WebhookSetupOption[]> = {
	leads: [
		{
			value: "off-market-motivated-sellers",
			label: "Off-market leads",
			description:
				"Capture off-market leads from forms, CRM pushes, and imports.",
			eventPrefix: "off_market_lead",
			pathSegment: "off-market-leads",
		},
		{
			value: "motivated-sellers",
			label: "Motivated sellers",
			description: "Capture motivated seller leads from direct webhook intake.",
			eventPrefix: "motivated_seller",
			pathSegment: "motivated-sellers",
		},
		{
			value: "cash-buyers",
			label: "Cash buyers",
			description: "Create or sync cash buyer leads from buyer criteria.",
			eventPrefix: "cash_buyer",
			pathSegment: "cash-buyers",
		},
	],
	campaigns: [
		{
			value: "call-campaigns",
			label: "Call campaigns",
			description: "Send dialer outcomes, call attempts, and follow-up tasks.",
			eventPrefix: "call_campaign",
			pathSegment: "call-campaigns",
		},
		{
			value: "text-campaigns",
			label: "Text campaigns",
			description: "Sync SMS replies, opt-outs, and message delivery status.",
			eventPrefix: "text_campaign",
			pathSegment: "text-campaigns",
		},
		{
			value: "facebook-campaigns",
			label: "Facebook campaigns",
			description:
				"Route Facebook lead ads and engagement events into DealScale.",
			eventPrefix: "facebook_campaign",
			pathSegment: "facebook-campaigns",
		},
		{
			value: "linkedin-campaigns",
			label: "LinkedIn campaigns",
			description: "Track LinkedIn outreach, replies, and prospect handoffs.",
			eventPrefix: "linkedin_campaign",
			pathSegment: "linkedin-campaigns",
		},
		{
			value: "direct-mail",
			label: "Direct mail",
			description:
				"Trigger mailer sends, delivery updates, and response events.",
			eventPrefix: "direct_mail",
			pathSegment: "direct-mail",
		},
	],
	skiptracing: [
		...enrichmentOptions.map((option) => ({
			value: option.id,
			label: option.title,
			description: option.isFree
				? `${option.description} Free option.`
				: `${option.description} ${option.cost} credit per use.`,
			eventPrefix: option.id,
			pathSegment: option.id,
			isFree: option.isFree,
			cost: option.cost,
		})),
	],
};

const webhookFeedOptions: Record<WebhookCategory, WebhookSetupOption[]> = {
	leads: [
		{
			value: "lead-rss-feed",
			label: "Lead RSS feed",
			description: "Publish lead changes as an RSS activity stream.",
			eventPrefix: "lead_feed",
			pathSegment: "rss",
		},
		{
			value: "lead-json-feed",
			label: "Lead JSON feed",
			description: "Expose lead activity as structured JSON for dashboards.",
			eventPrefix: "lead_feed",
			pathSegment: "json",
		},
		{
			value: "lead-activity-feed",
			label: "Lead activity feed",
			description: "Mirror lead updates into a real-time activity feed.",
			eventPrefix: "lead_activity",
			pathSegment: "activity",
		},
	],
	campaigns: [
		{
			value: "campaign-rss-feed",
			label: "Campaign RSS feed",
			description: "Publish campaign activity as an RSS stream.",
			eventPrefix: "campaign_feed",
			pathSegment: "rss",
		},
		{
			value: "campaign-json-feed",
			label: "Campaign JSON feed",
			description: "Expose campaign status updates as JSON.",
			eventPrefix: "campaign_feed",
			pathSegment: "json",
		},
		{
			value: "campaign-report-feed",
			label: "Campaign report feed",
			description: "Mirror campaign delivery and response data into feeds.",
			eventPrefix: "campaign_report",
			pathSegment: "report",
		},
	],
	skiptracing: [
		{
			value: "skiptrace-rss-feed",
			label: "Skip trace RSS feed",
			description: "Publish skip trace outcomes as RSS updates.",
			eventPrefix: "skiptrace_feed",
			pathSegment: "rss",
		},
		{
			value: "skiptrace-json-feed",
			label: "Skip trace JSON feed",
			description: "Expose enrichment status as structured JSON.",
			eventPrefix: "skiptrace_feed",
			pathSegment: "json",
		},
		{
			value: "skiptrace-report-feed",
			label: "Skip trace report feed",
			description: "Mirror completion and error events into feed reports.",
			eventPrefix: "skiptrace_report",
			pathSegment: "report",
		},
	],
};

const getDefaultSetupOption = (category: WebhookCategory) =>
	webhookSetupOptions[category][0];

const getDefaultFeedSetupOption = (category: WebhookCategory) =>
	webhookFeedOptions[category][0];

const leadHandlingLabels: Record<LeadHandlingMode, string> = {
	add: "Add new leads",
	sync: "Sync existing leads",
};

const stageDisplayLabels: Record<WebhookStage, string> = {
	incoming: "Incoming",
	outgoing: "Outgoing",
	feeds: "Feeds",
};

const getPricingLabel = (option: WebhookSetupOption) =>
	option.isFree
		? "Free"
		: `${option.cost ?? 0} credit${option.cost === 1 ? "" : "s"}`;

const getSkipTracePayloadTitle = (setupValue: string) => {
	if (setupValue === "skip-trace-bulk") return "Bulk skip trace request";
	if (setupValue === "skip-trace-verification")
		return "Skip trace verification request";
	return "Skip trace enrichment request";
};

const StageBanner = ({
	stage,
	category,
	setupLabel,
	feedLabel,
	leadHandling,
}: {
	stage: WebhookStage;
	category: WebhookCategory;
	setupLabel: string;
	feedLabel: string;
	leadHandling: LeadHandlingMode;
}) => {
	const contextText =
		stage === "incoming"
			? category === "leads"
				? leadHandling === "add"
					? `${setupLabel} is configured for lead generation requests.`
					: `${setupLabel} is configured for 1:1 lead syncs.`
				: `${setupLabel} is configured for incoming webhook events.`
			: stage === "outgoing"
				? category === "leads"
					? "Outgoing updates mirror lead changes and delivery responses."
					: "Outgoing updates mirror campaign delivery and workflow responses."
				: `${feedLabel} is configured as the feed view for this connection.`;

	return (
		<div className="mb-4 rounded-md border bg-muted/30 px-4 py-3">
			<div className="flex items-center justify-between gap-3">
				<div>
					<p className="font-medium text-foreground text-sm">
						{stageDisplayLabels[stage]} tab
					</p>
					<p className="text-muted-foreground text-xs">{contextText}</p>
				</div>
				<div className="rounded-full border border-border bg-background px-2.5 py-1 font-medium text-[11px] text-muted-foreground uppercase tracking-wide">
					{stageDisplayLabels[stage]}
				</div>
			</div>
		</div>
	);
};

const getWebhookHistory = (
	category: WebhookCategory,
	setup: WebhookSetupOption,
): WebhookHistoryByStage => {
	const baseId = setup.eventPrefix;

	return {
		incoming: [
			{
				id: `${category}-incoming-001`,
				event: `${baseId}.created`,
				date: "Jan 05, 2025 3:18 PM",
				status: "delivered",
				responseCode: 202,
				payload: {
					[`${baseId}_id`]: "inc-76352",
					email: `${baseId}.one@example.com`,
					first_name: "Alex",
					last_name: "Rivera",
					phone: "+15551230001",
					status: "new",
				},
			},
			{
				id: `${category}-incoming-002`,
				event: `${baseId}.status.updated`,
				date: "Jan 04, 2025 10:11 AM",
				status: "failed",
				responseCode: 500,
				payload: {
					[`${baseId}_id`]: "inc-76352",
					status: "contacted",
					previous_status: "new",
					triggered_by: "Zapier",
					attempt: 3,
				},
			},
		],
		outgoing: [
			{
				id: `${category}-outgoing-001`,
				event:
					category === "leads"
						? "lead.updated"
						: category === "campaigns"
							? "campaign.delivery.updated"
							: "skiptrace.completed",
				date: "Jan 06, 2025 9:42 AM",
				status: "delivered",
				responseCode: 200,
				payload: {
					[`${baseId}_id`]: "out-22991",
					recipient: "jordan@examplecrm.com",
					channel: "email",
					status: "updated",
					subject: "Follow-up: Demo availability",
					preview: "Lead status updated after external CRM sync.",
				},
			},
			{
				id: `${category}-outgoing-002`,
				event:
					category === "leads"
						? "lead.status.updated"
						: category === "campaigns"
							? "campaign.status.updated"
							: "skiptrace.status.updated",
				date: "Jan 03, 2025 7:06 PM",
				status: "pending",
				responseCode: 102,
				payload: {
					[`${baseId}_id`]: "out-99310",
					title: "Status update queued",
					due_date: "2025-01-07T15:00:00Z",
					assigned_to: "deal-team@crm.io",
					status: "pending",
				},
			},
		],
	};
};

const getWebhookFeedItems = (
	category: WebhookCategory,
	setup: WebhookSetupOption,
): FeedItemType[] => {
	const basePath =
		category === "leads"
			? "leads"
			: category === "campaigns"
				? "campaigns"
				: "skiptracing";
	const itemType = setup.label;

	return [
		{
			id: `feed-${category}-001`,
			title: `message.sent — ${itemType} Jane Doe`,
			publishedAt: "Wed, 08 Oct 2025 14:35:00 GMT",
			link: `https://app.dealscale.io/dashboard/${basePath}/${setup.pathSegment}/12345`,
			summary: `AI replied: "Hey Jane, confirming our walkthrough tomorrow at 3 PM."`,
			author: "DealScale Automations",
		},
		{
			id: `feed-${category}-002`,
			title: `${category}.status.updated — ${itemType} Liam Patel`,
			publishedAt: "Wed, 08 Oct 2025 14:20:00 GMT",
			link: `https://app.dealscale.io/dashboard/${basePath}/${setup.pathSegment}/56789`,
			summary: `${itemType} moved to Qualified after responding to SMS outreach.`,
			author: "DealScale Automations",
		},
	];
};

const Modal = ({
	isOpen,
	onClose,
	children,
}: {
	isOpen: boolean;
	onClose: () => void;
	children: React.ReactNode;
}) => {
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);
	if (!isOpen) return null;
	return (
		<div
			className="fixed inset-0 z-50 overflow-y-auto bg-background/80 backdrop-blur-sm"
			onKeyDown={(event) => {
				if (event.key === "Escape") {
					onClose();
				}
			}}
			role="presentation"
		>
			<div
				className="flex min-h-full w-full items-center justify-center p-4"
				onClick={(event) => {
					if (event.target === event.currentTarget) {
						onClose();
					}
				}}
				onKeyDown={(event) => {
					if (event.key === "Escape") {
						onClose();
					}
				}}
				tabIndex={-1}
				role="presentation"
			>
				<div className="relative w-full max-w-3xl">
					<div
						className="relative flex max-h-[calc(100vh-4rem)] flex-col overflow-hidden rounded-lg bg-card text-card-foreground shadow-lg"
						data-tour="connections-webhook-modal"
					>
						<button
							onClick={onClose}
							type="button"
							className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth="2"
								stroke="currentColor"
								className="h-6 w-6"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
						<div className="flex-1 overflow-y-auto p-6">{children}</div>
					</div>
				</div>
			</div>
		</div>
	);
};

// CRM integration configuration with YouTube video URLs
const CRM_INTEGRATIONS = [
	{
		id: "ghl",
		name: "Go High Level",
		videoUrl: "https://www.youtube.com/watch?v=example-ghl",
		title: "Integrate with Go High Level",
		subtitle:
			"Learn how to connect DealScale with Go High Level without resetup.",
	},
	{
		id: "lofty",
		name: "Lofty",
		videoUrl: "https://www.youtube.com/watch?v=example-lofty",
		title: "Integrate with Lofty",
		subtitle: "Learn how to connect DealScale with Lofty without resetup.",
	},
	{
		id: "salesforce",
		name: "Salesforce",
		videoUrl: "https://www.youtube.com/watch?v=example-salesforce",
		title: "Integrate with Salesforce",
		subtitle: "Learn how to connect DealScale with Salesforce without resetup.",
	},
	{
		id: "fub",
		name: "Follow Up Boss",
		videoUrl: "https://www.youtube.com/watch?v=example-fub",
		title: "Integrate with Follow Up Boss",
		subtitle:
			"Learn how to connect DealScale with Follow Up Boss without resetup.",
	},
] as const;

export const WebhookModal: React.FC = () => {
	const {
		isWebhookModalOpen,
		closeWebhookModal,
		webhookStage,
		webhookCategory,
		setWebhookStage,
		setWebhookCategory,
	} = useModalStore();

	const router = useRouter();

	const orgId = mockUserProfile?.companyInfo?.GHLID?.locationId ?? "org-demo";
	const compactOrgId = orgId.replace(/[^a-zA-Z0-9]/g, "");
	const [webhookSetup, setWebhookSetup] = useState(
		getDefaultSetupOption(webhookCategory).value,
	);
	const setupOptions = webhookSetupOptions[webhookCategory];
	const activeSetup =
		setupOptions.find((option) => option.value === webhookSetup) ??
		getDefaultSetupOption(webhookCategory);
	const isLeadRoutingFlow = webhookCategory === "leads";
	const [leadHandling, setLeadHandling] = useState<LeadHandlingMode>("add");
	const [feedSetup, setFeedSetup] = useState(
		getDefaultFeedSetupOption(webhookCategory).value,
	);
	const feedOptions = webhookFeedOptions[webhookCategory];
	const activeFeedSetup =
		feedOptions.find((option) => option.value === feedSetup) ??
		getDefaultFeedSetupOption(webhookCategory);
	const leadFlowSegment = isLeadRoutingFlow
		? `${activeSetup.pathSegment}/${leadHandling}`
		: activeSetup.pathSegment;

	const defaultIncomingEndpoint = `https://app.dealscale.io/api/webhooks/${orgId}/${webhookCategory}/${leadFlowSegment}/incoming`;
	const defaultOutgoingEndpoint =
		mockUserProfile?.companyInfo.webhook ??
		"https://crm.example.com/hooks/dealscale";
	const defaultFeedEndpoint = `https://app.dealscale.io/api/webhooks/${orgId}/${webhookCategory}/${leadFlowSegment}/${activeFeedSetup.pathSegment}/feeds/activity.xml`;

	const [incomingWebhookUrl, setIncomingWebhookUrl] = useState(
		defaultIncomingEndpoint,
	);
	const [outgoingWebhookUrl, setOutgoingWebhookUrl] = useState(
		defaultOutgoingEndpoint,
	);

	useEffect(() => {
		if (!setupOptions.some((option) => option.value === webhookSetup)) {
			setWebhookSetup(getDefaultSetupOption(webhookCategory).value);
		}
	}, [webhookCategory, setupOptions, webhookSetup]);

	useEffect(() => {
		if (!feedOptions.some((option) => option.value === feedSetup)) {
			setFeedSetup(getDefaultFeedSetupOption(webhookCategory).value);
		}
	}, [webhookCategory, feedOptions, feedSetup]);

	// Update URLs when category or setup changes
	useEffect(() => {
		setIncomingWebhookUrl(defaultIncomingEndpoint);
	}, [defaultIncomingEndpoint]);

	// State for CRM walkthrough modal
	const [showCrmWalkthrough, setShowCrmWalkthrough] = useState(false);
	const [crmWalkthroughUrl, setCrmWalkthroughUrl] = useState("");
	const [crmWalkthroughTitle, setCrmWalkthroughTitle] = useState("");
	const [crmWalkthroughSubtitle, setCrmWalkthroughSubtitle] = useState("");

	// Handle CRM integration button click
	const handleCrmIntegrationClick = (
		crm: (typeof CRM_INTEGRATIONS)[number],
	) => {
		setCrmWalkthroughUrl(crm.videoUrl);
		setCrmWalkthroughTitle(crm.title);
		setCrmWalkthroughSubtitle(crm.subtitle);
		setShowCrmWalkthrough(true);
	};

	// Close CRM walkthrough and ensure webhook modal remains open
	const handleCloseCrmWalkthrough = () => {
		setShowCrmWalkthrough(false);
		// Clear state after a brief delay to allow modal close animation
		setTimeout(() => {
			setCrmWalkthroughUrl("");
			setCrmWalkthroughTitle("");
			setCrmWalkthroughSubtitle("");
		}, 200);
	};

	// Prevent webhook modal from closing when CRM walkthrough is open
	const handleWebhookModalClose = () => {
		// If CRM walkthrough is open, close it first
		if (showCrmWalkthrough) {
			handleCloseCrmWalkthrough();
			return;
		}
		closeWebhookModal();
	};

	const getPayloadTemplates = (
		category: WebhookCategory,
		setup: WebhookSetupOption,
		feed: WebhookSetupOption,
		leadMode: LeadHandlingMode,
	): Record<WebhookStage, string> => {
		const baseEvent = setup.eventPrefix;
		const leadCategory =
			setup.eventPrefix === "cash_buyer"
				? "cash-buyers"
				: setup.eventPrefix === "motivated_seller"
					? "motivated-sellers"
					: "off-market-leads";
		const cashBuyerProfileBlock =
			leadCategory === "cash-buyers"
				? `
    "cashBuyerProfile": {
      "buyerPersonas": ["investor", "wholesaler"],
      "buyBox": {
        "zipCodes": ["78701", "78702"],
        "states": ["TX"],
        "cities": ["Austin", "Round Rock"],
        "counties": ["Travis"],
        "propertyTypes": ["single_family", "multi_family"],
        "occupancy": "vacant",
        "priceMin": 150000,
        "priceMax": 750000,
        "bedroomsMin": 3,
        "bathroomsMin": 2,
        "notes": "Targets cash buyers with zip code interest and light rehab preferences."
      },
      "budgetMin": 150000,
      "budgetMax": 750000,
      "strategies": ["buy-and-hold", "wholesale"]
    },`
				: "";
		const outgoingPayload =
			category === "leads"
				? `{
  "event": "lead.updated",
  "lead_type": "${setup.eventPrefix}",
  "lead_category": "${leadCategory}",
  "source": "dealscale",
  "lead": {
    "id": "lead_12345",
    "summary": "Lead published to an outgoing webhook.",
    "status": "New Lead",
    "leadCategory": "${leadCategory}",
    "socials": {
      "facebook": "https://facebook.com/johnsmith",
      "linkedin": "https://www.linkedin.com/in/johnsmith",
      "instagram": "https://instagram.com/johnsmith",
      "twitter": "https://x.com/johnsmith",
      "tiktok": "https://tiktok.com/@johnsmith",
      "youtube": "https://youtube.com/@johnsmith"
    },
    "socialHandle": "@johnsmith",
    "socialSummary": "Outgoing lead update delivered from DealScale.",
${cashBuyerProfileBlock}
    "contactInfo": {
      "firstName": "John",
      "lastName": "Smith",
      "email": "john.smith@example.com",
      "phone": "+15551234567",
      "knownPhone": "+15559876543",
      "address": "123 Main St, Austin, TX 78701",
      "domain": "example.com",
      "emailVerified": true,
      "socialVerified": false,
      "possiblePhones": "+15559876543",
      "possibleEmails": "john.alt@example.com"
    },
    "address1": {
      "fullStreetLine": "123 Main St",
      "city": "Austin",
      "state": "TX",
      "zipCode": "78701"
    },
    "campaignID": "cmp_12345",
    "leadSource": "Webhook Outgoing",
    "notes": "Lead update emitted to external webhook.",
    "tags": "webhook,outgoing,lead",
    "intentSignals": [],
    "intentScore": {
      "total": 72,
      "lastUpdated": "2025-10-08T14:32:00Z"
    },
    "lastIntentActivity": "2025-10-08T14:30:00Z"
  },
  "timestamp": "2025-10-08T14:35:00Z"
}`
				: category === "campaigns"
					? `{
  "event": "campaign.status.updated",
  "campaign_type": "${setup.eventPrefix}",
  "campaign_id": "cmp_12345",
  "source": "dealscale",
  "status": "sent",
  "channel": "${setup.value.replace(/-campaigns$/, "")}",
  "recipient": "jordan@examplecrm.com",
  "message": "Campaign delivery status updated after provider response.",
  "sent_at": "2025-10-08T14:35:00Z",
  "timestamp": "2025-10-08T14:35:00Z"
}`
					: `{
  "event": "skiptrace.completed",
  "skiptrace_type": "${setup.value}",
  "skiptrace_id": "st_12345",
  "source": "dealscale",
  "status": "completed",
  "matches_found": 4,
  "contact_summary": {
    "phone": "+15551234567",
    "email": "john.smith@example.com",
    "linkedin": "https://www.linkedin.com/in/johnsmith"
  },
  "timestamp": "2025-10-08T14:35:00Z"
}`;
		const leadIncomingPayload =
			category === "skiptracing"
				? `{
  "event": "skiptrace.requested",
  "skiptrace_type": "${setup.value}",
  "skiptrace_id": "st_12345",
  "source": "webhook",
  "criteria": {
    "lead_ids": ["lead_12345"],
    "zip_codes": ["78701", "78702"],
    "contact_checks": ["phone", "email", "linkedin"],
    "compliance_checks": ["dnc", "tcpa"]
  },
  "output": {
    "limit": ${setup.value === "skip-trace-bulk" ? 25 : 1},
    "list_name": "${setup.label}",
    "assignment_rule": "round_robin",
    "dedupe_existing": true
  },
  "timestamp": "2025-10-08T14:32:00Z"
}`
				: leadMode === "add"
					? setup.eventPrefix === "cash_buyer"
						? `{
  "event": "lead.generation.requested",
  "lead_type": "${setup.eventPrefix}",
  "lead_category": "${leadCategory}",
  "source": "webhook",
  "criteria": {
    "buyer_type": "cash",
    "buy_box": {
      "zip_codes": ["78701", "78702"],
      "states": ["TX", "FL", "GA"],
      "markets": ["Austin", "Dallas", "Houston"],
      "property_types": ["single_family", "multi_family"],
      "bedrooms_min": 3,
      "bathrooms_min": 2,
      "purchase_price_min": 150000,
      "purchase_price_max": 750000,
      "closing_timeline_days": 30,
      "notes": "Preferred for turn-key or light rehab properties"
    },
    "buyer_personas": ["investor", "wholesaler"]
  },
  "output": {
    "limit": 50,
    "list_name": "${setup.label}",
    "assignment_rule": "round_robin",
    "dedupe_existing": true
  },
  "timestamp": "2025-10-08T14:32:00Z"
}`
						: setup.eventPrefix === "motivated_seller"
							? `{
  "event": "lead.generation.requested",
  "lead_type": "${setup.eventPrefix}",
  "lead_category": "${leadCategory}",
  "source": "webhook",
  "criteria": {
    "seller_type": "on_market",
    "motivation_signals": {
      "days_on_market_min": 21,
      "price_reduction_recent": true,
      "stale_listing": true,
      "motivated_reason": ["divorce", "inheritance", "relocation", "vacancy"]
    },
    "markets": ["Austin", "Round Rock"],
    "mls_status": ["active", "pending"],
    "price_min": 200000,
    "price_max": 600000
  },
  "output": {
    "limit": 25,
    "list_name": "${setup.label}",
    "assignment_rule": "round_robin",
    "dedupe_existing": true
  },
  "timestamp": "2025-10-08T14:32:00Z"
}`
							: `{
  "event": "lead.generation.requested",
  "lead_type": "${setup.eventPrefix}",
  "lead_category": "${leadCategory}",
  "source": "webhook",
  "criteria": {
    "property_type": "single_family",
    "state": "TX",
    "county": "Travis",
    "zip_codes": ["78701", "78702"],
    "occupancy": "vacant",
    "equity_min": "30%",
    "price_max": 350000
  },
  "output": {
    "limit": 25,
    "list_name": "${setup.label}",
    "assignment_rule": "round_robin",
    "dedupe_existing": true
  },
  "timestamp": "2025-10-08T14:32:00Z"
}`
					: `{
  "event": "lead.sync.requested",
  "lead_type": "${setup.eventPrefix}",
  "lead_category": "${leadCategory}",
  "source": "webhook",
  "lead": {
    "id": "lead_12345",
    "contactInfo": {
      "firstName": "John",
      "lastName": "Smith",
      "email": "john.smith@example.com",
      "phone": "+15551234567",
      "knownPhone": "+15559876543",
      "address": "123 Main St, Austin, TX 78701",
      "domain": "example.com",
      "emailVerified": true,
      "socialVerified": false,
      "possiblePhones": "+15559876543",
      "possibleEmails": "john.alt@example.com"
    },
    "summary": "Existing lead synced from webhook.",
    "bed": 3,
    "bath": 2,
    "sqft": 1840,
    "status": "New Lead",
    "leadCategory": "${leadCategory}",
    "followUp": null,
    "lastUpdate": "2025-10-08T14:32:00Z",
    "address1": {
      "fullStreetLine": "123 Main St",
      "city": "Austin",
      "state": "TX",
      "zipCode": "78701"
    },
    "campaignID": "cmp_12345",
    "dealId": "",
    "socials": {
      "facebook": "https://facebook.com/johnsmith",
      "linkedin": "https://www.linkedin.com/in/johnsmith",
      "instagram": "https://instagram.com/johnsmith",
      "twitter": "https://x.com/johnsmith",
      "tiktok": "https://tiktok.com/@johnsmith",
      "youtube": "https://youtube.com/@johnsmith"
    },
    "socialHandle": "@johnsmith",
    "socialSummary": "Active buyer profile with LinkedIn and Facebook presence.",
${cashBuyerProfileBlock}
    "isIphone": false,
    "communicationPreferences": ["sms", "email", "call"],
    "dncList": false,
    "smsOptOut": false,
    "emailOptOut": false,
    "callOptOut": false,
    "dmOptOut": false,
    "tcpaOptedIn": true,
    "tcpaConsentDate": "2025-10-08T14:31:00Z",
    "tcpaSource": "Webhook Sync",
    "propertyValue": 325000,
    "yearBuilt": 1994,
    "leadSource": "Webhook Sync",
    "notes": "Existing lead updated from webhook sync.",
    "tags": "webhook,sync,linkedin",
    "priority": "High",
    "company": "Smith Holdings",
    "jobTitle": "Acquisitions Manager",
    "domain": "example.com",
    "birthday": "1986-07-18",
    "anniversary": "2012-06-14",
    "intentSignals": [],
    "intentScore": {
      "total": 72,
      "lastUpdated": "2025-10-08T14:32:00Z"
    },
    "lastIntentActivity": "2025-10-08T14:30:00Z"
  },
  "timestamp": "2025-10-08T14:32:00Z"
}`;
		return {
			incoming: leadIncomingPayload,
			outgoing: outgoingPayload,
			feeds: `<item>
  <title>${feed.label} — Jane Doe</title>
  <link>https://app.dealscale.io/dashboard/${category}/${leadFlowSegment}/${feed.pathSegment}/12345</link>
  <guid isPermaLink="false">wh-${compactOrgId}-${leadFlowSegment}-${feed.pathSegment}-message-sent-12345</guid>
  <pubDate>Wed, 08 Oct 2025 14:35:00 GMT</pubDate>
  <description><![CDATA[AI replied: "Hey John, is 3PM still a good time?"]]></description>
</item>`,
		};
	};

	const payloadTemplates = getPayloadTemplates(
		webhookCategory,
		activeSetup,
		activeFeedSetup,
		leadHandling,
	);

	const getSigningSecrets = (
		category: WebhookCategory,
	): Record<WebhookStage, string> => {
		const categoryPrefix = category.slice(0, 2);
		return {
			incoming: `whsec_${categoryPrefix}_${compactOrgId.slice(0, 10) || "incoming"}`,
			outgoing: `whout_${categoryPrefix}_${compactOrgId.slice(-10) || "outgoing"}`,
			feeds: `rss_${categoryPrefix}_${compactOrgId.slice(0, 5)}${compactOrgId.slice(-5)}`,
		};
	};

	const signingSecrets = getSigningSecrets(webhookCategory);

	const copyValue = async (value: string, successMessage: string) => {
		try {
			if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(value);
				toast(successMessage);
			} else {
				throw new Error("clipboard unavailable");
			}
		} catch (error) {
			toast.error("Unable to copy value. Please copy manually.");
		}
	};

	const copyPayloadFor = (stage: WebhookStage) =>
		copyValue(
			payloadTemplates[stage],
			stage === "incoming"
				? "Incoming sample payload copied to clipboard!"
				: stage === "outgoing"
					? "Outgoing sample payload copied to clipboard!"
					: "Feed item snippet copied to clipboard!",
		);

	const copySecretFor = (stage: WebhookStage) =>
		copyValue(
			signingSecrets[stage],
			stage === "feeds"
				? "Copied secure feed token to clipboard!"
				: `Copied ${stage} signing secret to clipboard!`,
		);

	const handleTestWebhook = () => {
		const message =
			webhookStage === "incoming"
				? webhookCategory === "leads"
					? leadHandling === "add"
						? "Lead generation request dispatched (mock)."
						: "Lead sync webhook test dispatched (mock)."
					: "Incoming test payload dispatched (mock)."
				: webhookStage === "outgoing"
					? "Outgoing webhook test dispatched (mock)."
					: "Activity feed ping generated (mock).";
		toast(message);
	};

	const handleSaveWebhook = () => {
		// Close modal first to avoid state updates during render
		closeWebhookModal();

		// Defer side-effects (toast + navigation) to the next tick
		setTimeout(() => {
			try {
				if (webhookStage === "incoming") {
					toast("Incoming webhook endpoint confirmed.");
				} else if (webhookStage === "outgoing") {
					const urlToPersist = outgoingWebhookUrl;
					toast(`Outgoing webhook saved for ${urlToPersist || "your CRM"}.`);
				} else {
					toast(
						"Feed preferences saved. Subscribers now receive real-time updates.",
					);
				}
			} finally {
				// After saving webhooks, go to Campaigns
				router.push("/dashboard/campaigns");
			}
		}, 0);
	};

	return (
		<>
			<Modal isOpen={isWebhookModalOpen} onClose={handleWebhookModalClose}>
				<>
					<div className="space-y-3" data-tour="connections-webhook-header">
						<h3 className="font-semibold text-foreground text-xl tracking-tight">
							Webhook &amp; Feed Integrations
						</h3>
						<p className="text-muted-foreground text-sm">
							Configure inbound CRM webhooks and outbound DealScale
							notifications from a single modal.
						</p>
					</div>

					{/* Webhook Type Selector */}
					<div
						className="mt-6 space-y-2"
						data-tour="connections-webhook-categories"
					>
						<div className="space-y-1">
							<h4 className="font-medium text-foreground text-sm">
								Choose webhook type
							</h4>
							<p className="text-muted-foreground text-xs">
								{categoryConfig[webhookCategory].description}
							</p>
						</div>
						<Select
							value={webhookCategory}
							onValueChange={(value) =>
								setWebhookCategory(value as WebhookCategory)
							}
						>
							<SelectTrigger className="h-10 w-full sm:max-w-sm">
								<SelectValue placeholder="Select webhook type" />
							</SelectTrigger>
							<SelectContent>
								{(
									["leads", "campaigns", "skiptracing"] as WebhookCategory[]
								).map((category) => (
									<SelectItem key={category} value={category}>
										{categoryConfig[category].label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="mt-4 space-y-2" data-tour="connections-webhook-setup">
						<div className="space-y-1">
							<h4 className="font-medium text-foreground text-sm">
								Configure {webhookStage} webhook for{" "}
								{categoryConfig[webhookCategory].label.toLowerCase()}
							</h4>
							<p className="text-muted-foreground text-xs">
								{activeSetup.description}
							</p>
						</div>
						<Select
							value={webhookSetup}
							onValueChange={(value) => setWebhookSetup(value)}
						>
							<SelectTrigger className="h-10 w-full sm:max-w-sm">
								<SelectValue placeholder="Select setup type" />
							</SelectTrigger>
							<SelectContent>
								{setupOptions.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
										{webhookCategory === "skiptracing"
											? ` • ${getPricingLabel(option)}`
											: ""}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{webhookCategory === "leads" ? (
						<div className="mt-4 space-y-3">
							<div className="space-y-1">
								<h4 className="font-medium text-foreground text-sm">
									Lead handling
								</h4>
								<p className="text-muted-foreground text-xs">
									Choose whether seller and buyer webhooks add new leads or sync
									existing ones.
								</p>
							</div>
							<div className="flex flex-wrap gap-2">
								{(["add", "sync"] as LeadHandlingMode[]).map((mode) => (
									<Button
										key={mode}
										type="button"
										variant={leadHandling === mode ? "default" : "outline"}
										size="sm"
										onClick={() => setLeadHandling(mode)}
										className="h-9"
									>
										{leadHandlingLabels[mode]}
									</Button>
								))}
							</div>
							<div className="grid gap-3 sm:grid-cols-2">
								<div
									className={`rounded-md border p-4 text-sm ${
										leadHandling === "add"
											? "border-primary/30 bg-primary/5"
											: "border-border bg-muted/30"
									}`}
								>
									<p className="font-medium text-foreground">
										{leadHandling === "add"
											? activeSetup.value === "cash-buyers"
												? "Generate cash buyers"
												: "Generate off-market leads"
											: "Sync leads"}
									</p>
									<p className="mt-1 text-muted-foreground text-xs">
										{leadHandling === "add"
											? activeSetup.value === "cash-buyers"
												? "Incoming webhook events generate new cash buyer leads from criteria and parameters."
												: activeSetup.value === "motivated-sellers"
													? "Incoming webhook events generate on-market motivated seller leads from listing and distress signals."
													: "Incoming webhook events generate new off-market leads from criteria and parameters."
											: "Incoming webhook events mirror the full existing lead object, including LinkedIn URL and all lead properties."}
									</p>
								</div>
								<div className="rounded-md border border-dashed bg-muted/20 p-4 text-sm">
									<p className="font-medium text-foreground">
										{leadHandling === "add" ? "Add path" : "Sync path"}
									</p>
									<p className="mt-1 text-muted-foreground text-xs">
										{leadHandling === "add"
											? activeSetup.value === "cash-buyers"
												? "Use this when inbound events should create fresh cash buyer leads from criteria."
												: activeSetup.value === "motivated-sellers"
													? "Use this when inbound events should create motivated seller leads from on-market signals."
													: "Use this when inbound events should create fresh off-market leads."
											: "Use this when inbound events should mirror the existing lead record 1:1 instead of adding new ones."}
									</p>
								</div>
							</div>
						</div>
					) : null}

					{/* CRM Integration Buttons Section */}
					<div
						className="mt-6 space-y-3 border-border border-b pb-4"
						data-tour="connections-crm-guides"
					>
						<div className="space-y-2">
							<h4 className="font-medium text-foreground text-sm">
								CRM Integration Guides
							</h4>
							<p className="text-muted-foreground text-xs">
								Watch video tutorials to integrate with your CRM without
								resetup.
							</p>
						</div>
						<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
							{CRM_INTEGRATIONS.map((crm) => (
								<Button
									key={crm.id}
									variant="outline"
									size="sm"
									onClick={() => handleCrmIntegrationClick(crm)}
									type="button"
									className="flex h-auto flex-col items-center gap-1 px-2 py-3"
								>
									<span className="font-medium text-xs">{crm.name}</span>
								</Button>
							))}
						</div>
					</div>

					<Tabs
						value={webhookStage}
						onValueChange={(value) => setWebhookStage(value as WebhookStage)}
						className="mt-6"
					>
						<StageBanner
							stage={webhookStage}
							category={webhookCategory}
							setupLabel={activeSetup.label}
							feedLabel={activeFeedSetup.label}
							leadHandling={leadHandling}
						/>
						<TabsList
							className="grid w-full grid-cols-3"
							data-tour="connections-webhook-stages"
						>
							<TabsTrigger
								value="incoming"
								className="data-[state=active]:bg-background data-[state=active]:text-foreground"
							>
								Incoming
							</TabsTrigger>
							<TabsTrigger
								value="outgoing"
								className="data-[state=active]:bg-background data-[state=active]:text-foreground"
							>
								Outgoing
							</TabsTrigger>
							<TabsTrigger
								value="feeds"
								className="data-[state=active]:bg-background data-[state=active]:text-foreground"
							>
								Feeds
							</TabsTrigger>
						</TabsList>

						{/* Incoming */}
						<TabsContent value="incoming" className="mt-6 space-y-4">
							<div className="rounded-md border bg-muted/20 p-4 text-sm">
								<p className="font-medium text-foreground">
									{webhookCategory === "leads"
										? leadHandling === "add"
											? activeSetup.value === "cash-buyers"
												? "Cash buyer generation webhook"
												: activeSetup.value === "motivated-sellers"
													? "Motivated seller generation webhook"
													: "Lead generation webhook"
											: "Lead sync webhook"
										: categoryConfig[webhookCategory].label}
								</p>
								<p className="mt-1 text-muted-foreground text-xs">
									{webhookCategory === "leads"
										? leadHandling === "add"
											? activeSetup.value === "cash-buyers"
												? "Creates new cash buyer leads from generation criteria and workflow parameters."
												: activeSetup.value === "motivated-sellers"
													? "Creates on-market motivated seller leads from listing and distress criteria."
													: "Creates new off-market leads from generation criteria and workflow parameters."
											: "Incoming webhook events mirror the full existing lead object, including LinkedIn URL and all lead properties."
										: "Captures webhook events for the selected category."}
								</p>
							</div>
							<div data-tour="connections-webhook-url">
								<WebhookUrlInput
									label="Incoming endpoint"
									description="Share this read-only endpoint with your CRM or form provider to push events into DealScale."
									webhookUrl={incomingWebhookUrl}
									setWebhookUrl={setIncomingWebhookUrl}
									placeholder={defaultIncomingEndpoint}
									readOnly
									showCopyButton
								/>
							</div>
							<div data-tour="connections-webhook-payload">
								<WebhookPayloadSection
									label={
										webhookCategory === "skiptracing"
											? getSkipTracePayloadTitle(activeSetup.value)
											: webhookCategory === "leads" && leadHandling === "add"
												? activeSetup.value === "cash-buyers"
													? "Cash buyer generation request"
													: activeSetup.value === "motivated-sellers"
														? "Motivated seller generation request"
														: "Lead generation request"
												: "Sample CRM payload"
									}
									description={
										webhookCategory === "skiptracing"
											? "Validate skip trace requests with lead IDs, ZIP targets, contact checks, and compliance checks before going live."
											: webhookCategory === "leads" && leadHandling === "add"
												? activeSetup.value === "cash-buyers"
													? "Validate that cash buyer requests include budgets, markets, and output settings before going live."
													: activeSetup.value === "motivated-sellers"
														? "Validate that motivated seller requests include market signals, MLS status, and output settings before going live."
														: "Validate that generation requests include filters, criteria, and output settings before going live."
												: "Validate that incoming requests mirror the full existing lead record, including LinkedIn URL and contact details."
									}
									webhookPayload={payloadTemplates.incoming}
									onCopy={() => void copyPayloadFor("incoming")}
								/>
							</div>
							<div className="mt-4 rounded-md border border-dashed bg-muted/40 p-4 text-sm">
								<div className="flex items-start justify-between gap-2">
									<div>
										<p className="font-medium text-foreground">
											Signing secret
										</p>
										<p className="text-muted-foreground text-xs">
											DealScale validates the <code>X-DealScale-Signature</code>{" "}
											header using this key.
										</p>
									</div>
									<Button
										variant="secondary"
										size="sm"
										onClick={() => void copySecretFor("incoming")}
										type="button"
									>
										Copy
									</Button>
								</div>
								<code className="mt-3 block truncate font-mono text-muted-foreground text-xs">
									{signingSecrets.incoming}
								</code>
							</div>
						</TabsContent>

						{/* Outgoing */}
						<TabsContent value="outgoing" className="mt-6 space-y-4">
							<div className="mt-4">
								<div className="mb-1 flex items-center gap-2">
									<label
										htmlFor="outgoingWebhookUrl"
										className="block font-medium text-sm"
									>
										Destination URL
									</label>
									<Pencil className="h-3.5 w-3.5 text-muted-foreground" />
								</div>
								<p className="mb-2 text-muted-foreground text-xs">
									DealScale will POST outbound events to this URL, complete with
									signatures and retry logic.
								</p>
								<Input
									id="outgoingWebhookUrl"
									type="url"
									placeholder={defaultOutgoingEndpoint}
									value={outgoingWebhookUrl}
									onChange={(event) =>
										setOutgoingWebhookUrl(event.target.value)
									}
									className="font-mono"
								/>
							</div>
							<WebhookPayloadSection
								label="Sample DealScale payload"
								description="Use this schema to map DealScale events to your CRM or automation platform."
								webhookPayload={payloadTemplates.outgoing}
								onCopy={() => void copyPayloadFor("outgoing")}
							/>
							<div className="mt-4 rounded-md border border-dashed bg-muted/40 p-4 text-sm">
								<div className="flex items-start justify-between gap-2">
									<div>
										<p className="font-medium text-foreground">
											Signing secret
										</p>
										<p className="text-muted-foreground text-xs">
											Share this key with your CRM to verify outbound requests
											and power optional RSS-style activity feeds.
										</p>
									</div>
									<Button
										variant="secondary"
										size="sm"
										onClick={() => void copySecretFor("outgoing")}
										type="button"
									>
										Copy
									</Button>
								</div>
								<code className="mt-3 block truncate font-mono text-muted-foreground text-xs">
									{signingSecrets.outgoing}
								</code>
							</div>
							<p className="mt-3 text-muted-foreground text-xs">
								Tip: enable the RSS management toggle inside Integrations →
								Webhooks to broadcast the same events as a secure feed for
								downstream analytics.
							</p>
						</TabsContent>

						{/* Feeds */}
						<TabsContent value="feeds" className="mt-6 space-y-4">
							<div
								className="space-y-2"
								data-tour="connections-webhook-feed-setup"
							>
								<div className="space-y-1">
									<h4 className="font-medium text-foreground text-sm">
										Choose feed setup
									</h4>
									<p className="text-muted-foreground text-xs">
										{activeFeedSetup.description}
									</p>
								</div>
								<Select
									value={feedSetup}
									onValueChange={(value) => setFeedSetup(value)}
								>
									<SelectTrigger className="h-10 w-full sm:max-w-sm">
										<SelectValue placeholder="Select feed type" />
									</SelectTrigger>
									<SelectContent>
										{feedOptions.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<WebhookUrlInput
								label="Activity feed URL"
								description="Share this read-only endpoint with stakeholders or BI tools to subscribe to webhook events as RSS/XML."
								webhookUrl={defaultFeedEndpoint}
								readOnly
								setWebhookUrl={() => undefined}
								showCopyButton
							/>
							<WebhookPayloadSection
								label="Sample feed item"
								description="Every webhook delivery generates an RSS entry with the payload summary, signature, and destination response."
								webhookPayload={payloadTemplates.feeds}
								onCopy={() => void copyPayloadFor("feeds")}
							/>
							<WebhookFeedPreview
								feedItems={getWebhookFeedItems(
									webhookCategory,
									activeFeedSetup,
								)}
								stage={webhookStage}
							/>
							<div className="mt-4 rounded-md border border-dashed bg-muted/40 p-4 text-sm">
								<div className="flex items-start justify-between gap-2">
									<div>
										<p className="font-medium text-foreground">Feed token</p>
										<p className="text-muted-foreground text-xs">
											Use this token to authenticate RSS requests or append it
											as <code className="mx-1">?token=</code> in the feed URL.
										</p>
									</div>
									<Button
										variant="secondary"
										size="sm"
										onClick={() => void copySecretFor("feeds")}
										type="button"
									>
										Copy
									</Button>
								</div>
								<code className="mt-3 block truncate font-mono text-muted-foreground text-xs">
									{signingSecrets.feeds}
								</code>
							</div>
							<p className="mt-3 text-muted-foreground text-xs">
								Followers can consume the RSS stream or use the token to request
								a JSON feed for embedded dashboards.
							</p>
						</TabsContent>
					</Tabs>

					<div data-tour="connections-webhook-history">
						<WebhookHistory
							activeStage={webhookStage}
							historyByStage={getWebhookHistory(webhookCategory, activeSetup)}
						/>
					</div>

					<div data-tour="connections-webhook-actions">
						<WebhookModalActions
							onCancel={handleWebhookModalClose}
							onTest={handleTestWebhook}
							onSave={handleSaveWebhook}
						/>
					</div>
				</>
			</Modal>

			{/* CRM Walkthrough Modal - Stacked on top */}
			<WalkThroughModal
				isOpen={showCrmWalkthrough && isWebhookModalOpen}
				onClose={handleCloseCrmWalkthrough}
				videoUrl={crmWalkthroughUrl}
				title={crmWalkthroughTitle}
				subtitle={crmWalkthroughSubtitle}
			/>
		</>
	);
};
