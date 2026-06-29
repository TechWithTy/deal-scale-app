import { proxyPublicApiRequest } from "@/lib/api/public-api-proxy";
import type { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const originalApiBaseUrl = process.env.DEAL_SCALE_API_BASE_URL;
const originalPublicApiBaseUrl =
	process.env.NEXT_PUBLIC_DEAL_SCALE_API_BASE_URL;

function makeRequest(
	url: string,
	init: { body?: unknown; method?: string } = {},
) {
	const method = init.method ?? "GET";
	const request = new Request(url, {
		body: init.body ? JSON.stringify(init.body) : undefined,
		headers: init.body ? { "Content-Type": "application/json" } : undefined,
		method,
	});

	return Object.assign(request, { nextUrl: new URL(url) }) as NextRequest;
}

describe("public API proxy", () => {
	beforeEach(() => {
		process.env.DEAL_SCALE_API_BASE_URL = "https://backend.example";
		process.env.NEXT_PUBLIC_DEAL_SCALE_API_BASE_URL = undefined;
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => {
				return new Response(JSON.stringify({ ok: true }), {
					headers: {
						"Content-Length": "12",
						"Content-Type": "application/json",
					},
					status: 202,
				});
			}),
		);
	});

	afterEach(() => {
		process.env.DEAL_SCALE_API_BASE_URL = originalApiBaseUrl;
		process.env.NEXT_PUBLIC_DEAL_SCALE_API_BASE_URL = originalPublicApiBaseUrl;
		vi.unstubAllGlobals();
	});

	it("forwards documented API requests to the configured backend", async () => {
		const response = await proxyPublicApiRequest(
			makeRequest("http://localhost:3000/api/v1/auth/login?next=dashboard", {
				body: { email: "user@example.com", password: "password" },
				method: "POST",
			}),
		);

		const fetchMock = vi.mocked(fetch);
		const [url, init] = fetchMock.mock.calls[0];

		expect(response.status).toBe(202);
		expect(response.headers.get("Content-Length")).toBeNull();
		expect(String(url)).toBe(
			"https://backend.example/api/v1/auth/login?next=dashboard",
		);
		expect(init?.method).toBe("POST");
		expect(init?.body).toBeInstanceOf(ArrayBuffer);
	});

	it("returns 404 for paths missing from the OpenAPI contract", async () => {
		const response = await proxyPublicApiRequest(
			makeRequest("http://localhost:3000/api/v1/not-in-the-spec"),
		);

		await expect(response.json()).resolves.toEqual({
			error: "API route is not documented",
			path: "/api/v1/not-in-the-spec",
		});
		expect(response.status).toBe(404);
		expect(fetch).not.toHaveBeenCalled();
	});

	it("returns 405 for unsupported methods on documented paths", async () => {
		const response = await proxyPublicApiRequest(
			makeRequest("http://localhost:3000/api/v1/auth/login", {
				method: "PUT",
			}),
		);

		await expect(response.json()).resolves.toEqual({
			allowed_methods: ["POST"],
			error: "Method not allowed",
		});
		expect(response.headers.get("Allow")).toBe("POST");
		expect(response.status).toBe(405);
		expect(fetch).not.toHaveBeenCalled();
	});

	it("refuses to proxy to the current Next.js origin", async () => {
		process.env.DEAL_SCALE_API_BASE_URL = "http://localhost:3000";

		const response = await proxyPublicApiRequest(
			makeRequest("http://localhost:3000/api/v1/auth/profile-setup"),
		);

		await expect(response.json()).resolves.toEqual({
			error: "API proxy target cannot be the current Next.js origin",
		});
		expect(response.status).toBe(508);
		expect(fetch).not.toHaveBeenCalled();
	});
});
