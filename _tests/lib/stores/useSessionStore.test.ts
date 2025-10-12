import { act } from "react";
import { describe, expect, it, beforeEach } from "vitest";
import type { Session } from "next-auth";

import { useSessionStore } from "@/lib/stores/user/useSessionStore";

const impersonatedSession = {
        user: {
                id: "impersonated-id",
                name: "Impersonated User",
                email: "impersonated@example.com",
                role: "member",
                permissions: ["leads:read"],
                subscription: {
                        aiCredits: { allotted: 100, used: 10 },
                        leads: { allotted: 50, used: 5 },
                        skipTraces: { allotted: 25, used: 2 },
                },
                quotas: {
                        ai: { allotted: 100, used: 10, resetInDays: 30 },
                        leads: { allotted: 50, used: 5, resetInDays: 30 },
                        skipTraces: { allotted: 25, used: 2, resetInDays: 30 },
                },
        },
        impersonator: {
                id: "platform-admin",
                email: "platform.admin@example.com",
        },
} as const;

describe("useSessionStore", () => {
        beforeEach(() => {
                act(() => {
                        useSessionStore.getState().clear();
                });
        });

        it("hydrates user and impersonator from a NextAuth session payload", () => {
                act(() => {
                        useSessionStore
                                .getState()
                                .setFromSession(impersonatedSession as unknown as Session);
                });

                const state = useSessionStore.getState();
                expect(state.user?.id).toBe("impersonated-id");
                expect(state.user?.email).toBe("impersonated@example.com");
                expect(state.impersonator).toEqual({
                        id: "platform-admin",
                        email: "platform.admin@example.com",
                });
        });

        it("supports manual updates and clearing session data", () => {
                act(() => {
                        useSessionStore.getState().setSessionUser(
                                impersonatedSession.user,
                        );
                        useSessionStore.getState().setImpersonator(
                                impersonatedSession.impersonator,
                        );
                });

                expect(useSessionStore.getState().user?.name).toBe(
                        "Impersonated User",
                );

                act(() => {
                        useSessionStore.getState().clear();
                });

                const afterClear = useSessionStore.getState();
                expect(afterClear.user).toBeNull();
                expect(afterClear.impersonator).toBeNull();
        });
});
