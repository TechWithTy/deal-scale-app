"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockUserProfile } from "@/constants/_faker/profile/userProfile";
import { useModalStore, type WebhookStage } from "@/lib/stores/dashboard";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import WebhookHistory from "./WebhookHistory";
import type { WebhookEntryType } from "./WebhookHistory";
import WebhookModalActions from "./WebhookModalActions";
import WebhookPayloadSection from "./WebhookPayloadSection";
import WebhookUrlInput from "./WebhookUrlInput";
const webhookHistory: WebhookEntryType[] = [
	{
		date: "2023-09-12",
		payload: {
			phone: "0000000000",
			email: "test@example.com",
			social_media: {
				facebook: "https://facebook.com/example",
				linkedin: "https://linkedin.com/in/example",
				instagram: "https://instagram.com/example",
				twitter: "https://twitter.com/example",
			},
			address: {
				zip: "00000",
				city: "Test City",
				state: "Test State",
				street: "Test Street",
			},
			summary: "Summary from AI Bot",
			list_name: "List Name",
			name_full: "Full Name",
			name_last: "Last Name",
			name_first: "First Name",
			webhook_type: "lead_created",
		},
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
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
			<div className="relative w-full max-w-3xl rounded-lg bg-card p-6 text-card-foreground shadow-lg">
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
				{children}
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
		if (webhookStage === "incoming") {
			toast("Incoming webhook endpoint confirmed.");
			closeWebhookModal();
			return;
		}

		if (webhookStage === "outgoing") {
			const urlToPersist = outgoingWebhookUrl;
			toast(`Outgoing webhook saved for ${urlToPersist || "your CRM"}.`);
			closeWebhookModal();
			return;
		}

		toast("Feed preferences saved. Subscribers now receive real-time updates.");
		closeWebhookModal();
	};

	return (
		<Modal isOpen={isWebhookModalOpen} onClose={closeWebhookModal}>
			<div className="mt-4 space-y-4">
				<div>
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
										DealScale validates the <code>X-DealScale-Signature</code>
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
						<div className="mt-4 rounded-md border border-dashed bg-muted/40 p-4 text-sm">
							<div className="flex items-start justify-between gap-2">
								<div>
									<p className="font-medium text-foreground">Feed token</p>
									<p className="text-xs text-muted-foreground">
										Use this token to authenticate RSS requests or append it as
										<code className="mx-1">?token=</code>
										in the feed URL.
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
			</div>
			<WebhookHistory webhookHistory={webhookHistory} />
			<WebhookModalActions
				onCancel={closeWebhookModal}
				onTest={handleTestWebhook}
				onSave={handleSaveWebhook}
			/>
		</Modal>
	);
};
