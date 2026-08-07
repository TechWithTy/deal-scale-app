import { POST as exchange } from "@/app/api/auth/impersonation/exchange/route";
import { POST as restore } from "@/app/api/auth/impersonation/restore/route";
import { afterEach, describe, expect, it, vi } from "vitest";

const authMock = vi.hoisted(() => vi.fn());
const getTokenMock = vi.hoisted(() => vi.fn());
const publicApiFetchMock = vi.hoisted(() => vi.fn());

vi.mock("@/auth", () => ({ auth: authMock }));
vi.mock("next-auth/jwt", () => ({ getToken: getTokenMock }));
vi.mock("@/lib/api/public-api-server", () => ({
	publicApiServerFetch: publicApiFetchMock,
}));

const adminSession = {
	publicApi: { accessToken: "admin-token", sessionId: "admin-session" },
	user: {
		email: "admin@example.com",
		id: "admin-id",
		name: "Admin",
		permissionList: ["admin"],
		permissions: ["admin"],
		quotas: {
			ai: { allotted: 0, used: 0 },
			leads: { allotted: 0, used: 0 },
			skipTraces: { allotted: 0, used: 0 },
		},
		role: "platform_admin",
		subscription: {
			aiCredits: { allotted: 0, resetInDays: 30, used: 0 },
			leads: { allotted: 0, resetInDays: 30, used: 0 },
			skipTraces: { allotted: 0, resetInDays: 30, used: 0 },
		},
		tier: "Enterprise",
	},
};

const targetDetail = {
	credit_balances: {},
	display_name: "Target User",
	email: "target@example.com",
	id: "target-id",
	roles: ["member"],
	scopes: ["leads:read"],
	subscription_tier: "Starter",
};

describe("impersonation bridge routes", () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	it("exchanges an admin session for an impersonated public API token", async () => {
		authMock.mockResolvedValue(adminSession);
		publicApiFetchMock
			.mockResolvedValueOnce(targetDetail)
			.mockResolvedValueOnce({
				expires_at: "2026-08-06T12:00:00Z",
				expires_in: 300,
				session_id: "impersonation-session",
				token: "target-token",
			});

		const response = await exchange(
			new Request("http://localhost/api/auth/impersonation/exchange", {
				body: JSON.stringify({ userId: "target-id" }),
				headers: { "Content-Type": "application/json" },
				method: "POST",
			}),
		);

		expect(response.status).toBe(200);
		expect(await response.json()).toMatchObject({
			impersonatedUser: { id: "target-id" },
			impersonator: { id: "admin-id" },
			publicApi: {
				accessToken: "target-token",
				sessionId: "impersonation-session",
			},
		});
		expect(publicApiFetchMock).toHaveBeenLastCalledWith(
			"/api/v1/admin/users/target-id/impersonate",
			{ method: "POST", token: "admin-token" },
		);
	});

	it("rejects nested impersonation", async () => {
		authMock.mockResolvedValue({
			...adminSession,
			impersonator: { id: "other-admin" },
		});

		const response = await exchange(
			new Request("http://localhost/api/auth/impersonation/exchange", {
				body: JSON.stringify({ userId: "target-id" }),
				method: "POST",
			}),
		);

		expect(response.status).toBe(409);
	});

	it("ends the public API session with the original admin token", async () => {
		authMock.mockResolvedValue({
			impersonator: { id: "admin-id" },
			publicApi: {
				accessToken: "target-token",
				sessionId: "impersonation-session",
			},
			user: { id: "target-id" },
		});
		getTokenMock.mockResolvedValue({
			impersonationRestore: {
				publicApi: { accessToken: "admin-token", sessionId: "admin-session" },
				user: adminSession.user,
			},
		});
		publicApiFetchMock.mockResolvedValue({ success: true });

		const response = await restore(
			new Request("http://localhost/api/auth/impersonation/restore", {
				method: "POST",
			}),
		);

		expect(response.status).toBe(200);
		expect(publicApiFetchMock).toHaveBeenCalledWith(
			"/api/v1/admin/users/target-id/end-impersonation?session_id=impersonation-session",
			{ method: "POST", token: "admin-token" },
		);
		expect(await response.json()).toMatchObject({
			publicApi: { accessToken: "admin-token" },
			user: { id: "admin-id" },
		});
	});
});
