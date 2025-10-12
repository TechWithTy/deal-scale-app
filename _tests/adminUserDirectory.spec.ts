import { describe, expect, it } from "vitest";

import { listAdminUsers, getAdminDirectoryUser, getAdminActivityLog } from "@/lib/admin/user-directory";
import { users } from "@/lib/mock-db";

describe("admin user directory", () => {
        it("lists every mock db user in the admin directory", () => {
                const directory = listAdminUsers();
                expect(directory).toHaveLength(users.length);
                const directoryEmails = new Set(directory.map((entry) => entry.email));
                for (const user of users) {
                        expect(directoryEmails.has(user.email)).toBe(true);
                }
        });

        it("normalizes member roles to user for table display", () => {
                const directory = listAdminUsers();
                const starterUser = directory.find((entry) => entry.id === "2");
                expect(starterUser).toBeDefined();
                expect(starterUser?.role).toBe("user");
                expect(starterUser?.credits?.ai.allotted).toBe(users[1]?.subscription.aiCredits.allotted);
        });

        it("provides detailed directory information for impersonation views", () => {
                const platformAdmin = getAdminDirectoryUser("4");
                expect(platformAdmin).not.toBeNull();
                expect(platformAdmin?.name).toBe(users[3]?.name);
                expect(platformAdmin?.permissionList).toEqual(users[3]?.permissionList);
                expect(platformAdmin?.credits?.leads.used).toBe(users[3]?.subscription.leads.used);
        });

        it("returns a stable activity log for each user", () => {
                const events = getAdminActivityLog("5");
                expect(Array.isArray(events)).toBe(true);
                expect(events.length).toBeGreaterThan(0);
                expect(events[0]?.message).toContain("support");
        });
});
