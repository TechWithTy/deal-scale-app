import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUseInstallPrompt = vi.fn();

vi.mock("@root/hooks/useInstallPrompt", () => ({
	useInstallPrompt: mockUseInstallPrompt,
}));

describe("InstallPrompt", () => {
	beforeEach(() => {
		vi.resetModules();
		mockUseInstallPrompt.mockReset();
	});

	const setup = async () => {
		const module = await import("../../../src/pwa/InstallPrompt");
		return module.default;
	};

	it("renders waitlist button with redirect link when banner visible", async () => {
		mockUseInstallPrompt.mockReturnValue({
			canInstall: true,
			shouldShowBanner: true,
			isPrompting: false,
			isInstalled: false,
			isIosEligible: false,
			visitCount: 4,
			showInstallPrompt: vi.fn().mockResolvedValue("accepted"),
			dismissBanner: vi.fn(),
			markEngagement: vi.fn(),
		});

		const InstallPrompt = await setup();

		render(<InstallPrompt />);

		const waitlistButton = screen.getByRole("button", {
			name: /join waitlist/i,
		});
		expect(waitlistButton).toBeInTheDocument();

		const assignSpy = vi.spyOn(window.location, "assign");
		fireEvent.click(waitlistButton);
		expect(assignSpy).toHaveBeenCalledWith(
			"https://www.dealscale.io/auth?callback=/score-streak-flow",
		);
		assignSpy.mockRestore();
	});

	it("does not render when banner should be hidden", async () => {
		mockUseInstallPrompt.mockReturnValue({
			canInstall: false,
			shouldShowBanner: false,
			isPrompting: false,
			isInstalled: false,
			isIosEligible: false,
			visitCount: 1,
			showInstallPrompt: vi.fn(),
			dismissBanner: vi.fn(),
			markEngagement: vi.fn(),
		});

		const InstallPrompt = await setup();

		const { container } = render(<InstallPrompt />);
		expect(container).toBeEmptyDOMElement();
	});
});

