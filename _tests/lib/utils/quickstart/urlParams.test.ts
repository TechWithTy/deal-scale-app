import { describe, it, expect } from "vitest";
import {
	validatePersonaIdParam,
	validateGoalIdParam,
	validateBooleanParam,
	parseQuickStartUrlParams,
	buildQuickStartUrl,
	clearQuickStartUrlParams,
	QUICKSTART_URL_PARAMS,
} from "@/lib/utils/quickstart/urlParams";

describe("validatePersonaIdParam", () => {
	it("should accept valid persona IDs", () => {
		expect(validatePersonaIdParam("investor")).toBe("investor");
		expect(validatePersonaIdParam("wholesaler")).toBe("wholesaler");
		expect(validatePersonaIdParam("agent")).toBe("agent");
		expect(validatePersonaIdParam("loan_officer")).toBe("loan_officer");
	});

	it("should handle case-insensitive input", () => {
		expect(validatePersonaIdParam("INVESTOR")).toBe("investor");
		expect(validatePersonaIdParam("Wholesaler")).toBe("wholesaler");
		expect(validatePersonaIdParam("  AGENT  ")).toBe("agent");
	});

	it("should reject invalid persona IDs", () => {
		expect(validatePersonaIdParam("invalid")).toBe(null);
		expect(validatePersonaIdParam("realtor")).toBe(null);
		expect(validatePersonaIdParam("")).toBe(null);
		expect(validatePersonaIdParam("123")).toBe(null);
	});

	it("should handle null/undefined", () => {
		expect(validatePersonaIdParam(null)).toBe(null);
		expect(validatePersonaIdParam(undefined)).toBe(null);
	});

	it("should trim whitespace", () => {
		expect(validatePersonaIdParam("  investor  ")).toBe("investor");
		expect(validatePersonaIdParam("\tinvestor\n")).toBe("investor");
	});
});

describe("validateGoalIdParam", () => {
	it("should accept valid goal IDs", () => {
		expect(validateGoalIdParam("investor-pipeline")).toBe("investor-pipeline");
		expect(validateGoalIdParam("wholesaler-dispositions")).toBe("wholesaler-dispositions");
		expect(validateGoalIdParam("agent-sphere")).toBe("agent-sphere");
		expect(validateGoalIdParam("lender-fund-fast")).toBe("lender-fund-fast");
	});

	it("should handle case-insensitive input", () => {
		expect(validateGoalIdParam("INVESTOR-PIPELINE")).toBe("investor-pipeline");
		expect(validateGoalIdParam("Agent-Sphere")).toBe("agent-sphere");
	});

	it("should reject invalid goal IDs", () => {
		expect(validateGoalIdParam("invalid-goal")).toBe(null);
		expect(validateGoalIdParam("agent-invalid")).toBe(null);
		expect(validateGoalIdParam("")).toBe(null);
	});

	it("should handle null/undefined", () => {
		expect(validateGoalIdParam(null)).toBe(null);
		expect(validateGoalIdParam(undefined)).toBe(null);
	});
});

describe("validateBooleanParam", () => {
	it("should accept truthy values", () => {
		expect(validateBooleanParam("true")).toBe(true);
		expect(validateBooleanParam("TRUE")).toBe(true);
		expect(validateBooleanParam("1")).toBe(true);
		expect(validateBooleanParam("yes")).toBe(true);
		expect(validateBooleanParam("YES")).toBe(true);
	});

	it("should reject falsy values", () => {
		expect(validateBooleanParam("false")).toBe(false);
		expect(validateBooleanParam("0")).toBe(false);
		expect(validateBooleanParam("no")).toBe(false);
		expect(validateBooleanParam("")).toBe(false);
	});

	it("should handle null/undefined", () => {
		expect(validateBooleanParam(null)).toBe(false);
		expect(validateBooleanParam(undefined)).toBe(false);
	});
});

