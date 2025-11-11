import { MockUserProfile } from "@/constants/_faker/profile/userProfile";
import type { CampaignBase, TransferType } from "@/types/_dashboard/campaign";
import { campaignStatusesGB } from "@/types/_dashboard/campaign";
import type { SocialMediaCampaign } from "@/types/_dashboard/campaign";
import type { KanbanState } from "@/types/_dashboard/kanban";
import type { EmailCampaignAnalytics } from "@/types/goHighLevel/email";
import type { TextMessageCampaignAnalytics } from "@/types/goHighLevel/text";
import type { UserProfile } from "@/types/userProfile";
import type { CampaignAnalytics } from "@/types/userProfile";
import type { CallStatus, EndedReason } from "@/types/vapiAi/api/calls/_enums";
import type { CallCampaignAnalytics } from "@/types/vapiAi/api/calls/get";
import { create } from "zustand";

// Type guards for analytics variants
function isEmail(a: CampaignAnalytics): a is EmailCampaignAnalytics {
	return (
		(a as EmailCampaignAnalytics).senderEmail !== undefined &&
		(a as EmailCampaignAnalytics).bouncedCount !== undefined
	);
}

function isText(a: CampaignAnalytics): a is TextMessageCampaignAnalytics {
	return (a as TextMessageCampaignAnalytics).totalMessages !== undefined;
}

function isCall(a: CampaignAnalytics): a is CallCampaignAnalytics {
	return (a as CallCampaignAnalytics).costBreakdown !== undefined;
}

type StatusCounts = Record<CampaignBase["status"], number>;

interface DirectMailSummary {
	sent: number;
	delivered: number;
	opened: number;
	bounced: number;
	failed: number;
}

interface TextSummary {
	sent: number;
	delivered: number;
	failed: number;
	totalMessages: number;
}

interface CallSummary {
	totalCalls: number;
	byStatus: Partial<Record<CallStatus, number>>;
	byEndedReason: Partial<Record<EndedReason, number>>;
	transfersByType: Partial<Record<TransferType, number>>;
}

interface SocialSummary {
	totalCampaigns: number;
	totalActions: number;
	byPlatform: Partial<Record<SocialMediaCampaign["platform"], number>>;
}

interface KanbanSummary {
	totalTasks: number;
	byStatus: Partial<Record<KanbanState["tasks"][number]["status"], number>>;
}

interface AIReportsState {
	analytics: CampaignAnalytics[];
	// Actions
	refreshFromProfile: (profile?: UserProfile | null) => void;
	// Selectors
	statusCounts: () => StatusCounts;
	directMailSummary: () => DirectMailSummary;
	textSummary: () => TextSummary;
	callSummary: () => CallSummary;
	socialSummary: () => SocialSummary;
	kanbanSummary: () => KanbanSummary;
}

const seededAnalytics: CampaignAnalytics[] =
	(MockUserProfile?.companyInfo?.campaignAnalytics as
		| CampaignAnalytics[]
		| undefined) ?? [];

export const useAIReportsStore = create<AIReportsState>((set, get) => ({
	analytics: seededAnalytics,

	refreshFromProfile: (profile) =>
		set({
			analytics:
				(profile?.companyInfo?.campaignAnalytics as
					| CampaignAnalytics[]
					| undefined) ?? [],
		}),

	statusCounts: () => {
		const base: StatusCounts = Object.fromEntries(
			campaignStatusesGB.map((s) => [s, 0]),
		) as StatusCounts;
		for (const a of get().analytics) {
			const s = a.status;
			if (s in base) base[s as keyof StatusCounts] += 1;
		}
		return base;
	},

	directMailSummary: () => {
		const totals: DirectMailSummary = {
			sent: 0,
			delivered: 0,
			opened: 0,
			bounced: 0,
			failed: 0,
		};
		for (const a of get().analytics) {
			if (isEmail(a)) {
				totals.sent += a.sentCount ?? 0;
				totals.delivered += a.deliveredCount ?? 0;
				totals.opened += a.openedCount ?? 0;
				totals.bounced += a.bouncedCount ?? 0;
				totals.failed += a.failedCount ?? 0;
			}
		}
		return totals;
	},

	textSummary: () => {
		const totals: TextSummary = {
			sent: 0,
			delivered: 0,
			failed: 0,
			totalMessages: 0,
		};
		for (const a of get().analytics) {
			if (isText(a)) {
				totals.sent += a.sentCount ?? 0;
				totals.delivered += a.deliveredCount ?? 0;
				totals.failed += a.failedCount ?? 0;
				totals.totalMessages += a.totalMessages ?? 0;
			}
		}
		return totals;
	},

	callSummary: () => {
		const byStatus: Partial<Record<CallStatus, number>> = {};
		const byEndedReason: Partial<Record<EndedReason, number>> = {};
		const transfersByType: Partial<Record<TransferType, number>> = {};

		let totalCalls = 0;
		for (const a of get().analytics) {
			// Aggregate transfers by transfer.type across all analytics
			const t = a.transfer?.type as TransferType | undefined;
			const key = t;
			if (key) transfersByType[key] = (transfersByType[key] ?? 0) + 1;

			if (!isCall(a)) continue;
			totalCalls += 1;
			const s = a.callStatus as CallStatus;
			byStatus[s] = (byStatus[s] ?? 0) + 1;
			const r = a.endedReason as EndedReason | undefined;
			if (r) byEndedReason[r] = (byEndedReason[r] ?? 0) + 1;
		}
		return { totalCalls, byStatus, byEndedReason, transfersByType };
	},

	socialSummary: () => {
		const social: SocialMediaCampaign[] =
			(MockUserProfile?.companyInfo?.campaigns?.socialCampaigns as
				| SocialMediaCampaign[]
				| undefined) ?? [];
		const byPlatform: Partial<Record<SocialMediaCampaign["platform"], number>> =
			{};
		let totalActions = 0;
		for (const c of social) {
			const p = c.platform;
			byPlatform[p] = (byPlatform[p] ?? 0) + 1;
			totalActions += Array.isArray(c.actions) ? c.actions.length : 0;
		}
		return { totalCampaigns: social.length, totalActions, byPlatform };
	},

	kanbanSummary: () => {
		const ks: KanbanState | undefined = MockUserProfile?.companyInfo
			?.KanbanTasks as KanbanState | undefined;
		const tasks = ks?.tasks ?? [];
		const byStatus: Partial<
			Record<KanbanState["tasks"][number]["status"], number>
		> = {};
		for (const t of tasks) {
			const s = t.status;
			byStatus[s] = (byStatus[s] ?? 0) + 1;
		}
		return { totalTasks: tasks.length, byStatus };
	},
}));
