import { describe, expect, it } from "vitest";
import authConfig from "@/auth.config";

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