describe("parseQuickStartUrlParams", () => {
	it("should parse URLSearchParams", () => {
		const searchParams = new URLSearchParams({
			quickstart_persona: "investor",
			quickstart_goal: "investor-pipeline",
			quickstart_open: "true",
		});

		const result = parseQuickStartUrlParams(searchParams);

		expect(result.personaId).toBe("investor");
		expect(result.goalId).toBe("investor-pipeline");
		expect(result.shouldOpen).toBe(true);
	});

	it("should parse plain object (Next.js searchParams)", () => {
		const searchParams = {
			quickstart_persona: "wholesaler",
			quickstart_goal: "wholesaler-dispositions",
		};

		const result = parseQuickStartUrlParams(searchParams);

		expect(result.personaId).toBe("wholesaler");
		expect(result.goalId).toBe("wholesaler-dispositions");
	});

	it("should handle array values (Next.js can pass arrays)", () => {
		const searchParams = {
			quickstart_persona: ["agent", "investor"], // First value should be used
			quickstart_goal: "agent-sphere",
		};

		const result = parseQuickStartUrlParams(searchParams);

		expect(result.personaId).toBe("agent");
		expect(result.goalId).toBe("agent-sphere");
	});

	it("should return nulls for missing params", () => {
		const searchParams = new URLSearchParams();

		const result = parseQuickStartUrlParams(searchParams);

		expect(result.personaId).toBe(null);
		expect(result.goalId).toBe(null);
		expect(result.shouldOpen).toBe(false);
	});

	it("should validate and reject invalid params", () => {
		const searchParams = new URLSearchParams({
			quickstart_persona: "invalid",
			quickstart_goal: "fake-goal",
		});

		const result = parseQuickStartUrlParams(searchParams);

		expect(result.personaId).toBe(null);
		expect(result.goalId).toBe(null);
	});

	it("should handle mismatched goal/persona combinations", () => {
		// Goal belongs to investor, but persona is agent
		const searchParams = new URLSearchParams({
			quickstart_persona: "agent",
			quickstart_goal: "investor-pipeline",
		});

		const result = parseQuickStartUrlParams(searchParams);

		// Should use goal's persona (more specific)
		expect(result.personaId).toBe("investor");
		expect(result.goalId).toBe("investor-pipeline");
	});

	it("should handle null/undefined input", () => {
		expect(parseQuickStartUrlParams(null)).toEqual({
			personaId: null,
			goalId: null,
			shouldOpen: false,
			templateId: null,
		});

		expect(parseQuickStartUrlParams(undefined)).toEqual({
			personaId: null,
			goalId: null,
			shouldOpen: false,
			templateId: null,
		});
	});
});

describe("buildQuickStartUrl", () => {
	it("should build URL with persona", () => {
		const url = buildQuickStartUrl("/dashboard", {
			personaId: "investor",
		});

		expect(url).toBe("/dashboard?quickstart_persona=investor");
	});

	it("should build URL with goal", () => {
		const url = buildQuickStartUrl("/dashboard", {
			goalId: "agent-sphere",
		});

		expect(url).toBe("/dashboard?quickstart_goal=agent-sphere");
	});

	it("should build URL with multiple params", () => {
		const url = buildQuickStartUrl("/dashboard", {
			personaId: "wholesaler",
			goalId: "wholesaler-dispositions",
			shouldOpen: true,
		});

		expect(url).toContain("quickstart_persona=wholesaler");
		expect(url).toContain("quickstart_goal=wholesaler-dispositions");
		expect(url).toContain("quickstart_open=true");
	});

	it("should return base path if no params", () => {
		const url = buildQuickStartUrl("/dashboard", {});

		expect(url).toBe("/dashboard");
	});

	it("should skip null/undefined values", () => {
		const url = buildQuickStartUrl("/dashboard", {
			personaId: "investor",
			goalId: null,
			shouldOpen: false,
		});

		expect(url).toBe("/dashboard?quickstart_persona=investor");
		expect(url).not.toContain("quickstart_goal");
		expect(url).not.toContain("quickstart_open");
	});
});

