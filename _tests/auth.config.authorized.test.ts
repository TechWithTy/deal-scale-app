import { describe, expect, it } from "vitest";
import authConfig from "@/auth.config";
import { users as seedUsers } from "@/lib/mock-db";

function createRequest(pathname: string) {
        return {
                nextUrl: new URL(`https://example.com${pathname}`),
        } as any;
}

describe("auth config authorized callback", () => {
        const authorized = authConfig.callbacks?.authorized!;

        it("redirects anonymous visitors away from the admin area", () => {
                const result = authorized({ auth: null, request: createRequest("/admin") });
                expect(result).toBeInstanceOf(Response);
                expect((result as Response).status).toBe(302);
                const location = (result as Response).headers.get("location");
                expect(location).toContain("/signin");
                expect(location).toContain("callbackUrl=");
        });

        it("redirects non-admin members back to the dashboard", () => {
                const result = authorized({
                        auth: { user: { role: "member" } } as any,
                        request: createRequest("/admin/users"),
                });

                expect(result).toBeInstanceOf(Response);
                expect((result as Response).headers.get("location")).toBe("https://example.com/dashboard");
        });
});

describe("auth config credentials authorize", () => {
const credentialsProvider = authConfig.providers?.find(
	(provider) => typeof (provider as any).options?.authorize === "function",
) as {
	options: {
		authorize: (credentials: Record<string, unknown>) => Promise<any>;
	};
};

	it("merges custom payload overrides before issuing the session user", async () => {
		const starter = seedUsers[1];
		const customPayload = {
			...starter,
			tier: "Starter" as const,
			quickStartDefaults: {
				personaId: "wholesaler" as const,
				goalId: "wholesaler-acquisitions" as const,
			},
			demoConfig: {
				...starter.demoConfig,
				companyLogo: "https://example.com/brand.svg",
			},
			quotas: {
				ai: { allotted: 300, used: 150, resetInDays: 7 },
				leads: { allotted: 120, used: 40, resetInDays: 30 },
				skipTraces: { allotted: 40, used: 10, resetInDays: 30 },
			},
			subscription: {
				...starter.subscription,
				aiCredits: { allotted: 300, used: 150, resetInDays: 7 },
				leads: { allotted: 120, used: 40, resetInDays: 30 },
				skipTraces: { allotted: 40, used: 10, resetInDays: 30 },
			},
			isBetaTester: true,
			isPilotTester: false,
			isFreeTier: true,
		};

		const result = await credentialsProvider.options.authorize({
			email: starter.email,
			password: starter.password,
			role: starter.role,
			tier: "Starter",
			permissions: JSON.stringify(starter.permissions),
			aiAllotted: "300",
			aiUsed: "150",
			leadsAllotted: "120",
			leadsUsed: "40",
			skipAllotted: "40",
			skipUsed: "10",
			isBetaTester: "true",
			isPilotTester: "false",
			isFreeTier: "true",
			customUserData: JSON.stringify(customPayload),
			isCustomUser: "false",
		} as any);

		expect(result).toBeTruthy();
		expect(result.tier).toBe("Starter");
		expect(result.quickStartDefaults).toEqual({
			personaId: "wholesaler",
		goalId: "wholesaler-dispositions",
		});
		expect(result.demoConfig?.companyLogo).toBe("https://example.com/brand.svg");
	expect(result.quotas.ai).toEqual({ allotted: 300, used: 150, resetInDays: 30 });
		expect(result.isFreeTier).toBe(true);
	});
});
