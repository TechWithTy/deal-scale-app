import {
	normalizeActivity,
	normalizeSession,
	unwrapList,
} from "@/components/reusables/modals/user/security/accountSecurityNormalizers";
import { describe, expect, it } from "vitest";

describe("account security normalizers", () => {
	it("normalizes the BE-24 session contract", () => {
		expect(
			normalizeSession({
				browser: "Mobile Safari",
				current: true,
				id: "session-1",
				ip_address: "203.0.113.1",
				is_mobile: true,
				last_accessed_at: "2026-07-04T12:00:00Z",
				location_city: "Denver",
				location_country: "US",
				platform: "iOS",
				status: "active",
			}),
		).toEqual({
			browser: "safari",
			device: "mobile",
			id: "session-1",
			ip: "203.0.113.1",
			isCurrent: true,
			lastActive: new Date("2026-07-04T12:00:00Z").toLocaleString(),
			location: "Denver, US",
			os: "iOS",
		});
	});

	it("normalizes failed activity from the BE-24 activity contract", () => {
		expect(
			normalizeActivity({
				created_at: "2026-07-04T12:00:00Z",
				event_type: "login_failed",
				id: "activity-1",
				ip_address: "203.0.113.2",
				location_city: "Austin",
				location_country: "US",
				successful: false,
				user_agent: "Firefox on Windows",
			}),
		).toEqual({
			description: "Login failed",
			device: "Firefox on Windows",
			id: "activity-1",
			ip: "203.0.113.2",
			location: "Austin, US",
			status: "failed",
			timestamp: new Date("2026-07-04T12:00:00Z").toLocaleString(),
			type: "login",
		});
	});

	it("unwraps paginated BE-24 responses", () => {
		expect(unwrapList({ items: [{ id: "item-1" }] })).toEqual([
			{ id: "item-1" },
		]);
	});
});
