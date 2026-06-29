import {
	PublicApiError,
	getCurrentUserProfile,
	getPublicApiSupportLabel,
	isProviderUnavailable,
	loginPublicApi,
	publicApiFetch,
} from "@/lib/api/public-api-client";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("public API client", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("adds JSON and bearer headers for typed requests", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => {
				return new Response(JSON.stringify({ id: "user-1" }), {
					status: 200,
				});
			}),
		);

		await getCurrentUserProfile("token-123");

		const [, init] = vi.mocked(fetch).mock.calls[0];
		const headers = init?.headers as Headers;

		expect(headers.get("Accept")).toBe("application/json");
		expect(headers.get("Authorization")).toBe("Bearer token-123");
	});

	it("logs in through the public API auth endpoint", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => {
				return new Response(JSON.stringify({ access_token: "token-123" }), {
					status: 200,
				});
			}),
		);

		const response = await loginPublicApi("user@example.com", "password");

		expect(response.access_token).toBe("token-123");
		const [pathname, init] = vi.mocked(fetch).mock.calls[0];
		expect(pathname).toBe("/api/v1/auth/login");
		expect(init?.method).toBe("POST");
		expect(JSON.parse(String(init?.body))).toEqual({
			email: "user@example.com",
			password: "password",
		});
	});

	it("turns FastAPI error envelopes into supportable errors", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => {
				return new Response(
					JSON.stringify({
						error: {
							code: "SERVER_ERROR",
							message: "Failed to get profile setup",
						},
						path: "/api/v1/auth/profile-setup",
						request_id: "req-123",
					}),
					{ status: 500, statusText: "Internal Server Error" },
				);
			}),
		);

		await expect(
			publicApiFetch("/api/v1/auth/profile-setup"),
		).rejects.toMatchObject({
			code: "SERVER_ERROR",
			kind: "server",
			message: "Failed to get profile setup",
			path: "/api/v1/auth/profile-setup",
			requestId: "req-123",
			status: 500,
		});
	});

	it("classifies provider configuration failures", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => {
				return new Response(
					JSON.stringify({
						error: {
							code: "PROVIDER_NOT_CONFIGURED",
							message: "USPS is not configured",
						},
						request_id: "req-provider",
					}),
					{ status: 503 },
				);
			}),
		);

		try {
			await publicApiFetch("/api/v1/usps/verify-address");
			throw new Error("Expected request to fail");
		} catch (error) {
			expect(error).toBeInstanceOf(PublicApiError);
			expect(isProviderUnavailable(error)).toBe(true);
			expect(getPublicApiSupportLabel(error)).toBe(
				"USPS is not configured (request req-provider)",
			);
		}
	});

	it.each([
		"PROVIDER_NOT_CONFIGURED",
		"PROVIDER_UNAVAILABLE",
		"SERVICE_UNAVAILABLE",
	])("classifies %s by its stable error code", async (code) => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => {
				return new Response(
					JSON.stringify({ error: { code, message: "Unavailable" } }),
					{ status: 503 },
				);
			}),
		);

		await expect(publicApiFetch("/api/v1/provider")).rejects.toMatchObject({
			code,
			kind: "provider_unavailable",
		});
	});

	it("does not classify an uncoded 503 as a provider state", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => {
				return new Response(JSON.stringify({ error: { message: "Failed" } }), {
					status: 503,
				});
			}),
		);

		await expect(publicApiFetch("/api/v1/provider")).rejects.toMatchObject({
			kind: "server",
		});
	});

	it("normalizes validation detail arrays", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => {
				return new Response(
					JSON.stringify({
						detail: [{ msg: "Field required" }, { msg: "Invalid value" }],
					}),
					{ status: 422 },
				);
			}),
		);

		await expect(publicApiFetch("/api/v1/example")).rejects.toMatchObject({
			kind: "validation",
			message: "Field required; Invalid value",
		});
	});
});
