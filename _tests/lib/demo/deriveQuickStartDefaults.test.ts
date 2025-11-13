import { describe, expect, it } from "vitest";

import type { DemoConfig } from "@/types/user";
import type { QuickStartDefaults } from "@/types/userProfile";
import { deriveQuickStartDefaults } from "@/lib/demo/normalizeDemoPayload";

const buildConfig = (overrides: Partial<DemoConfig>): DemoConfig => ({
	companyName: "Demo Co",
	companyLogo: "https://example.com/logo.png",
	clientType: "agent",
	goal: "Generate 50 leads/month",
	...overrides,
});

describe("deriveQuickStartDefaults", () => {
	it("maps agent demo configs to agent persona and nurture goal", () => {
		const result = deriveQuickStartDefaults({
			demoConfig: buildConfig({
				clientType: "Agent",
				goal: "Generate 50 leads/month from my sphere",
			}),
		});

		expect(result).toEqual<QuickStartDefaults>({
			personaId: "agent",
			goalId: "agent-sphere",
		});
	});

	it("detects wholesaler disposition goals from free-form text", () => {
		const result = deriveQuickStartDefaults({
			demoConfig: buildConfig({
				clientType: "wholesaler",
				goal: "Distribute new contracts to VIP buyers fast",
			}),
		});

		expect(result).toEqual<QuickStartDefaults>({
			personaId: "wholesaler",
			goalId: "wholesaler-dispositions",
		});
	});

	it("infers investor research goals even when clientType is missing", () => {
		const result = deriveQuickStartDefaults({
			demoConfig: buildConfig({
				clientType: undefined,
				goal: "Research a new market and model deals",
			}),
		});

		expect(result).toEqual<QuickStartDefaults>({
			personaId: "investor",
			goalId: "investor-market",
		});
	});

	it("falls back to persona-only defaults when goal is ambiguous", () => {
		const result = deriveQuickStartDefaults({
			demoConfig: buildConfig({
				clientType: "loan_officer",
				goal: "Grow the business",
			}),
		});

		expect(result).toEqual<QuickStartDefaults>({
			personaId: "loan_officer",
		});
	});

	it("uses fallback defaults when demo config cannot be mapped", () => {
		const fallback: QuickStartDefaults = {
			personaId: "agent",
			goalId: "agent-expansion",
		};

		const result = deriveQuickStartDefaults({
			demoConfig: buildConfig({ clientType: undefined, goal: undefined }),
			fallback,
		});

		expect(result).toBe(fallback);
	});
});
