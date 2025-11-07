import { MockUserProfile } from "@/constants/_faker/profile/userProfile";
import type {
	CallCampaign,
	CampaignBase,
	SocialMediaCampaign,
	TransferType,
} from "@/types/_dashboard/campaign";
import { campaignStatusesGB } from "@/types/_dashboard/campaign";
import type { EmailCampaign } from "@/types/goHighLevel/email";
import type { GHLTextMessageCampaign } from "@/types/goHighLevel/text";
import type { UserProfile } from "@/types/userProfile";
import { create } from "zustand";

type AnyCampaign =
	| EmailCampaign
	| CallCampaign
	| GHLTextMessageCampaign
	| SocialMediaCampaign;
type ChannelKey = "text" | "dm" | "call" | "social";

function itemsByType(
	profile?: UserProfile | null,
	k?: ChannelKey,
): AnyCampaign[] {
	const c =
		profile?.companyInfo?.campaigns ?? MockUserProfile?.companyInfo?.campaigns;
	if (!c) return [];
	switch (k) {
		case "text":
			return (c.textCampaigns as GHLTextMessageCampaign[] | undefined) ?? [];
		case "dm":
			return (c.emailCampaigns as EmailCampaign[] | undefined) ?? [];
		case "call":
			return (c.callCampaigns as CallCampaign[] | undefined) ?? [];
		case "social":
			return (c.socialCampaigns as SocialMediaCampaign[] | undefined) ?? [];
		default:
			return [];
	}
}

type StatusCounts = Record<CampaignBase["status"], number>;

interface ChannelTotals {
	text: number;
	dm: number;
	call: number;
	social: number;
}

interface TextSummary {
	sent: number;
	delivered: number;
	failed: number;
	totalMessages: number;
}

interface DMSummary {
	recipients: number;
	sent: number;
	delivered: number;
	opened: number;
	bounced: number;
	failed: number;
}

interface CallSummary {
	calls: number;
	inQueue: number;
	voicemail: number;
	hungUp: number;
	dead: number;
	wrongNumber: number;
	inactiveNumbers: number;
	dnc: number;
}

interface SocialSummary {
	totalCampaigns: number;
	totalActions: number;
	byPlatform: Partial<Record<SocialMediaCampaign["platform"], number>>;
}

interface CampaignReportsState {
	refreshFromProfile: (profile?: UserProfile | null) => void;
	channelTotals: () => ChannelTotals;
	statusCounts: () => StatusCounts;
	transferBreakdown: () => Partial<Record<TransferType, number>>;
	textSummary: () => TextSummary;
	dmSummary: () => DMSummary;
	callSummary: () => CallSummary;
	socialSummary: () => SocialSummary;
}

export const useUserCampaignReportsStore = create<CampaignReportsState>(
	(set, get) => ({
		refreshFromProfile: () => {
			// No cached state; derived from MockUserProfile or provided profile when selectors run
			set({});
		},

		channelTotals: () => ({
			text: itemsByType(undefined, "text").length,
			dm: itemsByType(undefined, "dm").length,
			call: itemsByType(undefined, "call").length,
			social: itemsByType(undefined, "social").length,
		}),

		statusCounts: () => {
			const base: StatusCounts = Object.fromEntries(
				campaignStatusesGB.map((s) => [s, 0]),
			) as StatusCounts;
			const all: AnyCampaign[] = [
				...itemsByType(undefined, "text"),
				...itemsByType(undefined, "dm"),
				...itemsByType(undefined, "call"),
				...itemsByType(undefined, "social"),
			] as AnyCampaign[];
			for (const c of all) {
				const s = c.status;
				if (s in base) base[s as keyof StatusCounts] += 1;
			}
			return base;
		},

		transferBreakdown: () => {
			const acc: Partial<Record<TransferType, number>> = {};
			const all: AnyCampaign[] = [
				...itemsByType(undefined, "text"),
				...itemsByType(undefined, "dm"),
				...itemsByType(undefined, "call"),
				...itemsByType(undefined, "social"),
			] as AnyCampaign[];
			for (const c of all) {
				const key = c.transfer?.type as TransferType | undefined;
				if (key) acc[key] = (acc[key] ?? 0) + 1;
			}
			return acc;
		},

		textSummary: () => {
			const texts = itemsByType(undefined, "text") as GHLTextMessageCampaign[];
			return texts.reduce<TextSummary>(
				(m, t) => ({
					sent: m.sent + (t.sentCount ?? 0),
					delivered: m.delivered + (t.deliveredCount ?? 0),
					failed: m.failed + (t.failedCount ?? 0),
					totalMessages: m.totalMessages + (t.totalMessages ?? 0),
				}),
				{ sent: 0, delivered: 0, failed: 0, totalMessages: 0 },
			);
		},

		dmSummary: () => {
			const emails = itemsByType(undefined, "dm") as EmailCampaign[];
			return emails.reduce<DMSummary>(
				(m, e) => ({
					recipients: m.recipients + (e.recipientCount ?? 0),
					sent: m.sent + (e.sentCount ?? 0),
					delivered: m.delivered + (e.deliveredCount ?? 0),
					opened: m.opened + (e.openedCount ?? 0),
					bounced: m.bounced + (e.bouncedCount ?? 0),
					failed: m.failed + (e.failedCount ?? 0),
				}),
				{
					recipients: 0,
					sent: 0,
					delivered: 0,
					opened: 0,
					bounced: 0,
					failed: 0,
				},
			);
		},

		callSummary: () => {
			const calls = itemsByType(undefined, "call") as CallCampaign[];
			return calls.reduce<CallSummary>(
				(m, c) => ({
					calls: m.calls + (c.calls ?? 0),
					inQueue: m.inQueue + (c.inQueue ?? 0),
					voicemail: m.voicemail + (c.voicemail ?? 0),
					hungUp: m.hungUp + (c.hungUp ?? 0),
					dead: m.dead + (c.dead ?? 0),
					wrongNumber: m.wrongNumber + (c.wrongNumber ?? 0),
					inactiveNumbers: m.inactiveNumbers + (c.inactiveNumbers ?? 0),
					dnc: m.dnc + (c.dnc ?? 0),
				}),
				{
					calls: 0,
					inQueue: 0,
					voicemail: 0,
					hungUp: 0,
					dead: 0,
					wrongNumber: 0,
					inactiveNumbers: 0,
					dnc: 0,
				},
			);
		},

		socialSummary: () => {
			const social = itemsByType(undefined, "social") as SocialMediaCampaign[];
			const byPlatform: Partial<
				Record<SocialMediaCampaign["platform"], number>
			> = {};
			let totalActions = 0;
			for (const c of social) {
				const p = c.platform;
				byPlatform[p] = (byPlatform[p] ?? 0) + 1;
				totalActions += Array.isArray(c.actions) ? c.actions.length : 0;
			}
			return { totalCampaigns: social.length, totalActions, byPlatform };
		},
	}),
);
