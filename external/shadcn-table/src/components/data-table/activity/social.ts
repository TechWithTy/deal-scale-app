import { buildActivityPoints, formatDate, formatNumber, toNumber } from "./shared";
import type { ChannelActivityData } from "./types";

type InteractionDetail = { transfers?: number };

type SocialLike = {
        name?: string;
        status?: string;
        startDate?: string;
        platform?: string;
        interactionsDetails?: InteractionDetail[];
        sent?: number;
        delivered?: number;
        failed?: number;
};

export function buildSocialActivity(record: SocialLike): ChannelActivityData {
        const interactions = Array.isArray(record.interactionsDetails)
                ? record.interactionsDetails.length
                : 0;
        const transferCount = Array.isArray(record.interactionsDetails)
                ? record.interactionsDetails.reduce((acc, detail) => acc + toNumber(detail?.transfers), 0)
                : 0;
        const sent = toNumber(record.sent);
        const delivered = toNumber(record.delivered);
        const failed = toNumber(record.failed);

        const metrics = {
                interactions,
                transfers: transferCount,
                delivered,
                failed,
        } as const;

        return {
                heading: "Social Campaign Activity",
                description: `Engagement summary for "${record.name ?? "Campaign"}"`,
                cards: [
                        { label: "Interactions", value: formatNumber(interactions) },
                        { label: "Transfers", value: formatNumber(transferCount) },
                        { label: "Delivered", value: formatNumber(delivered) },
                        { label: "Failed", value: formatNumber(failed) },
                ],
                metadata: [
                        { label: "Platform", value: String(record.platform ?? "Unknown") },
                        { label: "Status", value: String(record.status ?? "Unknown") },
                        { label: "Start Date", value: formatDate(record.startDate) },
                ],
                chart: {
                        data: buildActivityPoints(metrics),
                        config: {
                                interactions: { label: "Interactions", color: "hsl(var(--chart-1))" },
                                transfers: { label: "Transfers", color: "hsl(var(--chart-2))" },
                                delivered: { label: "Delivered", color: "hsl(var(--chart-3))" },
                                failed: { label: "Failed", color: "hsl(var(--chart-4))" },
                        },
                        defaultLines: ["interactions", "transfers"],
                        title: "Social Engagement",
                },
        };
}
