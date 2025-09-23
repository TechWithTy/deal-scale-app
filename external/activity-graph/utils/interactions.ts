import type { ActivityDataPoint, ChartConfigLocal } from "../types";
import { daysForRange, filterDataByRange, type TimeRangeKey } from "./time";

export type InteractionChannel =
	| "social_media"
	| "call"
	| "text"
	| "direct_mail"
	| "qr_scan";

export type InteractionEvent = {
	id: string;
	channel: InteractionChannel;
	timestamp: string; // ISO
};

const channelPalette: Record<InteractionChannel, string> = {
	social_media: "hsl(var(--chart-1))",
	call: "hsl(var(--chart-2))",
	text: "hsl(var(--chart-3))",
	direct_mail: "hsl(var(--chart-4))",
	qr_scan: "hsl(var(--chart-5))",
};

export async function fetchInteractionEvents(
	apiPath: string,
): Promise<InteractionEvent[]> {
	try {
		const res = await fetch(apiPath, { cache: "no-store" });
		if (!res.ok) throw new Error("bad status");
		return (await res.json()) as InteractionEvent[];
	} catch {
		// demo data over recent days
		const now = new Date();
		const days = 12;
		const demo: InteractionEvent[] = [];
		const channels: InteractionChannel[] = [
			"social_media",
			"call",
			"text",
			"direct_mail",
			"qr_scan",
		];
		for (let i = days; i >= 0; i--) {
			const d = new Date(now);
			d.setDate(now.getDate() - i);
			const iso = d.toISOString();
			// vary counts
			channels.forEach((ch, idx) => {
				const count = (i + idx) % 3 === 0 ? 2 : (i + idx) % 2; // 0..2
				for (let k = 0; k < count; k++) {
					demo.push({ id: `${ch}-${iso}-${k}`, channel: ch, timestamp: iso });
				}
			});
		}
		return demo;
	}
}

export function buildChannelSeries(
	events: InteractionEvent[],
	range: TimeRangeKey,
): { data: ActivityDataPoint[]; config: ChartConfigLocal; lines: string[] } {
	const filtered = filterDataByRange(events, range);
	const days = daysForRange(range, 30);
	const endMs = filtered.length
		? Math.max(...filtered.map((e) => new Date(e.timestamp).getTime()))
		: Date.now();
	const dayKeys: string[] = [];
	for (let i = days - 1; i >= 0; i--) {
		const d = new Date(endMs);
		d.setDate(d.getDate() - i);
		dayKeys.push(d.toISOString().slice(0, 10));
	}

	const channels = Object.keys(channelPalette) as InteractionChannel[];
	const counts: Record<string, Record<InteractionChannel, number>> = {};
	for (const dk of dayKeys) {
		counts[dk] = channels.reduce(
			(acc, ch) => ((acc[ch] = 0), acc),
			{} as Record<InteractionChannel, number>,
		);
	}
	for (const e of filtered) {
		const dk = new Date(e.timestamp).toISOString().slice(0, 10);
		if (counts[dk]) counts[dk][e.channel] += 1;
	}

	const data: ActivityDataPoint[] = dayKeys.map((dk) => ({
		timestamp: new Date(dk).toISOString(),
		...counts[dk],
	}));

	const config: ChartConfigLocal = channels.reduce((acc, ch) => {
		acc[ch] = { label: prettyChannel(ch), color: channelPalette[ch] };
		return acc;
	}, {} as ChartConfigLocal);

	return { data, config, lines: channels };
}

export function prettyChannel(ch: InteractionChannel): string {
	switch (ch) {
		case "social_media":
			return "Social Media";
		case "call":
			return "Call";
		case "text":
			return "Text";
		case "direct_mail":
			return "Direct Mail";
		case "qr_scan":
			return "QR Scan";
		default:
			return ch;
	}
}
