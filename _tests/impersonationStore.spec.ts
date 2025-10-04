import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "next-auth";
import { useImpersonationStore } from "../lib/stores/impersonationStore";
import * as impersonationService from "../lib/admin/impersonation-service";

const impersonatedSnapshot = {
        id: "target-id",
        name: "Target",
        email: "target@example.com",
        role: "member",
        tier: "Starter",
        permissions: ["leads:read"],
        permissionMatrix: { leads: ["read"] },
        permissionList: ["leads:read"],
        quotas: {
                ai: { allotted: 100, used: 10, resetInDays: 30 },
                leads: { allotted: 50, used: 5, resetInDays: 30 },
                skipTraces: { allotted: 10, used: 2, resetInDays: 30 },
        },
        subscription: {
                aiCredits: { allotted: 100, used: 10, resetInDays: 30 },
                leads: { allotted: 50, used: 5, resetInDays: 30 },
                skipTraces: { allotted: 10, used: 2, resetInDays: 30 },
        },
        isBetaTester: false,
        isPilotTester: false,
} as const;

const impersonatorSnapshot = {
        ...impersonatedSnapshot,
        id: "admin-id",
        name: "Admin",
        email: "admin@example.com",
        role: "platform_admin",
        permissions: ["users:read"],
        permissionMatrix: { users: ["read"] },
        permissionList: ["users:read"],
};

let fetchMock: ReturnType<typeof vi.fn>;

function createSession(partial?: Partial<
        Session & { impersonator?: { id: string; name?: string | null; email?: string | null } | null }
>): Session {
        return {
                expires: new Date(Date.now() + 60_000).toISOString(),
                user: {
                        id: "target-user",
                        name: "Target User",
                        email: "target@example.com",
                },
                ...partial,
        } as Session;
}

describe("impersonation store", () => {
        beforeEach(() => {
                useImpersonationStore.getState().reset();
                fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
                vi.stubGlobal("fetch", fetchMock);
        });

        afterEach(() => {
                vi.restoreAllMocks();
                vi.unstubAllGlobals();
        });

        it("hydrates state from a session impersonation payload", () => {
                const session = createSession({
                        impersonator: {
                                id: "admin-id",
                                name: "Admin User",
                                email: "admin@example.com",
                        },
                });

                useImpersonationStore.getState().hydrateFromSession(session);

                const state = useImpersonationStore.getState();
                expect(state.isImpersonating).toBe(true);
                expect(state.impersonatedUser?.id).toBe("target-user");
                expect(state.impersonator?.email).toBe("admin@example.com");
        });

        it("clears state when hydrating without a session", () => {
                useImpersonationStore.setState({
                        isImpersonating: true,
                        impersonatedUser: { id: "x" },
                        impersonator: { id: "y" },
                        originalCredits: null,
                        originalUserData: null,
                });

                useImpersonationStore.getState().hydrateFromSession(null);

                const state = useImpersonationStore.getState();
                expect(state.isImpersonating).toBe(false);
                expect(state.impersonatedUser).toBeNull();
                expect(state.impersonator).toBeNull();
        });

        it("starts impersonation through the API and updates state", async () => {
                const responseBody = {
                        impersonatedUser: {
                                id: "target-id",
                                name: "Target",
                                email: "target@example.com",
                        },
                        impersonator: {
                                id: "admin-id",
                                name: "Admin",
                                email: "admin@example.com",
                        },
                        impersonatedUserData: impersonatedSnapshot,
                        impersonatorUserData: impersonatorSnapshot,
                };

                const serviceMock = vi
                        .spyOn(impersonationService, "startImpersonationSession")
                        .mockResolvedValue(responseBody);

                await expect(
                        useImpersonationStore.getState().startImpersonation({
                                userId: "target-id",
                        }),
                ).resolves.toEqual(responseBody);

                expect(serviceMock).toHaveBeenCalledWith({ userId: "target-id" });
                expect(fetchMock).toHaveBeenCalledWith(
                        "/api/auth/session",
                        expect.objectContaining({
                                method: "PATCH",
                                body: JSON.stringify({
                                        impersonation: {
                                                impersonator: responseBody.impersonator,
                                                impersonatedUser: responseBody.impersonatedUser,
                                        },
                                        user: responseBody.impersonatedUserData,
                                }),
                        }),
                );

                const state = useImpersonationStore.getState();
                expect(state.isImpersonating).toBe(true);
                expect(state.impersonatedUser?.id).toBe("target-id");
                expect(state.impersonator?.id).toBe("admin-id");
                expect(state.originalUserData).toEqual(impersonatorSnapshot);
        });

        it("stops impersonation through the API and clears state", async () => {
                useImpersonationStore.setState({
                        isImpersonating: true,
                        impersonatedUser: { id: "target-id" },
                        impersonator: { id: "admin-id" },
                        originalCredits: {
                                ai: { allotted: 100, used: 10 },
                                leads: { allotted: 50, used: 5 },
                                skipTraces: { allotted: 10, used: 2 },
                        },
                        originalUserData: impersonatorSnapshot,
                });

                const serviceMock = vi
                        .spyOn(impersonationService, "stopImpersonationSession")
                        .mockResolvedValue();

                await expect(
                        useImpersonationStore.getState().stopImpersonation(),
                ).resolves.toBeUndefined();

                expect(serviceMock).toHaveBeenCalled();
                expect(fetchMock).toHaveBeenCalledWith(
                        "/api/auth/session",
                        expect.objectContaining({
                                method: "PATCH",
                                body: JSON.stringify({
                                        impersonation: {
                                                impersonator: null,
                                                impersonatedUser: null,
                                        },
                                        user: impersonatorSnapshot,
                                }),
                        }),
                );

                const state = useImpersonationStore.getState();
                expect(state.isImpersonating).toBe(false);
                expect(state.impersonatedUser).toBeNull();
                expect(state.originalUserData).toBeNull();
        });
});
