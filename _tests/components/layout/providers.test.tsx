import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import React, { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";

vi.mock("next/script", () => ({
        __esModule: true,
        default: ({ children, ...props }: { children?: ReactNode }) => (
                <script data-mocked-script {...props}>
                        {children}
                </script>
        ),
}));

vi.mock("@/components/analytics/PostHogProviderBridge", () => ({
        __esModule: true,
        default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/ui/sonner", () => ({
        Toaster: () => <div data-testid="toaster" />, 
}));

vi.mock("@/components/layout/ThemeToggle/theme-provider", () => ({
        __esModule: true,
        default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("Providers", () => {
        beforeEach(() => {
                vi.stubEnv("NEXT_PUBLIC_ENABLE_CLARITY", "false");
                vi.stubEnv("NEXT_PUBLIC_CLARITY_ID", "");
        });

        afterEach(() => {
                vi.unstubAllEnvs();
                document.body.innerHTML = "";
                document.head.innerHTML = "";
        });

        it("does not render the clarity script when disabled", async () => {
                const Providers = (await import("@/components/layout/providers")).default;

                const container = document.createElement("div");
                document.body.appendChild(container);
                const root = createRoot(container);

                act(() => {
                        root.render(
                                <Providers session={null}>
                                        <div>content</div>
                                </Providers>,
                        );
                });

                expect(document.querySelector('[data-testid="toaster"]')).not.toBeNull();
                expect(document.querySelector("script[data-mocked-script][id='ms-clarity']")).toBeNull();

                act(() => {
                        root.unmount();
                });
                container.remove();
        });

        it("marks the clarity script as lazily loaded when enabled", async () => {
                vi.stubEnv("NEXT_PUBLIC_ENABLE_CLARITY", "true");
                vi.stubEnv("NEXT_PUBLIC_CLARITY_ID", "ABC123");
                const Providers = (await import("@/components/layout/providers")).default;

                const container = document.createElement("div");
                document.body.appendChild(container);
                const root = createRoot(container);

                act(() => {
                        root.render(
                                <Providers session={null}>
                                        <div>content</div>
                                </Providers>,
                        );
                });

                const script = document.querySelector<HTMLScriptElement>("script[data-mocked-script][id='ms-clarity']");
                expect(script).not.toBeNull();
                expect(script?.getAttribute("strategy")).toBe("lazyOnload");

                act(() => {
                        root.unmount();
                });
                container.remove();
        });
});
