import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
        redirect: vi.fn(),
}));

describe("HomePage redirects", () => {
        beforeEach(() => {
                vi.resetModules();
        });

        afterEach(() => {
                vi.restoreAllMocks();
        });

        it("redirects authenticated users to the dashboard", async () => {
                vi.doMock("@/auth", () => ({
                        auth: vi.fn().mockResolvedValue({
                                user: { id: "user-123" },
                        }),
                }));

                vi.doMock("@/constants/testingMode", () => ({
                        NEXT_PUBLIC_APP_TESTING_MODE: true,
                }));

                const HomePage = (await import("@/app/page")).default;
                await HomePage();

                const { redirect } = await import("next/navigation");
                expect(redirect).toHaveBeenCalledWith("/dashboard");
        });

        it("redirects guests to the sign-in page when testing mode is enabled", async () => {
                vi.doMock("@/auth", () => ({
                        auth: vi.fn().mockResolvedValue(null),
                }));

                vi.doMock("@/constants/testingMode", () => ({
                        NEXT_PUBLIC_APP_TESTING_MODE: true,
                }));

                const HomePage = (await import("@/app/page")).default;
                await HomePage();

                const { redirect } = await import("next/navigation");
                expect(redirect).toHaveBeenCalledWith("/signin");
        });

        it("redirects guests to the sign-in page when testing mode is disabled", async () => {
                vi.doMock("@/auth", () => ({
                        auth: vi.fn().mockResolvedValue(null),
                }));

                vi.doMock("@/constants/testingMode", () => ({
                        NEXT_PUBLIC_APP_TESTING_MODE: false,
                }));

                const HomePage = (await import("@/app/page")).default;
                await HomePage();

                const { redirect } = await import("next/navigation");
                expect(redirect).toHaveBeenLastCalledWith("/signin");
        });
});
