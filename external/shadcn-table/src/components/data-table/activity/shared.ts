import { CampaignChannel, type ChannelActivityData } from "./types";

type ChannelLike = Record<string, unknown>;

type NumericRecord = Record<string, number>;

const numberFormatter = new Intl.NumberFormat();

const currencyFormatter = new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
});

const DAYS_IN_SERIES = 7;

export function inferCampaignChannel(data: unknown): CampaignChannel | null {
        if (!data || typeof data !== "object") {
                return null;
        }

        if ("callerNumber" in data || "callInformation" in data) {
                return "voice";
        }
        if ("textStats" in data) {
                return "text";
        }
        if ("mailType" in data || "deliveredCount" in data) {
                return "directMail";
        }
        if ("platform" in data || "interactionsDetails" in data) {
                return "social";
        }
        return null;
}

export function toNumber(value: unknown): number {
        return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function sumTransferBreakdown(value: unknown): number {
        if (!value || typeof value !== "object") {
                return 0;
        }
        return Object.values(value as Record<string, unknown>).reduce((acc, current) => {
                return acc + (typeof current === "number" && Number.isFinite(current) ? current : 0);
        }, 0);
}

export function formatNumber(value: number): string {
        return numberFormatter.format(Math.max(0, Math.round(value)));
}

export function formatCurrency(value: number): string {
        return currencyFormatter.format(Math.max(0, value));
}

export function formatDate(value: unknown): string {
        if (!value) return "Unknown";
        const date = new Date(String(value));
        if (Number.isNaN(date.getTime())) return "Unknown";
        return dateFormatter.format(date);
}

function buildMetricSeries(total: number): number[] {
        if (!Number.isFinite(total) || total <= 0) {
                return Array.from({ length: DAYS_IN_SERIES }, () => 0);
        }

        const base = total / DAYS_IN_SERIES;
        const values: number[] = [];
        let accumulated = 0;

        for (let index = 0; index < DAYS_IN_SERIES; index++) {
                const phase = Math.sin(((index + 1) / DAYS_IN_SERIES) * Math.PI) * 0.4;
                let value = Math.round(base * (1 + phase));

                if (value <= 0 && accumulated < total) {
                        value = 1;
                }

                if (accumulated + value > total) {
                        value = Math.max(0, Math.round(total - accumulated));
                }

                accumulated += value;
                values.push(value);
        }

        const remainder = Math.round(total - accumulated);
        if (remainder !== 0) {
                        const lastIndex = values.length - 1;
                        values[lastIndex] = Math.max(0, values[lastIndex] + remainder);
        }

        return values;
}

export function buildSeries(metrics: NumericRecord): { data: number[][]; keys: string[] } {
        const keys = Object.keys(metrics);
        if (keys.length === 0) {
                return { data: [], keys };
        }

        const distributed = keys.map((key) => buildMetricSeries(metrics[key] ?? 0));
        return { data: distributed, keys };
}

export function buildActivityPoints(metrics: NumericRecord) {
        const { data, keys } = buildSeries(metrics);
        return Array.from({ length: DAYS_IN_SERIES }).map((_, index) => {
                const date = new Date();
                date.setDate(date.getDate() - (DAYS_IN_SERIES - 1 - index));
                const point: Record<string, number | string> = {
                        timestamp: date.toISOString(),
                };
                keys.forEach((key, keyIndex) => {
                        point[key] = data[keyIndex]?.[index] ?? 0;
                });
                return point;
        });
}

export type ChannelBuilder = (record: ChannelLike) => ChannelActivityData;
