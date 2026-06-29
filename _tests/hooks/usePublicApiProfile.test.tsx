import { usePublicApiProfile } from "@/hooks/usePublicApiProfile";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const publicApiMocks = vi.hoisted(() => {
	class MockPublicApiError extends Error {
		kind: string;
		status: number;

		constructor() {
			super("Backend failed");
			this.kind = "server";
			this.status = 500;
		}
	}

	return {
		PublicApiError: MockPublicApiError,
		getCurrentUserProfile: vi.fn(),
		getProfileSetup: vi.fn(),
		getPublicApiSupportLabel: vi.fn(() => "Failed (request req-1)"),
		isProviderUnavailable: vi.fn(() => false),
	};
});

vi.mock("@/lib/api/public-api-client", () => publicApiMocks);

describe("usePublicApiProfile", () => {
	beforeEach(() => {
		publicApiMocks.getCurrentUserProfile.mockResolvedValue({
			email: "user@example.com",
			email_verified: false,
			first_name: "Test",
			id: "user-1",
			is_active: true,
			last_login: null,
			last_name: "User",
			profile_setup_status: "NOT_STARTED",
		});
		publicApiMocks.getProfileSetup.mockResolvedValue({
			is_complete: false,
			profile_setup_status: "NOT_STARTED",
		});
		publicApiMocks.getPublicApiSupportLabel.mockReturnValue(
			"Failed (request req-1)",
		);
		publicApiMocks.isProviderUnavailable.mockReturnValue(false);
	});

	it("loads current user and profile setup state", async () => {
		const { result } = renderHook(() => usePublicApiProfile("token-123"));

		await waitFor(() => expect(result.current.isLoading).toBe(false));

		expect(result.current.error).toBeNull();
		expect(result.current.user?.email).toBe("user@example.com");
		expect(result.current.profileSetup?.profile_setup_status).toBe(
			"NOT_STARTED",
		);
	});

	it("exposes public API error metadata for support diagnostics", async () => {
		publicApiMocks.getCurrentUserProfile.mockRejectedValue(
			new publicApiMocks.PublicApiError(),
		);

		const { result } = renderHook(() => usePublicApiProfile("token-123"));

		await waitFor(() => expect(result.current.isLoading).toBe(false));

		expect(result.current.error).toBe("Failed (request req-1)");
		expect(result.current.errorKind).toBe("server");
		expect(result.current.errorStatus).toBe(500);
	});
});
