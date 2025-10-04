import { afterEach, describe, expect, it, vi } from "vitest";
import {
	startImpersonationSession,
	stopImpersonationSession,
} from "../lib/admin/impersonation-service";

describe("impersonation service", () => {
	afterEach(() => {
		vi.restoreAllMocks();
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
