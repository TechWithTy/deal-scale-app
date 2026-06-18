import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const chartsPagePath = path.join(
	root,
	"app",
	"dashboard",
	"charts",
	"page.tsx",
);
const tourHelpersPath = path.join(
	root,
	"external",
	"interactive-avatar-nextjs-demo",
	"components",
	"tour",
	"tourHelpers.ts",
);
const dashboardRoutesPath = path.join(
	root,
	"external",
	"interactive-avatar-nextjs-demo",
	"components",
	"tour",
	"tours",
	"dashboardRoutes.ts",
);
const tabComponentPaths = [
	path.join(
		root,
		"app",
		"dashboard",
		"charts",
		"components",
		"LeadsAnalyticsTab.tsx",
	),
	path.join(
		root,
		"app",
		"dashboard",
		"charts",
		"components",
		"AIAgentsTab.tsx",
	),
	path.join(
		root,
		"app",
		"dashboard",
		"charts",
		"components",
		"AdvancedAnalyticsTab.tsx",
	),
] as const;

const requiredTourTargets = [
	"charts-refresh",
	"charts-tab-overview",
	"charts-tab-leads",
	"charts-tab-ai-agents",
	"charts-tab-advanced",
	"charts-campaign-performance",
	"charts-lead-trends",
	"charts-leads-summary",
	"charts-leads-mix",
	"charts-leads-quality",
	"charts-leads-breakdown",
	"charts-ai-overview",
	"charts-ai-performance",
	"charts-ai-automation",
	"charts-ai-pro-insights",
	"charts-ai-weekly",
	"charts-advanced-ai-roi",
	"charts-advanced-predictive",
	"charts-advanced-efficiency",
	"charts-advanced-attribution",
] as const;

describe("charts guided tour", () => {
	it("keeps chart tour targets mounted in the route and tab components", () => {
		const source = [
			readFileSync(chartsPagePath, "utf8"),
			...tabComponentPaths.map((filePath) => readFileSync(filePath, "utf8")),
		].join("\n");

		for (const target of requiredTourTargets) {
			expect(source, target).toContain(`data-tour="${target}"`);
		}
	});

	it("switches chart tabs through the tour event before scrolling targets", () => {
		const helpersSource = readFileSync(tourHelpersPath, "utf8");
		const routesSource = readFileSync(dashboardRoutesPath, "utf8");

		expect(helpersSource).toContain("openDashboardChartsTab");
		expect(helpersSource).toContain("tour-open-charts-tab");
		expect(readFileSync(chartsPagePath, "utf8")).toContain(
			"handleTourOpenChartsTab",
		);
		expect(routesSource).toContain("chartsTabStep");
		expect(routesSource).toContain('tab: "leads"');
		expect(routesSource).toContain('tab: "ai-agents"');
		expect(routesSource).toContain('tab: "advanced"');
	});
});
