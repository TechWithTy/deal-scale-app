import { describe, expect, it } from "vitest";

import { users as seedUsers } from "@/lib/mock-db";
import {
	applyDemoLinkOverrides,
	parseDemoLinkOverrides,
	selectSeedUser,
} from "@/app/(auth)/signin/_components/test_users/urlOverrides";
import {
	initializeEditableUsers,
	type EditableUser,
	type TestUser,
} from "@/app/(auth)/signin/_components/test_users/userHelpers";

const createEditableUsers = (): EditableUser[] =>
	initializeEditableUsers(seedUsers as unknown as TestUser[]);

describe("demo link overrides", () => {
	it("parses persona and goal overrides from URL params", () => {
		const params = new URLSearchParams(
			"demoUser=admin@example.com&persona=agent&goal=agent-sphere&company=Deal%20Scale&autoLogin=1",
		);
		const overrides = parseDemoLinkOverrides(params);

		expect(overrides).toBeTruthy();
		expect(overrides?.autoLogin).toBe(true);
		expect(overrides?.demoConfig?.companyName).toBe("Deal Scale");
		expect(overrides?.quickStartDefaults).toEqual({
			personaId: "agent",
			goalId: "agent-sphere",
		});

		const editableUsers = createEditableUsers();
		const seed = selectSeedUser(editableUsers, overrides!);
		expect(seed?.email).toBe("admin@example.com");

		const applied = applyDemoLinkOverrides(seed!, overrides!);
		expect(applied.demoConfig?.companyName).toBe("Deal Scale");
		expect(applied.demoConfig?.goal).toBe("Nurture your sphere");
		expect(applied.quickStartDefaults).toEqual({
			personaId: "agent",
			goalId: "agent-sphere",
		});
	});

	it("applies quota overrides while preserving reset intervals", () => {
		const params = new URLSearchParams(
			"demoUser=starter@example.com&aiAllotted=500&aiUsed=120&leadsAllotted=250&leadsUsed=200",
		);
		const overrides = parseDemoLinkOverrides(params);
		expect(overrides?.quotas).toEqual({
			aiAllotted: 500,
			aiUsed: 120,
			leadsAllotted: 250,
			leadsUsed: 200,
			skipAllotted: undefined,
			skipUsed: undefined,
		});

		const editableUsers = createEditableUsers();
		const seed = selectSeedUser(editableUsers, overrides!);
		const applied = applyDemoLinkOverrides(seed!, overrides!);

		expect(applied.aiCredits).toMatchObject({ allotted: 500, used: 120 });
		expect(applied.leadsCredits).toMatchObject({ allotted: 250, used: 200 });
		expect(applied.subscription.aiCredits.resetInDays).toBe(
			seed?.subscription.aiCredits.resetInDays,
		);
	});

	it("updates role and permissions when override provided", () => {
		const params = new URLSearchParams(
			"demoUser=free@example.com&role=admin&beta=true",
		);
		const overrides = parseDemoLinkOverrides(params);
		expect(overrides?.role).toBe("admin");
		expect(overrides?.isBetaTester).toBe(true);

		const editableUsers = createEditableUsers();
		const seed = selectSeedUser(editableUsers, overrides!);
		const applied = applyDemoLinkOverrides(seed!, overrides!);

		expect(applied.role).toBe("admin");
		expect(applied.permissionList).toContain("users:create");
		expect(applied.isBetaTester).toBe(true);
	});

	it("returns null when no relevant parameters provided", () => {
		const params = new URLSearchParams("callbackUrl=/dashboard");
		expect(parseDemoLinkOverrides(params)).toBeNull();
	});

	it("parses CRM provider overrides", () => {
		const params = new URLSearchParams(
			"demoUser=admin@example.com&crmProvider=hubspot",
		);
		const overrides = parseDemoLinkOverrides(params);
		expect(overrides?.demoConfig?.crmProvider).toBe("hubspot");

		const editableUsers = createEditableUsers();
		const seed = selectSeedUser(editableUsers, overrides!);
		const applied = applyDemoLinkOverrides(seed!, overrides!);
		expect(applied.demoConfig?.crmProvider).toBe("hubspot");
	});
});

