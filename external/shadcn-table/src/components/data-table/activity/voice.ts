import { buildActivityPoints, formatDate, formatNumber, sumTransferBreakdown, toNumber } from "./shared";
import type { ChannelActivityData } from "./types";

type VoiceLike = {
        name?: string;
        status?: string;
        startDate?: string;
        inQueue?: number;
        leads?: number;
        calls?: number;
        transfers?: number;
        transferBreakdown?: Partial<Record<string, number>>;
        voicemail?: number;
        hungUp?: number;
        dead?: number;
        wrongNumber?: number;
        inactiveNumbers?: number;
};

export function buildVoiceActivity(record: VoiceLike): ChannelActivityData {
        const totalCalls = toNumber(record.calls);
        const hungUp = toNumber(record.hungUp);
        const dead = toNumber(record.dead);
        const wrong = toNumber(record.wrongNumber);
        const inactive = toNumber(record.inactiveNumbers);
        const connected = Math.max(0, totalCalls - hungUp - dead - wrong - inactive);
        const voicemail = toNumber(record.voicemail);
        const transfers = toNumber(record.transfers) || sumTransferBreakdown(record.transferBreakdown);

        const metrics = {
                callsPlaced: totalCalls,
                connected,
                transferred: transfers,
                voicemails: voicemail,
        } as const;

        return {
                heading: "Call Campaign Activity",
                description: `Voice performance summary for "${record.name ?? "Campaign"}"`,
                cards: [
                        { label: "Calls Placed", value: formatNumber(totalCalls) },
                        { label: "Connected", value: formatNumber(connected) },
                        { label: "Transfers", value: formatNumber(transfers) },
                        { label: "Voicemails", value: formatNumber(voicemail) },
                ],
                metadata: [
                        { label: "Status", value: String(record.status ?? "Unknown") },
                        { label: "In Queue", value: formatNumber(toNumber(record.inQueue)) },
                        { label: "Leads", value: formatNumber(toNumber(record.leads)) },
                        { label: "Start Date", value: formatDate(record.startDate) },
                ],
                chart: {
                        data: buildActivityPoints(metrics),
                        config: {
                                callsPlaced: { label: "Calls Placed", color: "hsl(var(--chart-1))" },
                                connected: { label: "Connected", color: "hsl(var(--chart-2))" },
                                transferred: { label: "Transfers", color: "hsl(var(--chart-3))" },
                                voicemails: { label: "Voicemails", color: "hsl(var(--chart-4))" },
                        },
                        defaultLines: ["callsPlaced", "connected", "transferred"],
                        title: "Voice Engagement",
                },
        };
}
