import type { ActivityDataPoint, ChartConfigLocal } from "../../../../activity-graph/types";

export type CampaignChannel = "voice" | "text" | "directMail" | "social";

export interface ChannelActivityCard {
        label: string;
        value: string;
        helperText?: string;
}

export interface ChannelActivityMetadata {
        label: string;
        value: string;
}

export interface ChannelActivityChart {
        data: ActivityDataPoint[];
        config: ChartConfigLocal;
        defaultLines: string[];
        title?: string;
}

export interface ChannelActivityData {
        heading: string;
        description: string;
        cards: ChannelActivityCard[];
        metadata?: ChannelActivityMetadata[];
        chart?: ChannelActivityChart;
}
