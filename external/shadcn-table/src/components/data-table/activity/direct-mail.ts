import { buildActivityPoints, formatCurrency, formatDate, formatNumber, toNumber } from "./shared";
import type { ChannelActivityData } from "./types";

type DirectMailLike = {
        name?: string;
        status?: string;
        startDate?: string;
        mailType?: string;
        mailSize?: string;
        deliveredCount?: number;
        returnedCount?: number;
        failedCount?: number;
        cost?: number;
};

export function buildDirectMailActivity(record: DirectMailLike): ChannelActivityData {
        const delivered = toNumber(record.deliveredCount);
        const returned = toNumber(record.returnedCount);
        const failed = toNumber(record.failedCount);
        const spend = toNumber(record.cost);

        const metrics = {
                delivered,
                returned,
                failed,
        } as const;

        return {
                heading: "Direct Mail Activity",
                description: `Mail delivery summary for "${record.name ?? "Campaign"}"`,
                cards: [
                        { label: "Delivered", value: formatNumber(delivered) },
                        { label: "Returned", value: formatNumber(returned) },
                        { label: "Failed", value: formatNumber(failed) },
                        { label: "Total Spend", value: formatCurrency(spend) },
                ],
                metadata: [
                        { label: "Mail Type", value: String(record.mailType ?? "Unknown") },
                        { label: "Mail Size", value: String(record.mailSize ?? "Unknown") },
                        { label: "Status", value: String(record.status ?? "Unknown") },
                        { label: "Start Date", value: formatDate(record.startDate) },
                ],
                chart: {
                        data: buildActivityPoints(metrics),
                        config: {
                                delivered: { label: "Delivered", color: "hsl(var(--chart-1))" },
                                returned: { label: "Returned", color: "hsl(var(--chart-2))" },
                                failed: { label: "Failed", color: "hsl(var(--chart-3))" },
                        },
                        defaultLines: ["delivered", "returned"],
                        title: "Mail Delivery Progress",
                },
        };
}
