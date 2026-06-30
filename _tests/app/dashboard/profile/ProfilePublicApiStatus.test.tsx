import { ProfilePublicApiStatus } from "@/app/dashboard/profile/ProfilePublicApiStatus";
import { render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const profileHookMock = vi.hoisted(() => ({
	usePublicApiProfile: vi.fn(),
}));

vi.mock("@/hooks/usePublicApiProfile", () => profileHookMock);
vi.mock("next-auth/react", () => ({
	useSession: () => ({
		data: { publicApi: { accessToken: "token-123" } },
	}),
}));

describe("ProfilePublicApiStatus", () => {
	beforeEach(() => {
		profileHookMock.usePublicApiProfile.mockReturnValue({
			error: null,
			errorKind: null,
			errorStatus: null,
			isLoading: false,
			isProviderUnavailable: false,
			profileSetup: { profile_setup_status: "NOT_STARTED" },
			user: { email: "user@example.com" },
		});
	});

	it("renders a ready state with profile setup status", () => {
		render(<ProfilePublicApiStatus />);

		expect(screen.getByText("Profile sync ready: NOT_STARTED")).toBeTruthy();
	});

	it("renders classified backend errors with support details", () => {
		profileHookMock.usePublicApiProfile.mockReturnValue({
			error: "Failed to get profile setup (request req-123)",
			errorKind: "server",
			errorStatus: 500,
			isLoading: false,
			isProviderUnavailable: false,
			profileSetup: null,
			user: null,
		});

		render(<ProfilePublicApiStatus />);

		expect(screen.getByText("Profile service error")).toBeTruthy();
		expect(
			screen.getByText("Failed to get profile setup (request req-123)"),
		).toBeTruthy();
		expect(screen.getByText("HTTP 500")).toBeTruthy();
	});

	it("renders a session recovery message for auth failures", () => {
		profileHookMock.usePublicApiProfile.mockReturnValue({
			error: "Not authenticated",
			errorKind: "auth",
			errorStatus: 401,
			isLoading: false,
			isProviderUnavailable: false,
			profileSetup: null,
			user: null,
		});

		render(<ProfilePublicApiStatus />);

		expect(screen.getByText("Session required")).toBeTruthy();
		expect(
			screen.getByText(
				"Sign in again to establish a public API-backed session.",
			),
		).toBeTruthy();
	});
});
