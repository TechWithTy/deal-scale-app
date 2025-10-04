import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/admin/impersonation/route";

const authMock = vi.hoisted(() => vi.fn());

vi.mock("@/auth", () => ({
        auth: authMock,
}));

describe("POST /api/admin/impersonation", () => {
        afterEach(() => {
                authMock.mockReset();
        });

        it("rejects impersonation attempts from non-admin accounts", async () => {
                authMock.mockResolvedValue({
                        user: { id: "2", role: "member" },
                });

                const request = new Request("http://localhost/api/admin/impersonation", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ userId: "3" }),
                });

                const response = await POST(request);

                expect(response.status).toBe(403);
                expect(await response.json()).toEqual({ error: "Not authorized" });
        });
});
