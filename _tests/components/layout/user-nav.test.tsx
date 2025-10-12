import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";
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
});
