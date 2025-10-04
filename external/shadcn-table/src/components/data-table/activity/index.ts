import { buildDirectMailActivity } from "./direct-mail";
import { buildSocialActivity } from "./social";
import { inferCampaignChannel } from "./shared";
import type { ChannelActivityData } from "./types";
import { buildTextActivity } from "./text";
import { buildVoiceActivity } from "./voice";

export { inferCampaignChannel };
export type { ChannelActivityData, ChannelActivityCard, ChannelActivityChart, ChannelActivityMetadata, CampaignChannel } from "./types";

export function buildChannelActivityData(record: unknown): ChannelActivityData | null {
        const channel = inferCampaignChannel(record);
        if (!channel) {
                return null;
        }

        const value = (record ?? {}) as Record<string, unknown>;

        switch (channel) {
                case "voice":
                        return buildVoiceActivity(value);
                case "text":
                        return buildTextActivity(value);
                case "directMail":
                        return buildDirectMailActivity(value);
                case "social":
                        return buildSocialActivity(value);
                default:
                        return null;
        }
}
