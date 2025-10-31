"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockUserProfile } from "@/constants/_faker/profile/userProfile";
import { useModalStore, type WebhookStage } from "@/lib/stores/dashboard";
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

const webhookHistoryByStage: WebhookHistoryByStage = {
	incoming: [
		{
			id: "incoming-001",
			event: "lead.created",
			date: "Jan 05, 2025 3:18 PM",
			status: "delivered",
			responseCode: 202,
			payload: {
				lead_id: "inc-76352",
				email: "lead.one@example.com",
				first_name: "Alex",
				last_name: "Rivera",
				phone: "+15551230001",
				status: "new",
			},
		},
		{
			id: "incoming-002",
			event: "lead.status.updated",
			date: "Jan 04, 2025 10:11 AM",
			status: "failed",
			responseCode: 500,
			payload: {
				lead_id: "inc-76352",
				status: "contacted",
				previous_status: "new",
				triggered_by: "Zapier",
				attempt: 3,
			},
		},
	],
	outgoing: [
		{
			id: "outgoing-001",
			event: "message.sent",
			date: "Jan 06, 2025 9:42 AM",
			status: "delivered",
			responseCode: 200,
			payload: {
				lead_id: "out-22991",
				recipient: "jordan@examplecrm.com",
				channel: "email",
				subject: "Follow-up: Demo availability",
				preview: "Just confirming our time later today.",
			},
		},
		{
			id: "outgoing-002",
			event: "task.created",
			date: "Jan 03, 2025 7:06 PM",
			status: "pending",
			responseCode: 102,
			payload: {
				lead_id: "out-99310",
				title: "Schedule walkthrough call",
				due_date: "2025-01-07T15:00:00Z",
				assigned_to: "deal-team@crm.io",
			},
		},
	],
};

const webhookFeedItems: FeedItemType[] = [
	{
		id: "feed-001",
		title: "message.sent — Jane Doe",
		publishedAt: "Wed, 08 Oct 2025 14:35:00 GMT",
		link: "https://app.dealscale.io/dashboard/chat/12345",
		summary:
			'AI replied: "Hey Jane, confirming our walkthrough tomorrow at 3 PM."',
		author: "DealScale Automations",
	},
	{
		id: "feed-002",
		title: "lead.status.updated — Liam Patel",
		publishedAt: "Wed, 08 Oct 2025 14:20:00 GMT",
		link: "https://app.dealscale.io/dashboard/leads/56789",
		summary: "Lead moved to Qualified after responding to SMS outreach.",
		author: "DealScale Automations",
	},
];

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
		<div className="fixed inset-0 z-50 overflow-y-auto bg-background/80 backdrop-blur-sm">
			<div className="flex min-h-full w-full items-center justify-center p-4">
				<div className="relative w-full max-w-3xl">
					<div className="relative flex max-h-[calc(100vh-4rem)] flex-col overflow-hidden rounded-lg bg-card text-card-foreground shadow-lg">
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

