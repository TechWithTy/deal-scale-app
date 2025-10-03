import { describe, expect, it } from "vitest";

import { users } from "@/lib/mock-db";

const roleSet = new Set(users.map((user) => user.role));

describe("platform admin user seeds", () => {
        it("includes a platform admin test user", () => {
                expect(roleSet.has("platform_admin")).toBe(true);
        });

        it("includes a platform support test user", () => {
                expect(roleSet.has("platform_support")).toBe(true);
        });

        it("retains existing admin roles", () => {
                expect(roleSet.has("admin")).toBe(true);
                expect(roleSet.has("member")).toBe(true);
        });
});
