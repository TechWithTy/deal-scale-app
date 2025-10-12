import { afterEach, describe, expect, it, vi } from "vitest";
import {
        startImpersonationSession,
        stopImpersonationSession,
} from "../lib/admin/impersonation-service";
import { users } from "../lib/mock-db";

function toSnapshot(userId: string) {
        const user = users.find((entry) => entry.id === userId);
        if (!user) throw new Error(`Missing mock user ${userId}`);
        return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                tier: user.tier,
                permissions: user.permissionList,
                permissionMatrix: user.permissions,
                permissionList: user.permissionList,
                quotas: user.quotas,
                subscription: user.subscription,
                isBetaTester: user.isBetaTester,
                isPilotTester: user.isPilotTester,
        };
}

describe("impersonation service", () => {
        afterEach(() => {
                vi.restoreAllMocks();
                vi.unstubAllGlobals();
                delete process.env.NEXT_PUBLIC_IMPERSONATION_USE_MOCK;
        });

        it("posts to the API and returns the impersonation payload", async () => {
                const responseBody = {
                        impersonatedUser: {
                                id: "2",
                                name: "Starter User",
                                email: "starter@example.com",
                        },
                        impersonator: {
                                id: "4",
                                name: "Platform Admin",
                                email: "platform.admin@example.com",
                        },
                        impersonatedUserData: toSnapshot("2"),
                        impersonatorUserData: toSnapshot("4"),
                };

		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify(responseBody), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			}),
		);
		vi.stubGlobal("fetch", fetchMock);

		const payload = await startImpersonationSession({ userId: "2" });

		expect(fetchMock).toHaveBeenCalledWith(
			"/api/admin/impersonation",
			expect.objectContaining({
				method: "POST",
				body: JSON.stringify({ userId: "2" }),
			}),
		);
                expect(payload).toEqual(responseBody);
        });

        it("throws when the API reports an error", async () => {
                const fetchMock = vi.fn().mockResolvedValue(
                        new Response(JSON.stringify({ error: "User not found" }), {
				status: 404,
				headers: { "Content-Type": "application/json" },
			}),
		);
		vi.stubGlobal("fetch", fetchMock);

                await expect(
                        startImpersonationSession({ userId: "missing" }),
                ).rejects.toThrow(/Failed to start impersonation session: User not found/i);
        });

        it("falls back to mock data when the API request fails", async () => {
                const fetchMock = vi.fn().mockRejectedValue(new Error("network down"));
                vi.stubGlobal("fetch", fetchMock);
                const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

                const payload = await startImpersonationSession({ userId: "2" });

                expect(fetchMock).toHaveBeenCalled();
                expect(payload.impersonatedUser.id).toBe("2");
                expect(payload.impersonatedUserData.permissions).toContain("leads:read");

                warnSpy.mockRestore();
        });

        it("calls the DELETE endpoint when stopping impersonation", async () => {
                const fetchMock = vi
                        .fn()
                        .mockResolvedValue(new Response(null, { status: 204 }));
                vi.stubGlobal("fetch", fetchMock);

		await expect(stopImpersonationSession()).resolves.toBeUndefined();
		expect(fetchMock).toHaveBeenCalledWith(
			"/api/admin/impersonation",
			expect.objectContaining({ method: "DELETE" }),
		);
	});
});
