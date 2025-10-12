import { describe, expect, it } from "vitest";
import authConfig from "@/auth.config";

describe("auth config session callback", () => {
        it("hydrates the session user identity from the token payload", async () => {
                const session = {
                        user: {
                                id: "original-id",
                                name: "Original Admin",
                                email: "admin@example.com",
                        },
                } as any;

                const token = {
                        sub: "impersonated-id",
                        name: "Impersonated User",
                        email: "impersonated@example.com",
                        role: "member",
                        impersonator: { id: "platform-admin", email: "platform.admin@example.com" },
                } as any;

                const result = await authConfig.callbacks?.session?.({ session, token } as any);

                expect(result?.user?.id).toBe("impersonated-id");
                expect(result?.user?.name).toBe("Impersonated User");
                expect(result?.user?.email).toBe("impersonated@example.com");
                expect(result?.user?.role).toBe("member");
                expect(result?.impersonator).toEqual({
                        id: "platform-admin",
                        email: "platform.admin@example.com",
                });
        });
});
