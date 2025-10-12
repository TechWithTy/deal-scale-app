import { buildActivityPoints, formatDate, formatNumber, toNumber } from "./shared";
import type { ChannelActivityData } from "./types";

type TextStats = {
        sent?: number;
        delivered?: number;
        failed?: number;
        total?: number;
};

type TextLike = {
        name?: string;
        status?: string;
        startDate?: string;
        textStats?: TextStats;
        dnc?: number;
};

export function buildTextActivity(record: TextLike): ChannelActivityData {
        const stats = record.textStats ?? {};
        const sent = toNumber(stats.sent ?? stats.total);
        const delivered = toNumber(stats.delivered);
        const failed = toNumber(stats.failed);
        const optOuts = toNumber(record.dnc);

        const metrics = {
                sent,
                delivered,
                failed,
        } as const;

        return {
                heading: "Text Campaign Activity",
                description: `SMS performance summary for "${record.name ?? "Campaign"}"`,
                cards: [
                        { label: "Messages Sent", value: formatNumber(sent) },
                        { label: "Delivered", value: formatNumber(delivered) },
                        { label: "Failed", value: formatNumber(failed) },
                        { label: "Opt Outs", value: formatNumber(optOuts) },
                ],
                metadata: [
                        { label: "Status", value: String(record.status ?? "Unknown") },
                        { label: "Start Date", value: formatDate(record.startDate) },
                ],
                chart: {
                        data: buildActivityPoints(metrics),
                        config: {
                                sent: { label: "Messages Sent", color: "hsl(var(--chart-1))" },
                                delivered: { label: "Delivered", color: "hsl(var(--chart-2))" },
                                failed: { label: "Failed", color: "hsl(var(--chart-3))" },
                        },
                        defaultLines: ["sent", "delivered"],
                        title: "SMS Delivery Volume",
                },
        };
}
