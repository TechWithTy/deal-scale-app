import { describe, expect, it } from "vitest";

import {
        formatAdminRole,
        isAdminAreaAuthorized,
        isClassicAdminRole,
        isClassicSupportRole,
        isPlatformAdminRole,
        isPlatformSupportRole,
} from "@/lib/admin/roles";

describe("admin role helpers", () => {
        it("authorizes platform admin and support roles", () => {
                expect(isAdminAreaAuthorized("platform_admin")).toBe(true);
                expect(isAdminAreaAuthorized("platform_support")).toBe(true);
        });

        it("denies member access to admin area", () => {
                expect(isAdminAreaAuthorized("member")).toBe(false);
        });

        it("distinguishes platform role categories", () => {
                expect(isPlatformAdminRole("platform_admin")).toBe(true);
                expect(isPlatformAdminRole("admin")).toBe(false);
                expect(isPlatformSupportRole("platform_support")).toBe(true);
                expect(isPlatformSupportRole("support")).toBe(false);
        });

        it("exposes classic admin and support guards", () => {
                expect(isClassicAdminRole("admin")).toBe(true);
                expect(isClassicAdminRole("platform_admin")).toBe(false);
                expect(isClassicSupportRole("support")).toBe(true);
                expect(isClassicSupportRole("platform_support")).toBe(false);
        });

        it("formats human readable role labels", () => {
                expect(formatAdminRole("platform_admin")).toBe("Platform Admin");
                expect(formatAdminRole("support")).toBe("Support Agent");
                expect(formatAdminRole(undefined)).toBe("Unknown");
        });
});
