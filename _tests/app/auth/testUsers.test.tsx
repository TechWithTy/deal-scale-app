import { beforeEach, describe, expect, it, vi } from "vitest";

import { users as seedUsers } from "@/lib/mock-db";
import {
	initializeEditableUsers,
	handleLogin,
	type EditableUser,
} from "@/app/(auth)/signin/_components/test_users/userHelpers";

vi.mock("next-auth/react", () => ({
	signIn: vi.fn(() => Promise.resolve({ ok: true })),
}));

vi.mock("sonner", () => ({
	toast: {
		error: vi.fn(),
	},
}));

const { signIn } = await import("next-auth/react");

const cloneSeedUser = (index: number): EditableUser => {
	const base = JSON.parse(JSON.stringify(seedUsers[index])) as EditableUser;
	return initializeEditableUsers([
		{
			...base,
			password: base.password ?? "password123",
		},
	])[0];
};

describe("demo test user helpers", () => {
	beforeEach(() => {
		vi.mocked(signIn).mockClear();
	});

	it("serializes quickstart defaults derived from the current demo config", async () => {
		const editable = cloneSeedUser(1);
		editable.demoConfig = {
			...editable.demoConfig,
			goal: "Source new inventory across counties",
		};

		await handleLogin(editable);

		expect(signIn).toHaveBeenCalledTimes(1);
		const params = vi.mocked(signIn).mock.calls[0]?.[1] ?? {};
		expect(params?.customUserData).toBeTypeOf("string");
		const payload = JSON.parse(params.customUserData as string);

		expect(payload.quickStartDefaults).toEqual({
			personaId: "wholesaler",
			goalId: "wholesaler-acquisitions",
		});
		expect(payload.demoConfig.goal).toBe("Source new inventory across counties");
		expect(payload.isFreeTier).toBe(false);
		expect(params.isFreeTier).toBe("false");
		expect(params.isCustomUser).toBeDefined();
	});

	it("keeps editable users in sync with derived quickstart defaults", () => {
		const editable = cloneSeedUser(2);
		editable.demoConfig = {
			...editable.demoConfig,
			clientType: "loan_officer",
			goal: "Fund loans faster for broker partners",
		};

		const [updated] = initializeEditableUsers([editable]);

		expect(updated.quickStartDefaults).toEqual({
			personaId: "loan_officer",
			goalId: "lender-fund-fast",
		});
	});

	it("serializes free tier overrides when logging in", async () => {
		const editable = cloneSeedUser(2);
		editable.isFreeTier = true;

		await handleLogin(editable);

		const params = vi.mocked(signIn).mock.calls[0]?.[1] ?? {};
		expect(params.isFreeTier).toBe("true");

		const payload = JSON.parse(params.customUserData as string);
		expect(payload.isFreeTier).toBe(true);
	});
});
