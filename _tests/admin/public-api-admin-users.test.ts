import {
	extractPublicApiAdminLogs,
	extractPublicApiAdminUsers,
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
