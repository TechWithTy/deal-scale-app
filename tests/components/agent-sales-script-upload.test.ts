import { readFileSync } from "node:fs";
import path from "node:path";
import { agentSchema } from "@/components/forms/agent/utils/schema";
import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("Agent sales script upload", () => {
	it("keeps text input and text-file upload wired to the sales script field", () => {
		const source = readFileSync(
			path.join(root, "components", "forms", "agent", "AgentDetailsForm.tsx"),
			"utf8",
		);
		const routeToursSource = readFileSync(
			path.join(
				root,
				"external",
				"interactive-avatar-nextjs-demo",
				"components",
				"tour",
				"tours",
				"dashboardRoutes.ts",
			),
			"utf8",
		);

		expect(source).toContain('name="salesScript"');
		expect(source).toContain("<Textarea");
		expect(source).toContain('type="file"');
		expect(source).toContain('accept=".txt,.md,text/plain,text/markdown"');
		expect(source).toContain("file.text()");
		expect(source).toContain('data-tour="agent-manager-script-upload"');
		expect(routeToursSource).toContain(
			"target: '[data-tour=\"agent-manager-script-upload\"]'",
		);
	});

	it("separates phone call and text message agent requirements", () => {
		const baseAgent = {
			name: "Outreach agent",
			campaignGoal: "Book qualified appointments",
			salesScript: "Hi {{firstName}}, this is our outreach message.",
			persona: "Clear and helpful",
		};

		expect(
			agentSchema.safeParse({
				...baseAgent,
				type: "phone-call",
			}).success,
		).toBe(false);

		expect(
			agentSchema.safeParse({
				...baseAgent,
				type: "phone-call",
				voice: "voice-1",
			}).success,
		).toBe(true);

		expect(
			agentSchema.safeParse({
				...baseAgent,
				type: "text-message",
			}).success,
		).toBe(true);

		expect(agentSchema.safeParse({ ...baseAgent, type: "phone" }).success).toBe(
			false,
		);
	});
});