describe("clearQuickStartUrlParams", () => {
	it("should remove all QuickStart params", () => {
		const params = new URLSearchParams({
			quickstart_persona: "investor",
			quickstart_goal: "investor-pipeline",
			quickstart_open: "true",
			other_param: "keep-this",
		});

		const cleaned = clearQuickStartUrlParams(params);

		expect(cleaned.has("quickstart_persona")).toBe(false);
		expect(cleaned.has("quickstart_goal")).toBe(false);
		expect(cleaned.has("quickstart_open")).toBe(false);
		expect(cleaned.get("other_param")).toBe("keep-this");
	});

	it("should preserve non-QuickStart params", () => {
		const params = new URLSearchParams({
			quickstart_persona: "agent",
			tab: "campaigns",
			filter: "active",
		});

		const cleaned = clearQuickStartUrlParams(params);

		expect(cleaned.has("quickstart_persona")).toBe(false);
		expect(cleaned.get("tab")).toBe("campaigns");
		expect(cleaned.get("filter")).toBe("active");
	});
});

describe("Edge Cases", () => {
	it("should handle SQL injection attempts", () => {
		const malicious = "investor'; DROP TABLE users;--";
		expect(validatePersonaIdParam(malicious)).toBe(null);
	});

	it("should handle XSS attempts", () => {
		const malicious = "<script>alert('xss')</script>";
		expect(validatePersonaIdParam(malicious)).toBe(null);
	});

	it("should handle very long strings", () => {
		const veryLong = "a".repeat(10000);
		expect(validatePersonaIdParam(veryLong)).toBe(null);
	});

	it("should handle special characters", () => {
		expect(validatePersonaIdParam("investor!@#$%")).toBe(null);
		// Note: "investor\n\r\t" gets trimmed to "investor" which IS valid
		expect(validatePersonaIdParam("investor\n\r\t")).toBe("investor");
	});

	it("should handle unicode characters", () => {
		expect(validatePersonaIdParam("投资者")).toBe(null);
		expect(validatePersonaIdParam("🏠")).toBe(null);
	});

	it("should handle empty searchParams object", () => {
		const result = parseQuickStartUrlParams({});
		expect(result.personaId).toBe(null);
		expect(result.goalId).toBe(null);
	});
});

describe("Priority and Validation", () => {
	it("should prioritize goal over persona when both present", () => {
		const searchParams = new URLSearchParams({
			quickstart_persona: "agent",
			quickstart_goal: "investor-pipeline", // Belongs to investor, not agent
		});

		const result = parseQuickStartUrlParams(searchParams);

		// Should use investor (from goal) not agent (from param)
		expect(result.personaId).toBe("investor");
		expect(result.goalId).toBe("investor-pipeline");
	});

	it("should accept matching goal/persona combination", () => {
		const searchParams = new URLSearchParams({
			quickstart_persona: "agent",
			quickstart_goal: "agent-sphere",
		});

		const result = parseQuickStartUrlParams(searchParams);

		expect(result.personaId).toBe("agent");
		expect(result.goalId).toBe("agent-sphere");
	});

	it("should handle only persona without goal", () => {
		const searchParams = new URLSearchParams({
			quickstart_persona: "wholesaler",
		});

		const result = parseQuickStartUrlParams(searchParams);

		expect(result.personaId).toBe("wholesaler");
		expect(result.goalId).toBe(null);
	});

	it("should handle only goal without persona", () => {
		const searchParams = new URLSearchParams({
			quickstart_goal: "lender-fund-fast",
		});

		const result = parseQuickStartUrlParams(searchParams);

		// Should infer persona from goal
		expect(result.personaId).toBe(null);
		expect(result.goalId).toBe("lender-fund-fast");
	});
});

