import { beforeEach, describe, expect, it } from "vitest";
import { useUserStore } from "@/lib/stores/userStore";

const baseSession = {
        user: {
                role: "admin" as const,
                tier: "Starter",
                permissions: ["leads:read"],
                permissionMatrix: { leads: ["read"] },
                permissionList: ["leads:read"],
                quotas: {
                        ai: { allotted: 10, used: 0 },
                        leads: { allotted: 5, used: 0 },
                        skipTraces: { allotted: 2, used: 0 },
                },
        },
};

describe("useUserStore tester flags", () => {
        beforeEach(() => {
                useUserStore.getState().setUser(null);
        });

        it("defaults tester flags to false when cleared", () => {
                const state = useUserStore.getState();
                expect(state.isBetaTester).toBe(false);
                expect(state.isPilotTester).toBe(false);
                expect(state.isFreeTier).toBe(false);
        });

        it("stores tester flags from the session payload", () => {
                useUserStore
                        .getState()
                        .setUser({
                                ...baseSession,
                                user: {
                                        ...baseSession.user,
                                        isBetaTester: true,
                                        isPilotTester: false,
                                        isFreeTier: true,
                                },
                        });

                const state = useUserStore.getState();
                expect(state.isBetaTester).toBe(true);
                expect(state.isPilotTester).toBe(false);
                expect(state.isFreeTier).toBe(true);
        });
});
