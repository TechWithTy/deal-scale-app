import {
	normalizeNotificationPreferences,
	preferenceUpdate,
} from "@/lib/notifications/public-api-preferences";
import { describe, expect, it } from "vitest";

describe("notification preference normalizers", () => {
	it("fills missing categories with safe defaults and preserves versions", () => {
		const rows = normalizeNotificationPreferences({
			items: [
				{
					category: "security",
					email_enabled: true,
					in_app_enabled: true,
					organization_id: "org",
					sms_enabled: false,
					user_id: "user",
					version: 4,
				},
			],
		});
		expect(rows).toContainEqual({
			category: "security",
			email_enabled: true,
			in_app_enabled: true,
			sms_enabled: false,
			version: 4,
		});
		expect(rows).toContainEqual({
			category: "lead",
			email_enabled: false,
			in_app_enabled: true,
			sms_enabled: false,
			version: 0,
		});
		const lead = rows.find((row) => row.category === "lead");
		expect(lead).toBeDefined();
		if (!lead) throw new Error("Missing lead notification preference");
		expect(preferenceUpdate(lead, "sms_enabled", true)).toMatchObject({
			sms_enabled: true,
			version: 0,
		});
	});
});
