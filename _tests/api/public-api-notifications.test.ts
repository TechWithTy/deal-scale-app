import {
	listNotificationPreferences,
	listNotifications,
	markAllNotificationsRead,
	markNotificationRead,
	updateNotificationPreferences,
} from "@/lib/api/public-api-notifications";
import { toAppNotification } from "@/lib/notifications/public-api-notification-normalizers";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("public API notifications client", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	function stubSuccess(payload: unknown = {}) {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => Response.json(payload)),
		);
	}

	it("calls BE-27 notification feed and read endpoints", async () => {
		stubSuccess({ items: [] });

		await listNotifications(
			{ category: "lead", limit: 10, unread_only: true },
			"token",
		);
		await markNotificationRead("notification 1", "token");
		await markAllNotificationsRead({ category: "campaign" }, "token");

		const calls = vi.mocked(fetch).mock.calls;
		expect(calls.map(([pathname]) => pathname)).toEqual([
			"/api/v1/notifications?category=lead&limit=10&unread_only=true",
			"/api/v1/notifications/notification%201/read",
			"/api/v1/notifications/read-all",
		]);
		expect((calls[0][1]?.headers as Headers).get("Authorization")).toBe(
			"Bearer token",
		);
		expect(calls[1][1]?.method).toBe("POST");
		expect(calls[2][1]?.method).toBe("POST");
		expect(JSON.parse(String(calls[2][1]?.body))).toEqual({
			category: "campaign",
		});
	});

	it("calls BE-27 notification preference endpoints", async () => {
		stubSuccess({ items: [] });

		await listNotificationPreferences("token");
		await updateNotificationPreferences(
			[
				{
					category: "security",
					email_enabled: true,
					in_app_enabled: true,
					sms_enabled: false,
					version: 1,
				},
			],
			"token",
		);

		const calls = vi.mocked(fetch).mock.calls;
		expect(calls.map(([pathname]) => pathname)).toEqual([
			"/api/v1/notification-preferences",
			"/api/v1/notification-preferences",
		]);
		expect(calls[1][1]?.method).toBe("PUT");
		expect(JSON.parse(String(calls[1][1]?.body))).toEqual({
			items: [
				{
					category: "security",
					email_enabled: true,
					in_app_enabled: true,
					sms_enabled: false,
					version: 1,
				},
			],
		});
	});

	it("normalizes public notifications into dropdown rows", () => {
		const row = toAppNotification({
			body: "A new lead is ready",
			category: "lead",
			created_at: "2026-07-06T12:00:00.000Z",
			delivery_channels: ["in_app"],
			delivery_state: "delivered",
			id: "notification-1",
			organization_id: "org-1",
			read_at: null,
			title: "Lead ready",
			updated_at: "2026-07-06T12:00:00.000Z",
			user_id: "user-1",
			version: 1,
		});

		expect(row).toMatchObject({
			id: "notification-1",
			title: "Lead ready",
			description: "A new lead is ready",
			unread: true,
		});
	});
});