export const WebhookModal: React.FC = () => {
	const {
		isWebhookModalOpen,
		closeWebhookModal,
		webhookStage,
		setWebhookStage,
	} = useModalStore();

	const router = useRouter();

	const orgId = mockUserProfile?.companyInfo?.GHLID?.locationId ?? "org-demo";
	const compactOrgId = orgId.replace(/[^a-zA-Z0-9]/g, "");
	const defaultIncomingEndpoint = `https://app.dealscale.io/api/webhooks/${orgId}/incoming`;
	const defaultOutgoingEndpoint =
		mockUserProfile?.companyInfo.webhook ??
		"https://crm.example.com/hooks/dealscale";
	const defaultFeedEndpoint = `https://app.dealscale.io/api/webhooks/${orgId}/feeds/activity.xml`;

	const [incomingWebhookUrl, setIncomingWebhookUrl] = useState(
		defaultIncomingEndpoint,
	);
	const [outgoingWebhookUrl, setOutgoingWebhookUrl] = useState(
		defaultOutgoingEndpoint,
	);

	const payloadTemplates: Record<WebhookStage, string> = {
		incoming: `{
  "event": "lead.status.updated",
  "lead_id": "12345",
  "status": "Interested",
  "first_name": "John",
  "phone": "+15551234567",
  "timestamp": "2025-10-08T14:32:00Z"
}`,
		outgoing: `{
  "event": "message.sent",
  "lead_id": "12345",
  "sender": "AI",
  "message": "Hey John, is 3PM still a good time?",
  "timestamp": "2025-10-08T14:35:00Z"
}`,
		feeds: `<item>
  <title>message.sent — Jane Doe</title>
  <link>https://app.dealscale.io/dashboard/chat/12345</link>
  <guid isPermaLink="false">wh-${compactOrgId}-message-sent-12345</guid>
  <pubDate>Wed, 08 Oct 2025 14:35:00 GMT</pubDate>
  <description><![CDATA[AI replied: "Hey John, is 3PM still a good time?"]]></description>
</item>`,
	};

	const signingSecrets: Record<WebhookStage, string> = {
		incoming: `whsec_${compactOrgId.slice(0, 12) || "incoming"}`,
		outgoing: `whout_${compactOrgId.slice(-12) || "outgoing"}`,
		feeds: `rss_${compactOrgId.slice(0, 6)}${compactOrgId.slice(-6)}`,
	};

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
				? "Incoming test payload dispatched (mock)."
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
				// Navigate after toasts are queued to avoid synchronous updates
				router.push("/dashboard/lead-list");
			}
		}, 0);
	};

	return (
		<Modal isOpen={isWebhookModalOpen} onClose={closeWebhookModal}>
			<>
				<div className="mt-4 space-y-4">
					<h3 className="text-lg font-medium text-foreground">
						Webhook &amp; Feed Integrations
					</h3>
					<p className="text-sm text-muted-foreground">
						Configure inbound CRM webhooks and outbound DealScale notifications
						from a single modal.
					</p>
				</div>

				<Tabs
					value={webhookStage}
					onValueChange={(value) => setWebhookStage(value as WebhookStage)}
				>
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="incoming">Incoming</TabsTrigger>
						<TabsTrigger value="outgoing">Outgoing</TabsTrigger>
						<TabsTrigger value="feeds">Feeds</TabsTrigger>
					</TabsList>

					{/* Incoming */}
					<TabsContent value="incoming">
						<WebhookUrlInput
							label="Incoming endpoint"
							description="Share this read-only endpoint with your CRM or form provider to push events into DealScale."
							webhookUrl={incomingWebhookUrl}
							setWebhookUrl={setIncomingWebhookUrl}
							placeholder={defaultIncomingEndpoint}
							readOnly
						/>
						<WebhookPayloadSection
							label="Sample CRM payload"
							description="Validate that incoming requests include the required fields before going live."
							webhookPayload={payloadTemplates.incoming}
							onCopy={() => void copyPayloadFor("incoming")}
						/>
						<div className="mt-4 rounded-md border border-dashed bg-muted/40 p-4 text-sm">
							<div className="flex items-start justify-between gap-2">
								<div>
									<p className="font-medium text-foreground">Signing secret</p>
									<p className="text-xs text-muted-foreground">
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
							<code className="mt-3 block truncate font-mono text-xs text-muted-foreground">
								{signingSecrets.incoming}
							</code>
						</div>
					</TabsContent>

					{/* Outgoing */}
					<TabsContent value="outgoing">
						<WebhookUrlInput
							label="Destination URL"
							description="DealScale will POST outbound events to this URL, complete with signatures and retry logic."
							webhookUrl={outgoingWebhookUrl}
							setWebhookUrl={setOutgoingWebhookUrl}
							placeholder={defaultOutgoingEndpoint}
						/>
						<WebhookPayloadSection
							label="Sample DealScale payload"
							description="Use this schema to map DealScale events to your CRM or automation platform."
							webhookPayload={payloadTemplates.outgoing}
							onCopy={() => void copyPayloadFor("outgoing")}
						/>
						<div className="mt-4 rounded-md border border-dashed bg-muted/40 p-4 text-sm">
							<div className="flex items-start justify-between gap-2">
								<div>
									<p className="font-medium text-foreground">Signing secret</p>
									<p className="text-xs text-muted-foreground">
										Share this key with your CRM to verify outbound requests and
										power optional RSS-style activity feeds.
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
							<code className="mt-3 block truncate font-mono text-xs text-muted-foreground">
								{signingSecrets.outgoing}
							</code>
						</div>
						<p className="mt-3 text-xs text-muted-foreground">
							Tip: enable the RSS management toggle inside Integrations →
							Webhooks to broadcast the same events as a secure feed for
							downstream analytics.
						</p>
					</TabsContent>

					{/* Feeds */}
					<TabsContent value="feeds">
						<WebhookUrlInput
							label="Activity feed URL"
							description="Share this read-only endpoint with stakeholders or BI tools to subscribe to webhook events as RSS/XML."
							webhookUrl={defaultFeedEndpoint}
							readOnly
							setWebhookUrl={() => undefined}
						/>
						<WebhookPayloadSection
							label="Sample feed item"
							description="Every webhook delivery generates an RSS entry with the payload summary, signature, and destination response."
							webhookPayload={payloadTemplates.feeds}
							onCopy={() => void copyPayloadFor("feeds")}
						/>
						<WebhookFeedPreview feedItems={webhookFeedItems} />
						<div className="mt-4 rounded-md border border-dashed bg-muted/40 p-4 text-sm">
							<div className="flex items-start justify-between gap-2">
								<div>
									<p className="font-medium text-foreground">Feed token</p>
									<p className="text-xs text-muted-foreground">
										Use this token to authenticate RSS requests or append it as{" "}
										<code className="mx-1">?token=</code> in the feed URL.
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
							<code className="mt-3 block truncate font-mono text-xs text-muted-foreground">
								{signingSecrets.feeds}
							</code>
						</div>
						<p className="mt-3 text-xs text-muted-foreground">
							Followers can consume the RSS stream or use the token to request a
							JSON feed for embedded dashboards.
						</p>
					</TabsContent>
				</Tabs>

				<WebhookHistory
					activeStage={webhookStage}
					historyByStage={webhookHistoryByStage}
				/>

				<WebhookModalActions
					onCancel={closeWebhookModal}
					onTest={handleTestWebhook}
					onSave={handleSaveWebhook}
				/>
			</>
		</Modal>
	);
};
