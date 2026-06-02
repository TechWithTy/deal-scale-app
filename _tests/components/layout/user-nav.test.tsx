import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";

import { UserNav } from "@/components/layout/user-nav";
import { useSessionStore } from "@/lib/stores/user/useSessionStore";
import { useUserProfileStore } from "@/lib/stores/user/userProfile";

vi.mock("next/navigation", () => ({
        useRouter: () => ({
                push: vi.fn(),
        }),
}));

vi.mock("next-auth/react", () => ({
        signOut: vi.fn(),
}));

vi.mock("@/components/ui/avatar", () => ({
	Avatar: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
	AvatarFallback: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
	AvatarImage: ({ src, alt }: { src?: string; alt?: string }) => (
		<img src={src} alt={alt} />
	),
}));

describe("UserNav", () => {
        beforeEach(() => {
                act(() => {
                        useSessionStore.getState().clear();
                        useUserProfileStore.getState().resetUserProfile();
                });
        });

        it("prefers the session store identity over the user profile store", () => {
                act(() => {
                        useSessionStore
                                .getState()
                                .setFromSession({
                                        user: {
                                                id: "impersonated-id",
                                                name: "Admin User",
                                                email: "admin.user@example.com",
                                        },
                                } as any);
                        useUserProfileStore.setState({
                                userProfile: {
                                        firstName: "Platform",
                                        lastName: "Admin",
                                        email: "platform.admin@example.com",
                                        companyInfo: { companyLogo: "" },
                                } as any,
                        });
                });

                render(<UserNav />);

                const trigger = screen.getByRole("button", {
                        name: /admin user/i,
                });
                expect(trigger).not.toBeNull();
                expect(trigger?.getAttribute("aria-label")).toContain("Admin User");

                const fallback = trigger?.querySelector("span span");
                expect(fallback?.textContent).toContain("A");
        });

	it("renders the demo company logo in the avatar when available", () => {
		const companyLogo = "https://example.com/logo.svg";
		act(() => {
			useSessionStore
				.getState()
				.setFromSession({
					user: {
						id: "demo-user",
						name: "Demo User",
						email: "demo@example.com",
						demoConfig: { companyLogo },
					},
				} as any);
		});

	render(<UserNav />);

	const avatarImg = screen.getAllByAltText(/demo user/i)[0];
	expect(avatarImg?.getAttribute("src")).toBe(companyLogo);
	});
});
