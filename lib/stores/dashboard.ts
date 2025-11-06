// stores/useModalStore.ts

import { createWithEqualityFn } from "zustand/traditional";
import { withAnalytics } from "./_middleware/analytics";

export type WebhookStage = "incoming" | "outgoing" | "feeds";
export type WebhookCategory = "leads" | "campaigns" | "skiptracing";

interface ModalState {
	isUsageModalOpen: boolean;
	openUsageModal: () => void;
	closeUsageModal: () => void;

	isBillingModalOpen: boolean;
	openBillingModal: () => void;
	closeBillingModal: () => void;

	isIntegrationsModalOpen: boolean;
	openIntegrationsModal: () => void;
	closeIntegrationsModal: () => void;

	isSecurityModalOpen: boolean;
	openSecurityModal: () => void;
	closeSecurityModal: () => void;

	isWebhookModalOpen: boolean;
	webhookStage: WebhookStage;
	webhookCategory: WebhookCategory;
	openWebhookModal: (stage?: WebhookStage, category?: WebhookCategory) => void;
	setWebhookStage: (stage: WebhookStage) => void;
	setWebhookCategory: (category: WebhookCategory) => void;
	closeWebhookModal: () => void;

	isUpgradeModalOpen: boolean;
	openUpgradeModal: () => void;
	closeUpgradeModal: () => void;

	isEmployeeModalOpen: boolean;
	openEmployeeModal: () => void;
	closeEmployeeModal: () => void;
}

export const useModalStore = createWithEqualityFn<ModalState>(
	withAnalytics<ModalState>("dashboard_modals", (set) => ({
		// Usage Modal
		isUsageModalOpen: false,
		openUsageModal: () => set({ isUsageModalOpen: true }),
		closeUsageModal: () => set({ isUsageModalOpen: false }),
		isSecurityModalOpen: false,
		openSecurityModal: () => set({ isSecurityModalOpen: true }),
		closeSecurityModal: () => set({ isSecurityModalOpen: false }),
		// Billing Modal
		isBillingModalOpen: false,
		openBillingModal: () => set({ isBillingModalOpen: true }),
		closeBillingModal: () => set({ isBillingModalOpen: false }),

		// Integrations Modal
		isIntegrationsModalOpen: false,
		openIntegrationsModal: () => set({ isIntegrationsModalOpen: true }),
		closeIntegrationsModal: () => set({ isIntegrationsModalOpen: false }),

		// Webhook Modal - Correctly tied to isWebhookModalOpen state
		isWebhookModalOpen: false,
		webhookStage: "incoming",
		webhookCategory: "leads",
		openWebhookModal: (stage = "incoming", category = "leads") =>
			set({
				isWebhookModalOpen: true,
				webhookStage: stage,
				webhookCategory: category,
			}),
		setWebhookStage: (stage) => set({ webhookStage: stage }),
		setWebhookCategory: (category) => set({ webhookCategory: category }),
		closeWebhookModal: () => set({ isWebhookModalOpen: false }),

		isUpgradeModalOpen: false,
		openUpgradeModal: () => set({ isUpgradeModalOpen: true }),
		closeUpgradeModal: () => set({ isUpgradeModalOpen: false }),

		isEmployeeModalOpen: false,
		openEmployeeModal: () => set({ isEmployeeModalOpen: true }),
		closeEmployeeModal: () => set({ isEmployeeModalOpen: false }),
	})),
	Object.is,
);

// stores/useSecurityStore.ts
interface SecurityState {
	showCurrentPassword: boolean;
	showNewPassword: boolean;
	showConfirmPassword: boolean;
	currentPassword: string;
	newPassword: string;
	confirmPassword: string;
	toggleShowCurrentPassword: () => void;
	toggleShowNewPassword: () => void;
	toggleShowConfirmPassword: () => void;
	setCurrentPassword: (value: string) => void;
	setNewPassword: (value: string) => void;
	setConfirmPassword: (value: string) => void;
}

export const useSecurityStore = createWithEqualityFn<SecurityState>(
	withAnalytics<SecurityState>("dashboard_security", (set) => ({
		showCurrentPassword: false,
		showNewPassword: false,
		showConfirmPassword: false,
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
		toggleShowCurrentPassword: () =>
			set((state) => ({ showCurrentPassword: !state.showCurrentPassword })),
		toggleShowNewPassword: () =>
			set((state) => ({ showNewPassword: !state.showNewPassword })),
		toggleShowConfirmPassword: () =>
			set((state) => ({ showConfirmPassword: !state.showConfirmPassword })),
		setCurrentPassword: (value: string) => set({ currentPassword: value }),
		setNewPassword: (value: string) => set({ newPassword: value }),
		setConfirmPassword: (value: string) => set({ confirmPassword: value }),
	})),
	Object.is,
);
