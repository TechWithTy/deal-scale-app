import { describe, expect, it } from "vitest";
import { marketingRedirect } from "@/lib/middleware/marketingRedirect";

function createRequest(pathname: string, auth?: unknown) {
        const url = new URL(pathname, "https://example.com");
        return {
                nextUrl: url as unknown as Parameters<typeof marketingRedirect>[0]["nextUrl"],
                auth,
        } as unknown as Parameters<typeof marketingRedirect>[0];
}

describe("middlewareHandler", () => {
        it("redirects authenticated users away from the marketing landing page", () => {
                const response = marketingRedirect(createRequest("/", {}));

                expect(response?.status).toBe(307);
                expect(response?.headers.get("location")).toBe("https://example.com/dashboard");
        });

        it("does not redirect anonymous users on marketing pages", () => {
                const response = marketingRedirect(createRequest("/", null));

                expect(response).toBeUndefined();
        });

        it("leaves protected routes to the default auth middleware", () => {
                const response = marketingRedirect(createRequest("/dashboard", null));

                expect(response).toBeUndefined();
        });
});
