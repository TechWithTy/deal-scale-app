import { describe, expect, it } from "vitest";
import authConfig from "@/auth.config";

describe("auth config session callback", () => {
	it("retains the original public API token while installing an impersonated session", async () => {
		const token = {
			email: "admin@example.com",
			name: "Admin",
			publicApi: { accessToken: "admin-token", sessionId: "admin-session" },
			sub: "admin-id",
		} as any;
		const impersonatedUser = {
			email: "target@example.com",
			id: "target-id",
			name: "Target",
			permissionList: [],
			permissionMatrix: {},
			permissions: [],
			quotas: {
				ai: { allotted: 0, used: 0 },
				leads: { allotted: 0, used: 0 },
				skipTraces: { allotted: 0, used: 0 },
			},
			role: "member",
			subscription: {
				aiCredits: { allotted: 0, resetInDays: 30, used: 0 },
				leads: { allotted: 0, resetInDays: 30, used: 0 },
				skipTraces: { allotted: 0, resetInDays: 30, used: 0 },
			},
			tier: "Starter",
		};
		const originalUser = { ...impersonatedUser, id: "admin-id", name: "Admin" };

		const result = await authConfig.callbacks?.jwt?.({
			session: {
				impersonation: {
					impersonatedUser: {
						email: impersonatedUser.email,
						id: impersonatedUser.id,
						name: impersonatedUser.name,
					},
					impersonator: { id: "admin-id" },
					restore: { user: originalUser },
				},
				publicApi: {
					accessToken: "target-token",
					sessionId: "impersonation-session",
				},
				user: impersonatedUser,
			},
			token,
			trigger: "update",
		} as any);

		expect(result?.publicApi?.accessToken).toBe("target-token");
		expect((result as any)?.impersonationRestore).toMatchObject({
			publicApi: { accessToken: "admin-token", sessionId: "admin-session" },
			user: { id: "admin-id" },
		});
	});

	it("hydrates the session user identity from the token payload", async () => {
                const session = {
                        user: {
                                id: "original-id",
                                name: "Original Admin",
                                email: "admin@example.com",
                        },
                } as any;

                const token = {
                        sub: "impersonated-id",
                        name: "Impersonated User",
                        email: "impersonated@example.com",
                        role: "member",
                        impersonator: { id: "platform-admin", email: "platform.admin@example.com" },
                        publicApi: {
                                accessToken: "token-123",
                                sessionId: "session-123",
                        },
                } as any;

                const result = await authConfig.callbacks?.session?.({ session, token } as any);

                expect(result?.user?.id).toBe("impersonated-id");
                expect(result?.user?.name).toBe("Impersonated User");
                expect(result?.user?.email).toBe("impersonated@example.com");
                expect(result?.user?.role).toBe("member");
                expect(result?.impersonator).toEqual({
                        id: "platform-admin",
                        email: "platform.admin@example.com",
                });
                expect(result?.publicApi?.sessionId).toBe("session-123");
        });
});
