import { describe, expect, it } from "vitest";
import { startImpersonationSession, stopImpersonationSession } from "../lib/admin/impersonation-service";

describe("mock impersonation service", () => {
        it("returns identities sourced from the mock database", async () => {
                const payload = await startImpersonationSession({ userId: "2" });

                expect(payload.impersonatedUser).toMatchObject({
                        id: "2",
                        email: "starter@example.com",
                });
                expect(payload.impersonator).toMatchObject({
                        id: "4",
                        email: "platform.admin@example.com",
                });
        });

        it("throws when the target user is missing", async () => {
                await expect(
                        startImpersonationSession({ userId: "missing" }),
                ).rejects.toThrow(/User not found/i);
        });

        it("resolves when stopping an impersonation session", async () => {
                await expect(stopImpersonationSession()).resolves.toBeUndefined();
        });
});
