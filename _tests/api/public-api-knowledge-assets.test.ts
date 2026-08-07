import {
	createKnowledgeAsset,
	deleteKnowledgeAsset,
	getKnowledgeAsset,
	getKnowledgeAssetDownloadUrl,
	listKnowledgeAssets,
	processKnowledgeAsset,
	updateKnowledgeAsset,
} from "@/lib/api/public-api-knowledge-assets";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("public API knowledge assets client", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	function stubSuccess(payload: unknown = {}) {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => Response.json(payload)),
		);
	}

	it("calls BE-26 knowledge asset lifecycle endpoints", async () => {
		stubSuccess({ id: "asset-1", version: 2 });

		await listKnowledgeAssets(
			{ asset_type: "sales_script", limit: 10, status: "ready" },
			"token",
		);
		await createKnowledgeAsset(
			{
				asset_type: "sales_script",
				name: "Seller Script",
				mime_type: "text/plain",
				size_bytes: 128,
				metadata: { tags: ["seller"], source: "profile" },
			},
			"token",
		);
		await getKnowledgeAsset("asset 1", "token");
		await updateKnowledgeAsset(
			"asset 1",
			{ name: "Updated", version: 2 },
			"token",
		);
		await processKnowledgeAsset("asset 1", 3, "token");
		await getKnowledgeAssetDownloadUrl("asset 1", "token");
		await deleteKnowledgeAsset("asset 1", 4, "token");

		const calls = vi.mocked(fetch).mock.calls;
		expect(calls.map(([pathname]) => pathname)).toEqual([
			"/api/v1/knowledge-assets?asset_type=sales_script&limit=10&status=ready",
			"/api/v1/knowledge-assets",
			"/api/v1/knowledge-assets/asset%201",
			"/api/v1/knowledge-assets/asset%201",
			"/api/v1/knowledge-assets/asset%201/process",
			"/api/v1/knowledge-assets/asset%201/download-url",
			"/api/v1/knowledge-assets/asset%201?version=4",
		]);
		expect((calls[0][1]?.headers as Headers).get("Authorization")).toBe(
			"Bearer token",
		);
		expect(calls[1][1]?.method).toBe("POST");
		expect(calls[3][1]?.method).toBe("PATCH");
		expect(calls[4][1]?.method).toBe("POST");
		expect(calls[6][1]?.method).toBe("DELETE");
		expect(JSON.parse(String(calls[4][1]?.body))).toEqual({ version: 3 });
	});
});
