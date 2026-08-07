import {
	createCampaignTemplatePublicApi,
	createSavedSearchPublicApi,
	createWorkflowTemplatePublicApi,
	deleteCampaignTemplatePublicApi,
	deleteSavedSearchPublicApi,
	deleteWorkflowTemplatePublicApi,
	listCampaignTemplates,
	listSavedSearches,
	listWorkflowTemplates,
	updateSavedSearchPublicApi,
} from "@/lib/api/public-api-saved-assets";
import {
	toCampaignTemplate,
	toSavedSearch,
	toWorkflowTemplate,
} from "@/lib/api/public-api-saved-assets-normalizers";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("public API saved assets client", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	function stubSuccess(payload: unknown = {}) {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => Response.json(payload)),
		);
	}

	it("calls BE-25 saved asset endpoints", async () => {
		stubSuccess({ items: [] });

		await listSavedSearches({ limit: 10 }, "token");
		await createSavedSearchPublicApi(
			{ name: "Buyers", definition: { source: "cashbuyers" } },
			"token",
		);
		await updateSavedSearchPublicApi(
			"search 1",
			{ name: "Updated", definition: { source: "lead_lists" } },
			"token",
		);
		await deleteSavedSearchPublicApi("search 1", 2, "token");
		await listCampaignTemplates({ scope: "organization" }, "token");
		await createCampaignTemplatePublicApi(
			{ name: "Campaign", definition: { channels: ["email"] } },
			"token",
		);
		await deleteCampaignTemplatePublicApi("campaign 1", 1, "token");
		await listWorkflowTemplates(undefined, "token");
		await createWorkflowTemplatePublicApi(
			{ name: "Workflow", definition: { trigger: "lead.created" } },
			"token",
		);
		await deleteWorkflowTemplatePublicApi("workflow 1", 3, "token");

		const calls = vi.mocked(fetch).mock.calls;
		expect(calls.map(([pathname]) => pathname)).toEqual([
			"/api/v1/saved-searches?limit=10",
			"/api/v1/saved-searches",
			"/api/v1/saved-searches/search%201",
			"/api/v1/saved-searches/search%201?version=2",
			"/api/v1/campaign-templates?scope=organization",
			"/api/v1/campaign-templates",
			"/api/v1/campaign-templates/campaign%201?version=1",
			"/api/v1/workflow-templates",
			"/api/v1/workflow-templates",
			"/api/v1/workflow-templates/workflow%201?version=3",
		]);
		expect((calls[0][1]?.headers as Headers).get("Authorization")).toBe(
			"Bearer token",
		);
		expect(calls[2][1]?.method).toBe("PATCH");
		expect(calls[3][1]?.method).toBe("DELETE");
	});

	it("normalizes backend saved assets into local saved asset types", () => {
		const baseAsset = {
			created_at: "2026-07-06T04:06:36.681813Z",
			id: "asset-1",
			name: "Asset",
			schema_version: 1,
			scope: "personal" as const,
			updated_at: "2026-07-06T04:06:39.902842Z",
			version: 2,
		};

		expect(
			toSavedSearch({
				...baseAsset,
				asset_type: "saved_search",
				definition: { source: "cashbuyers" },
			}),
		).toMatchObject({
			id: "asset-1",
			searchCriteria: { source: "cashbuyers" },
		});

		expect(
			toCampaignTemplate({
				...baseAsset,
				asset_type: "campaign_template",
				definition: {
					channels: ["email"],
					audience: {},
					messaging: {},
					schedule: {},
				},
			}),
		).toMatchObject({ campaignConfig: { channels: ["email"] } });

		expect(
			toWorkflowTemplate({
				...baseAsset,
				asset_type: "workflow_template",
				definition: {
					platform: "make",
					workflowConfig: { trigger: "lead.created" },
				},
			}),
		).toMatchObject({
			platform: "make",
			workflowConfig: { trigger: "lead.created" },
		});
	});
});
