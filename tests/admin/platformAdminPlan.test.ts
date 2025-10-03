import { describe, expect, it } from "vitest";

import { createPlatformAdminPlan } from "@/lib/admin/platformAdminPlan";

describe("createPlatformAdminPlan", () => {
        const plan = createPlatformAdminPlan();

        it("includes the admin layout access scenario", () => {
                const adminLayout = plan.find((item) =>
                        item.userStory.startsWith("As a developer, I need to create a role-aware admin layout"),
                );
                expect(adminLayout).toBeDefined();
                expect(adminLayout?.acceptanceCriteria).toContain(
                        "Given a user's JWT contains a 'role' claim ('support' or 'admin')",
                );
        });

        it("covers the impersonation flow and provisioning retry", () => {
                const impersonation = plan.find((item) =>
                        item.userStory.startsWith("As a Platform Admin, I want to impersonate a user"),
                );
                const provisioning = plan.find((item) =>
                        item.userStory.startsWith("As a Support Agent, I want to click a button to retry a failed N8N provisioning"),
                );
                expect(impersonation?.acceptanceCriteria.at(-1)).toContain("Impersonating");
                expect(provisioning?.acceptanceCriteria).toContain(
                        "Then an API call is made to /api/v1/admin/users/{userId}/retry-provisioning and a success <Toast> is shown.",
                );
        });

        it("returns immutable plan items", () => {
                const [first] = plan;
                expect(() => {
                        if (!first) throw new Error("No plan item available");
                        // @ts-expect-error - ensure the plan objects are treated as readonly in tests
                        first.userStory = "mutated";
                }).toThrowError();
        });
});
