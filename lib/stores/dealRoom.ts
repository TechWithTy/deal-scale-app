/**
 * Deal Room State Management
 * Zustand store for managing deals, documents, and stakeholders
 */

import type {
	Deal,
	DealDocument,
	DealStakeholder,
	DealChecklistTask,
	DealMilestone,
	DealTemplate,
	SourceLead,
	SourceCampaign,
	PropertyDetails,
} from "@/types/_dashboard/dealRoom";
import { create } from "zustand";
import { toast } from "sonner";

interface DealRoomState {
	deals: Deal[];
	currentDeal: Deal | null;
	isCreating: boolean;

	// Deal CRUD operations
	addDeal: (deal: Omit<Deal, "id" | "createdAt" | "updatedAt">) => string;
	updateDeal: (dealId: string, updates: Partial<Deal>) => void;
	deleteDeal: (dealId: string) => void;
	getDeal: (dealId: string) => Deal | undefined;
	setCurrentDeal: (dealId: string | null) => void;

	// Deal creation from leads
	createDealFromLead: (params: {
		lead: SourceLead;
		campaign?: SourceCampaign;
		propertyDetails: PropertyDetails;
		dealType: Deal["dealType"];
		purchasePrice: number;
		estimatedARV?: number;
		template?: DealTemplate;
	}) => string;

	// Filters and search
	filterDealsByStatus: (status: Deal["status"]) => Deal[];
	searchDeals: (query: string) => Deal[];

	// Analytics
	getTotalValue: () => number;
	getAverageCompletion: () => number;
	getDealsBySource: (campaignId: string) => Deal[];

	// Reset
	reset: () => void;
}

const createInitialState = () => ({
	deals: [],
	currentDeal: null,
	isCreating: false,
});

export const useDealRoomStore = create<DealRoomState>((set, get) => ({
	...createInitialState(),

	addDeal: (dealData) => {
		const newDeal: Deal = {
			...dealData,
			id: `deal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		set((state) => ({
			deals: [...state.deals, newDeal],
			currentDeal: newDeal,
		}));

		toast.success("Deal created successfully", {
			description: `${newDeal.propertyAddress} has been added to your deal room`,
		});

		return newDeal.id;
	},

	updateDeal: (dealId, updates) => {
		set((state) => ({
			deals: state.deals.map((deal) =>
				deal.id === dealId
					? { ...deal, ...updates, updatedAt: new Date().toISOString() }
					: deal,
			),
			currentDeal:
				state.currentDeal?.id === dealId
					? {
							...state.currentDeal,
							...updates,
							updatedAt: new Date().toISOString(),
						}
					: state.currentDeal,
		}));

		toast.success("Deal updated");
	},

	deleteDeal: (dealId) => {
		const deal = get().deals.find((d) => d.id === dealId);

		set((state) => ({
			deals: state.deals.filter((d) => d.id !== dealId),
			currentDeal: state.currentDeal?.id === dealId ? null : state.currentDeal,
		}));

		if (deal) {
			toast.success(`Deleted ${deal.propertyAddress}`);
		}
	},

	getDeal: (dealId) => {
		return get().deals.find((d) => d.id === dealId);
	},

	setCurrentDeal: (dealId) => {
		if (!dealId) {
			set({ currentDeal: null });
			return;
		}

		const deal = get().getDeal(dealId);
		set({ currentDeal: deal || null });
	},

	createDealFromLead: ({
		lead,
		campaign,
		propertyDetails,
		dealType,
		purchasePrice,
		estimatedARV,
		template,
	}) => {
		// Calculate initial ROI if ARV provided
		const projectedROI = estimatedARV
			? Math.round(((estimatedARV - purchasePrice) / purchasePrice) * 100)
			: undefined;

		// Extract address from lead
		const addressParts = lead.leadName.split(",");
		const propertyAddress = addressParts[0]?.trim() || lead.leadName;

		const newDeal: Omit<Deal, "id" | "createdAt" | "updatedAt"> = {
			propertyAddress,
			propertyCity: "", // Will be populated from property details or lead
			propertyState: "",
			propertyZip: "",
			dealType,
			status: "pre-offer",
			purchasePrice,
			estimatedARV,
			projectedROI,
			closingDate: undefined,
			daysUntilClosing: undefined,
			completionPercentage: 0,
			ownerId: "current-user", // Will be replaced with actual user ID
			ownerName: "Current User",
			sourceLead: lead,
			sourceCampaign: campaign,
			propertyDetails,
		};

		const dealId = get().addDeal(newDeal);

		toast.success("Deal created from lead", {
			description: campaign
				? `Generated from ${campaign.campaignName} campaign`
				: "Generated from lead data",
		});

		return dealId;
	},

	filterDealsByStatus: (status) => {
		return get().deals.filter((deal) => deal.status === status);
	},

	searchDeals: (query) => {
		const lowercaseQuery = query.toLowerCase();
		return get().deals.filter(
			(deal) =>
				deal.propertyAddress.toLowerCase().includes(lowercaseQuery) ||
				deal.propertyCity.toLowerCase().includes(lowercaseQuery) ||
				deal.propertyState.toLowerCase().includes(lowercaseQuery),
		);
	},

	getTotalValue: () => {
		return get().deals.reduce((sum, deal) => sum + deal.purchasePrice, 0);
	},

	getAverageCompletion: () => {
		const deals = get().deals;
		if (deals.length === 0) return 0;
		const total = deals.reduce(
			(sum, deal) => sum + deal.completionPercentage,
			0,
		);
		return Math.round(total / deals.length);
	},

	getDealsBySource: (campaignId) => {
		return get().deals.filter(
			(deal) => deal.sourceCampaign?.campaignId === campaignId,
		);
	},

	reset: () => {
		set(createInitialState());
	},
}));
