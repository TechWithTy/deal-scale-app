import {
	extractPublicApiAdminLogs,
	extractPublicApiAdminUsers,
	mapPublicApiAdminDirectoryUser,
	mapPublicApiAdminUser,
} from "@/lib/admin/public-api-admin-users";
import { describe, expect, it } from "vitest";

describe("public API admin user adapter", () => {
	it("maps snake_case public API users to table users", () => {
		expect(
			mapPublicApiAdminUser({
				credit_balances: {
					ai_credits: { allotted: 100, used: 25 },
					leads: { total: 50, used: 10 },
					skip_traces: { allocated: 20, used: 2 },
				},
				email: "buyer@example.com",
				first_name: "Buyer",
				id: "user-1",
				last_name: "Account",
				phone_number: "+15550100",
				role: "platform_support",
				status: "failed",
			}),
		).toMatchObject({
			credits: {
				ai: { allotted: 100, used: 25 },
				leads: { allotted: 50, used: 10 },
				skipTraces: { allotted: 20, used: 2 },
			},
			email: "buyer@example.com",
			firstName: "Buyer",
			id: "user-1",
			lastName: "Account",
			phone: "+15550100",
			role: "platform_support",
			status: "failed",
		});
	});

	it("extracts users from common paginated response shapes", () => {
		const users = extractPublicApiAdminUsers({
			data: {
				users: [
					{ email: "one@example.com", full_name: "One User", user_id: "1" },
					{ email: "missing-id@example.com" },
					{ email: "two@example.com", name: "Two User", id: "2" },
				],
			},
		});

		expect(users).toHaveLength(2);
		expect(users.map((user) => user.email)).toEqual([
			"one@example.com",
			"two@example.com",
		]);
		expect(users[0]?.firstName).toBe("One");
	});

	it("maps admin detail responses to directory users", () => {
		const detail = mapPublicApiAdminDirectoryUser({
			credit_balances: {
				ai: {
					available_credits: 75,
					reserved_credits: 5,
					total_purchased: 100,
					total_used: 20,
				},
				lead: {
					available_credits: 40,
					total_purchased: 50,
					total_used: 10,
				},
				skip_trace: {
					available_credits: 8,
					total_purchased: 10,
					total_used: 2,
				},
			},
			display_name: "Live Detail",
			email: "live@example.com",
			first_name: "Live",
			id: "live-1",
			last_name: "Detail",
			roles: ["super_admin"],
			scopes: ["admin", "credits:manage"],
			status: "inactive",
			subscription_tier: "Enterprise",
			tester_flags: {
				is_beta_tester: true,
				is_pilot_tester: false,
			},
		});

		expect(detail).toMatchObject({
			credits: {
				ai: { allotted: 100, used: 20 },
				leads: { allotted: 50, used: 10 },
				skipTraces: { allotted: 10, used: 2 },
			},
			email: "live@example.com",
			isBetaTester: true,
			name: "Live Detail",
			permissionList: ["admin", "credits:manage"],
			role: "platform_admin",
			status: "disabled",
			tier: "Enterprise",
		});
	});
});

describe("public API admin logs adapter", () => {
	it("normalizes event log fields", () => {
		expect(
			extractPublicApiAdminLogs({
				events: [
					{
						id: "event-1",
						created_at: "2026-06-29T12:00:00Z",
						event_type: "credit_adjusted",
						message: "Credits adjusted",
					},
				],
			}),
		).toEqual([
			{
				id: "event-1",
				at: "2026-06-29T12:00:00Z",
				message: "Credits adjusted",
			},
		]);
	});
});
