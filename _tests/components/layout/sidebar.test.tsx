import React, { type ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { act } from "react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { useNavbarStore } from "@/lib/stores/dashboard/navbarStore";
import { useSessionStore } from "@/lib/stores/user/useSessionStore";

vi.mock("next/link", () => ({
        __esModule: true,
        default: ({ children, ...rest }: { children: ReactNode }) => (
                <a {...rest}>{children}</a>
        ),
}));

vi.mock("next/image", () => ({
        __esModule: true,
        default: ({ alt, ...rest }: { alt?: string }) => (
                <img alt={alt} {...rest} />
        ),
}));

vi.mock("external/crud-toggle/components/CrudToggle", () => ({
        CrudToggle: () => null,
}));

vi.mock("external/credit-view-purchase/components/CreditsSummary", () => ({
        CreditsSummary: () => <div data-testid="credits-summary" />,
}));

vi.mock("@/components/dashboard-nav", () => ({
        DashboardNav: ({ items }: { items: unknown[] }) => (
                <nav data-testid="dashboard-nav" data-count={items?.length ?? 0} />
        ),
}));

let Sidebar: typeof import("@/components/layout/sidebar").default;

beforeAll(async () => {
        ({ default: Sidebar } = await import("@/components/layout/sidebar"));
});

describe("Sidebar", () => {
        beforeEach(() => {
                act(() => {
                        useSessionStore.getState().clear();
                        useNavbarStore.setState({ isSidebarMinimized: false });
                });
        });

        it("displays the impersonated session identity even with fallback user data", () => {
                act(() => {
                        useSessionStore.getState().setFromSession({
                                user: {
                                        id: "impersonated-id",
                                        name: "Admin User",
                                        email: "admin.user@example.com",
                                        role: "member",
                                        permissions: ["leads:read"],
                                        subscription: {
                                                aiCredits: { allotted: 100, used: 10 },
                                                leads: { allotted: 50, used: 5 },
                                                skipTraces: { allotted: 25, used: 2 },
                                        },
                                },
                        } as any);
                });

                const fallbackUser = {
                        email: "platform.admin@example.com",
                        subscription: {
                                aiCredits: { allotted: 0, used: 0 },
                                leads: { allotted: 0, used: 0 },
                                skipTraces: { allotted: 0, used: 0 },
                        },
                } as any;

                render(<Sidebar user={fallbackUser} />);

                expect(screen.getByTestId("sidebar-role").textContent).toMatch(
                        /role:\s*member/i,
                );
                expect(screen.getByTestId("sidebar-email").textContent).toContain(
                        "admin.user@example.com",
                );
        });

		it("uses the demo company logo when provided in the session", () => {
			const companyLogo = "https://example.com/brand.svg";
			act(() => {
				useSessionStore.getState().setFromSession({
					user: {
						id: "demo-user",
						email: "demo@example.com",
						role: "member",
						permissions: [],
						permissionMatrix: {},
						subscription: {
							aiCredits: { allotted: 0, used: 0 },
							leads: { allotted: 0, used: 0 },
							skipTraces: { allotted: 0, used: 0 },
						},
						demoConfig: {
							companyName: "Demo Co",
							companyLogo,
						},
					},
				} as any);
			});

			render(<Sidebar user={null} />);

			const logo = screen.getByTestId("sidebar-logo") as HTMLImageElement;
			expect(logo?.getAttribute("src")).toBe(companyLogo);
		});
	});
});
