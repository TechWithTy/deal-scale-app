import {
	listAccountSessions,
	requestAccountDeletion,
	requestDataExport,
	revokeOtherAccountSessions,
} from "@/lib/api/public-api-account-security";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("public API account security client", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	function stubSuccess(payload: unknown = {}) {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => Response.json(payload)),
		);
	}

	it("lists authenticated account sessions", async () => {
		stubSuccess({ items: [] });

		await listAccountSessions("token-123", "session-1");

		const [pathname, init] = vi.mocked(fetch).mock.calls[0];
		expect(pathname).toBe("/api/v1/auth/sessions");
		expect((init?.headers as Headers).get("Authorization")).toBe(
			"Bearer token-123",
		);
		expect((init?.headers as Headers).get("x-session-id")).toBe("session-1");
	});

	it("revokes each non-current session without revoking the current session", async () => {
		stubSuccess({ revoked: true });

		await revokeOtherAccountSessions(["session-2", "session-3"], "token-123");

		expect(vi.mocked(fetch).mock.calls).toHaveLength(2);
		expect(vi.mocked(fetch).mock.calls.map(([pathname]) => pathname)).toEqual([
			"/api/v1/auth/sessions/session-2",
			"/api/v1/auth/sessions/session-3",
		]);
		expect(
			vi
				.mocked(fetch)
				.mock.calls.every(([, init]) => init?.method === "DELETE"),
		).toBe(true);
	});

	it("requests a typed asynchronous data export", async () => {
		stubSuccess({ request_id: "export-1", status: "queued" });

		await requestDataExport(
			{ export_type: "profile", format: "json" },
			"token-123",
		);

		const [pathname, init] = vi.mocked(fetch).mock.calls[0];
		expect(pathname).toBe("/api/v1/account/data-export");
		expect(init?.method).toBe("POST");
		expect(JSON.parse(String(init?.body))).toEqual({
			export_type: "profile",
			format: "json",
		});
	});

	it("submits account deletion as an asynchronous request", async () => {
		stubSuccess({ request_id: "deletion-1", status: "pending_verification" });

		await requestAccountDeletion({ confirmation: "DELETE" }, "token-123");

		const [pathname, init] = vi.mocked(fetch).mock.calls[0];
		expect(pathname).toBe("/api/v1/account");
		expect(init?.method).toBe("DELETE");
		expect(JSON.parse(String(init?.body))).toEqual({
			confirmation: "DELETE",
		});
	});
});
