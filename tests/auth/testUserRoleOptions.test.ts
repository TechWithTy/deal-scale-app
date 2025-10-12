import { describe, expect, it } from "vitest";

import { ROLE_SELECT_OPTIONS } from "@/app/(auth)/signin/_components/test_users/userHelpers";

const optionMap = new Map(ROLE_SELECT_OPTIONS.map((option) => [option.value, option.label]));

describe("test user role dropdown options", () => {
        it("exposes classic admin and support roles", () => {
                expect(optionMap.get("admin")).toMatch(/Classic/);
                expect(optionMap.get("support")).toMatch(/Classic/);
        });

        it("exposes platform admin and support roles", () => {
                expect(optionMap.get("platform_admin")).toMatch(/Platform/);
                expect(optionMap.get("platform_support")).toMatch(/Platform/);
        });

        it("retains the member option for standard users", () => {
                const memberOption = optionMap.get("member");
                expect(memberOption).toBe("Member");
        });
});
