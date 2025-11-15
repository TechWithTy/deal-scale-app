import { describe, expect, it } from "vitest";

import { GET } from "@/app/api/mobile/webviews/route";
import { getMobileWebviewManifests } from "@/lib/config/mobile/webviews";

describe("GET /api/mobile/webviews", () => {
	it("returns the WebView manifest catalogue for the mobile shell", async () => {
		const response = await GET();

		expect(response.status).toBe(200);
		expect(response.headers.get("cache-control")).toBe(
			"public, s-maxage=60, stale-while-revalidate=120",
		);

		const payload = await response.json();
		const manifests = getMobileWebviewManifests();

		expect(payload).toEqual({
			webviews: manifests.map((manifest) => ({
				id: manifest.id,
				title: manifest.title,
				description: manifest.description,
				uri: manifest.uri,
				allowedOrigins: manifest.allowedOrigins,
				offlineFallbackPath: manifest.offlineFallbackPath ?? null,
				featureFlags: manifest.featureFlags,
				analytics: manifest.analytics ?? null,
				allowedMessagingTopics: manifest.allowedMessagingTopics,
			})),
		});
	});
});











