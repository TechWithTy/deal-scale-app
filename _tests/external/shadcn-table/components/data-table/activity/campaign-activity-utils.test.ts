import { describe, expect, it } from "vitest";
import {
        buildChannelActivityData,
        inferCampaignChannel,
} from "@/external/shadcn-table/src/components/data-table/activity";

const iso = (offsetDays: number) =>
        new Date(Date.now() - offsetDays * 24 * 60 * 60 * 1000).toISOString();

describe("campaign activity utilities", () => {
        it("infers channels based on record shape", () => {
                expect(inferCampaignChannel({ callerNumber: "+15551234567" })).toBe("voice");
                expect(inferCampaignChannel({ textStats: {} })).toBe("text");
                expect(inferCampaignChannel({ mailType: "postcard" })).toBe("directMail");
                expect(inferCampaignChannel({ platform: "linkedin" })).toBe("social");
                expect(inferCampaignChannel({})).toBeNull();
        });

        it("prioritizes specific channel hints over voice defaults", () => {
                expect(
                        inferCampaignChannel({
                                callerNumber: "+15551234567",
                                textStats: {},
                        }),
                ).toBe("text");

                expect(
                        inferCampaignChannel({
                                callInformation: [{}],
                                mailType: "postcard",
                        }),
                ).toBe("directMail");

                expect(
                        inferCampaignChannel({
                                callerNumber: "+15551234567",
                                platform: "linkedin",
                        }),
                ).toBe("social");
        });

        it("builds voice activity data with expected metrics", () => {
                const activity = buildChannelActivityData({
                        name: "Voice",
                        status: "Active",
                        startDate: iso(6),
                        callerNumber: "+15551234567",
                        calls: 180,
                        hungUp: 20,
                        dead: 6,
                        voicemail: 30,
                        transfers: 12,
                        inQueue: 15,
                        leads: 60,
                });

                expect(activity).not.toBeNull();
                expect(activity?.cards.map((card) => card.label)).toEqual([
                        "Calls Placed",
                        "Connected",
                        "Transfers",
                        "Voicemails",
                ]);
                expect(activity?.chart?.defaultLines).toContain("callsPlaced");
                expect(activity?.chart?.data).toHaveLength(7);
        });

        it("builds direct mail activity data with currency formatting", () => {
                const activity = buildChannelActivityData({
                        name: "Mail",
                        status: "Delivering",
                        startDate: iso(9),
                        mailType: "postcard",
                        mailSize: "6x9",
                        deliveredCount: 320,
                        returnedCount: 8,
                        failedCount: 5,
                        cost: 1280.5,
                });

                expect(activity?.cards.find((card) => card.label === "Total Spend")?.value).toMatch(/\$/);
                expect(activity?.metadata?.some((item) => item.label === "Mail Size")).toBe(true);
        });

        it("returns null for unknown data structures", () => {
                expect(buildChannelActivityData({ foo: "bar" })).toBeNull();
        });
});
