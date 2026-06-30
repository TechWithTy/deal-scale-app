import {
	addCartItem,
	createCampaign,
	createPaymentCheckout,
	getCampaignStatus,
	getCreditsBalance,
	getCreditsHistory,
	getTeamActivity,
	retryAdminUserProvisioning,
	searchAdminUsers,
	updateCartItem,
	updateTeamMember,
} from "@/lib/api/public-api-dashboard";
import { afterEach, describe, expect, it, vi } from "vitest";

function mockOkFetch() {
	vi.stubGlobal(
		"fetch",
		vi.fn(
			async () => new Response(JSON.stringify({ ok: true }), { status: 200 }),
		),
	);
}

describe("public API dashboard wrappers", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("loads credits with a bearer token", async () => {
		mockOkFetch();

		await getCreditsBalance("token-123");

		const [path, init] = vi.mocked(fetch).mock.calls[0];
		expect(path).toBe("/api/v1/credits/balance");
		expect((init?.headers as Headers).get("Authorization")).toBe(
			"Bearer token-123",
		);
	});

	it("builds query strings for list endpoints", async () => {
		mockOkFetch();

		await getCreditsHistory({ limit: 20, cursor: "abc" }, "token-123");
		await getTeamActivity({ metric_type: "calls" }, "token-123");
		await searchAdminUsers({ q: "user@example.com" }, "token-123");

		expect(vi.mocked(fetch).mock.calls[0][0]).toBe(
			"/api/v1/credits/history?limit=20&cursor=abc",
		);
		expect(vi.mocked(fetch).mock.calls[1][0]).toBe(
			"/api/v1/team/activity?metric_type=calls",
		);
		expect(vi.mocked(fetch).mock.calls[2][0]).toBe(
			"/api/v1/admin/users/search?q=user%40example.com",
		);
	});

	it("posts campaign and cart mutations", async () => {
		mockOkFetch();

		await createCampaign({ name: "Q3" }, "token-123");
		await addCartItem({ product_id: "credits" }, "token-123");

		expect(vi.mocked(fetch).mock.calls[0][0]).toBe("/api/v1/campaigns/");
		expect(vi.mocked(fetch).mock.calls[0][1]?.method).toBe("POST");
		expect(vi.mocked(fetch).mock.calls[1][0]).toBe("/api/v1/cart/items");
		expect(vi.mocked(fetch).mock.calls[1][1]?.method).toBe("POST");
	});

	it("posts custom credit checkout requests", async () => {
		mockOkFetch();

		await createPaymentCheckout(
			{ credits: 500, credit_type: "ai" },
			"token-123",
		);

		expect(vi.mocked(fetch).mock.calls[0][0]).toBe("/api/v1/payments/checkout");
		expect(vi.mocked(fetch).mock.calls[0][1]?.method).toBe("POST");
	});

	it("encodes path identifiers", async () => {
		mockOkFetch();

		await getCampaignStatus("campaign/1", "token-123");
		await updateTeamMember("member/1", { role: "manager" }, "token-123");
		await retryAdminUserProvisioning("user/1", "token-123");
		await updateCartItem("item/1", { quantity: 2 }, "token-123");

		expect(vi.mocked(fetch).mock.calls[0][0]).toBe(
			"/api/v1/campaigns/campaign%2F1/status",
		);
		expect(vi.mocked(fetch).mock.calls[1][0]).toBe(
			"/api/v1/team/members/member%2F1",
		);
		expect(vi.mocked(fetch).mock.calls[2][0]).toBe(
			"/api/v1/admin/users/user%2F1/retry-provisioning",
		);
		expect(vi.mocked(fetch).mock.calls[3][0]).toBe(
			"/api/v1/cart/items/item%2F1",
		);
	});
});
