/**
 * Headless Flow Actions
 *
 * Provides automated execution of Quick Start flow steps using mock data.
 * These handlers complete actions in the background without requiring user interaction.
 *
 * Purpose:
 * - Enable demo/testing without real data
 * - Rapid onboarding experience
 * - Preview full workflow capabilities
 * - No modal interactions required
 *
 * All functions:
 * - Create realistic mock data
 * - Add to actual application stores
 * - Show toast notifications for feedback
 * - Return IDs for tracking/linking resources
 *
 * Future: Can be extended to support real API calls when toggled.
 */

import { toast } from "sonner";
import type {
	QuickStartGoalId,
	QuickStartPersonaId,
} from "@/lib/config/quickstart/wizardFlows";

/**
 * Mock data interfaces for headless automation.
 * These mirror real data structures but contain demo values.
 */

interface MockLeadList {
	id: string;
	listName: string;
	records: number;
	source: string;
	createdAt: string;
}

interface MockCampaign {
	id: string;
	name: string;
	primaryChannel: string;
	leadListId: string;
	status: string;
	createdAt: string;
}

interface MockWebhook {
	id: string;
	name: string;
	url: string;
	stage: string;
	status: string;
	createdAt: string;
}

/**
 * Creates a mock lead list for headless import automation.
 */
export const createMockLeadList = async (
	goalId: QuickStartGoalId,
	personaId: QuickStartPersonaId,
): Promise<MockLeadList> => {
	console.log("[HeadlessFlow] Creating mock lead list", { goalId, personaId });

	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 800));

	const listNames: Record<QuickStartPersonaId, string> = {
		investor: "Motivated Sellers - Demo List",
		wholesaler: "Buyer Network - Demo List",
		agent: "Sphere of Influence - Demo List",
		lender: "Borrower Pipeline - Demo List",
	};

	const mockList: MockLeadList = {
		id: `mock_list_${Date.now()}`,
		listName: listNames[personaId] || "Demo Lead List",
		records: 150,
		source: "quick-start-automation",
		createdAt: new Date().toISOString(),
	};

	console.log("[HeadlessFlow] Mock lead list created:", mockList);

	return mockList;
};

/**
 * Creates a mock campaign for headless campaign automation.
 */
export const createMockCampaign = async (
	goalId: QuickStartGoalId,
	personaId: QuickStartPersonaId,
	leadListId: string,
): Promise<MockCampaign> => {
	console.log("[HeadlessFlow] Creating mock campaign", {
		goalId,
		personaId,
		leadListId,
	});

	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 1000));

	const campaignNames: Record<QuickStartGoalId, string> = {
		"investor-pipeline": "Seller Outreach Campaign",
		"investor-market": "Market Research Campaign",
		"wholesaler-dispositions": "Buyer Distribution Campaign",
		"wholesaler-acquisitions": "Seller Acquisition Campaign",
		"agent-sphere": "Sphere Nurture Campaign",
		"agent-expansion": "Lead Capture Campaign",
		"lender-fund-fast": "Borrower Funding Campaign",
	};

	const channels: Record<QuickStartPersonaId, string> = {
		investor: "call",
		wholesaler: "text",
		agent: "email",
		lender: "call",
	};

	const mockCampaign: MockCampaign = {
		id: `mock_campaign_${Date.now()}`,
		name: campaignNames[goalId] || "Demo Campaign",
		primaryChannel: channels[personaId] || "call",
		leadListId,
		status: "draft",
		createdAt: new Date().toISOString(),
	};

	console.log("[HeadlessFlow] Mock campaign created:", mockCampaign);

	return mockCampaign;
};

/**
 * Creates a mock webhook for headless integration automation.
 */
export const createMockWebhook = async (
	goalId: QuickStartGoalId,
): Promise<MockWebhook> => {
	console.log("[HeadlessFlow] Creating mock webhook", { goalId });

	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 600));

	const mockWebhook: MockWebhook = {
		id: `mock_webhook_${Date.now()}`,
		name: "CRM Integration - Demo",
		url: "https://api.example.com/webhook/demo",
		stage: "active",
		status: "connected",
		createdAt: new Date().toISOString(),
	};

	console.log("[HeadlessFlow] Mock webhook created:", mockWebhook);

	return mockWebhook;
};

/**
 * Headless import action - creates mock lead list in background.
 */
export const headlessImportAction = async (
	goalId: QuickStartGoalId,
	personaId: QuickStartPersonaId,
	leadListStore: any,
): Promise<string> => {
	toast.info("Creating demo lead list...", {
		description: "Setting up your first leads automatically",
	});

	const mockList = await createMockLeadList(goalId, personaId);

	// Add to lead list store
	leadListStore.addLeadList({
		id: mockList.id,
		listName: mockList.listName,
		records: mockList.records,
		leads: [], // Empty for demo
		createdAt: mockList.createdAt,
		source: mockList.source,
	});

	toast.success(`Lead list created: ${mockList.listName}`, {
		description: `${mockList.records} demo leads ready`,
	});

	return mockList.id;
};

/**
 * Headless campaign action - creates mock campaign in background.
 */
export const headlessCampaignAction = async (
	goalId: QuickStartGoalId,
	personaId: QuickStartPersonaId,
	leadListId: string,
	campaignStore: any,
): Promise<string> => {
	toast.info("Creating demo campaign...", {
		description: "Setting up automated outreach",
	});

	const mockCampaign = await createMockCampaign(goalId, personaId, leadListId);

	// Update campaign store with mock data
	campaignStore.setCampaignName(mockCampaign.name);
	campaignStore.setPrimaryChannel(mockCampaign.primaryChannel);
	campaignStore.setSelectedLeadListId(leadListId);
	campaignStore.setAreaMode("leadList");

	toast.success(`Campaign created: ${mockCampaign.name}`, {
		description: `Ready to launch with ${mockCampaign.primaryChannel} outreach`,
	});

	return mockCampaign.id;
};

/**
 * Headless webhook action - creates mock webhook in background.
 */
export const headlessWebhookAction = async (
	goalId: QuickStartGoalId,
): Promise<string> => {
	toast.info("Connecting CRM integration...", {
		description: "Setting up automated data sync",
	});

	const mockWebhook = await createMockWebhook(goalId);

	toast.success("CRM integration connected", {
		description: "Demo webhook ready for testing",
	});

	return mockWebhook.id;
};

/**
 * Headless market search action - simulates opening market discovery.
 */
export const headlessMarketSearchAction = async (): Promise<void> => {
	toast.info("Initializing market search...", {
		description: "Loading market discovery tools",
	});

	await new Promise((resolve) => setTimeout(resolve, 600));

	toast.success("Market search ready", {
		description: "You can now search for properties",
	});
};

/**
 * Headless extension action - simulates browser extension setup.
 */
export const headlessExtensionAction = async (): Promise<void> => {
	toast.info("Setting up browser extension...", {
		description: "Configuring lead capture tools",
	});

	await new Promise((resolve) => setTimeout(resolve, 500));

	toast.success("Extension configured", {
		description: "Ready to capture leads from any portal",
	});
};
