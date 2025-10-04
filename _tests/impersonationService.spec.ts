import { describe, expect, it } from "vitest";
import {
        startImpersonationSession,
        stopImpersonationSession,
} from "../lib/admin/impersonation-service";

describe("impersonation service", () => {
        it("returns impersonated and impersonator identities from mock data", async () => {
                const payload = await startImpersonationSession({ userId: "2" });

                expect(payload).toEqual({
                        impersonatedUser: {
                                id: "2",
                                name: "Starter User",
                                email: "starter@example.com",
                        },
                        impersonator: {
                                id: "4",
                                name: "Platform Admin",
                                email: "platform.admin@example.com",
                        },
                });
        });

        it("falls back to another privileged user when the target is platform admin", async () => {
                const payload = await startImpersonationSession({ userId: "4" });

                expect(payload.impersonatedUser).toEqual({
                        id: "4",
                        name: "Platform Admin",
                        email: "platform.admin@example.com",
                });
                expect(payload.impersonator).toEqual({
                        id: "1",
                        name: "Admin User",
                        email: "admin@example.com",
                });
        });

        it("throws when the target user is missing", async () => {
                await expect(
                        startImpersonationSession({ userId: "missing" }),
                ).rejects.toThrow("User not found");
        });

        it("resolves when stopping impersonation", async () => {
                await expect(stopImpersonationSession()).resolves.toBeUndefined();
        });
});
