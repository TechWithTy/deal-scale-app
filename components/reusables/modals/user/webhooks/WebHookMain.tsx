"use client";

import { mockUserProfile } from "@/constants/_faker/profile/userProfile";
import { useModalStore } from "@/lib/stores/dashboard";
import type React from "react";
import { useEffect, useState } from "react";
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
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
			<div className="relative w-full max-w-3xl rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
				<button
					onClick={onClose}
					type="button"
					className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
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
	const { isWebhookModalOpen, closeWebhookModal } = useModalStore();
	const [webhookUrl, setWebhookUrl] = useState(
		mockUserProfile.companyInfo.webhook,
	);
	const [webhookPayload] = useState(`{
  "phone": "0000000000",
  "email": "test@example.com",
  "social_media": {
    "facebook": "https://facebook.com/example",
    "linkedin": "https://linkedin.com/in/example",
    "instagram": "https://instagram.com/example",
    "twitter": "https://twitter.com/example"
  },
  "address": {
    "zip": "00000",
    "city": "Test City",
    "state": "Test State",
    "street": "Test Street"
  },
  "summary": "Summary from AI Bot",
  "list_name": "List Name",
  "name_full": "Full Name",
  "name_last": "Last Name",
  "name_first": "First Name",
  "webhook_type": "lead_created"
}`);

	const copyToClipboard = () => {
		navigator.clipboard.writeText(webhookPayload);
		toast("Payload copied to clipboard!");
	};

	const handleTestWebhook = () => {
		// todo: Implement webhook test logic
		toast("Test webhook sent! (not implemented)");
	};

	const handleSaveWebhook = () => {
		// todo: Save webhook URL logic
		toast("Webhook URL saved! (not implemented)");
		closeWebhookModal();
	};

	return (
		<Modal isOpen={isWebhookModalOpen} onClose={closeWebhookModal}>
			<div className="mt-4">
				<h3 className="font-medium text-lg dark:text-gray-200">Webhook</h3>
				<p className="text-muted-foreground text-sm dark:text-gray-400">
					Call a webhook when you get a new lead.
				</p>
				<WebhookUrlInput
					webhookUrl={webhookUrl}
					setWebhookUrl={setWebhookUrl}
					placeholder={mockUserProfile.companyInfo.webhook ?? ""}
					className="dark:bg-gray-800 dark:text-gray-200"
				/>
				<WebhookPayloadSection
					webhookPayload={webhookPayload}
					onCopy={copyToClipboard}
				/>
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
