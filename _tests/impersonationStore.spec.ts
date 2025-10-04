import { afterEach, describe, expect, it, vi, beforeEach } from "vitest";
import type { Session } from "next-auth";
import { useImpersonationStore } from "../lib/stores/impersonationStore";
import * as impersonationService from "../lib/admin/impersonation-service";

function createSession(partial?: Partial<Session & { impersonator?: { id: string; name?: string | null; email?: string | null } | null }>): Session {
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
	});

	afterEach(() => {
		vi.restoreAllMocks();
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

                const state = useImpersonationStore.getState();
                expect(state.isImpersonating).toBe(true);
                expect(state.impersonatedUser?.id).toBe("target-id");
                expect(state.impersonator?.id).toBe("admin-id");
        });

        it("stops impersonation through the API and clears state", async () => {
                useImpersonationStore.setState({
                        isImpersonating: true,
                        impersonatedUser: { id: "target-id" },
                        impersonator: { id: "admin-id" },
                });

                const serviceMock = vi
                        .spyOn(impersonationService, "stopImpersonationSession")
                        .mockResolvedValue();

                await expect(
                        useImpersonationStore.getState().stopImpersonation(),
                ).resolves.toBeUndefined();

                expect(serviceMock).toHaveBeenCalled();

                const state = useImpersonationStore.getState();
                expect(state.isImpersonating).toBe(false);
                expect(state.impersonatedUser).toBeNull();
        });
});
