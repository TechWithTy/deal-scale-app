import {
	getPublicApiBaseUrl,
	loginPublicApiServer,
} from "@/lib/api/public-api-server";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("public API server helpers", () => {
	const originalBaseUrl = process.env.DEAL_SCALE_API_BASE_URL;

	afterEach(() => {
		process.env.DEAL_SCALE_API_BASE_URL = originalBaseUrl;
		vi.unstubAllGlobals();
	});

	it("resolves the configured backend base URL", () => {
		process.env.DEAL_SCALE_API_BASE_URL = "https://backend.example/";

		expect(getPublicApiBaseUrl()).toBe("https://backend.example");
	});

	it("calls backend auth with an absolute URL on the server", async () => {
		process.env.DEAL_SCALE_API_BASE_URL = "https://backend.example";
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => {
				return new Response(JSON.stringify({ access_token: "token-123" }), {
					status: 200,
				});
			}),
		);

		await loginPublicApiServer("user@example.com", "password");

		const [url, init] = vi.mocked(fetch).mock.calls[0];
		expect(url).toBe("https://backend.example/api/v1/auth/login");
		expect(init?.method).toBe("POST");
	});
});
