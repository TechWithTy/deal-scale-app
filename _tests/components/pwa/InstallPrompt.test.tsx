import InstallPrompt, {
	WAITLIST_CALLBACK,
	WAITLIST_URL,
} from "@/components/pwa/InstallPrompt";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vitest";

const dismissBanner = vi.fn();
const markEngagement = vi.fn();
const showInstallPrompt = vi.fn();

vi.mock("@/hooks/useInstallPrompt", () => ({
	useInstallPrompt: () => ({
		canInstall: true,
		shouldShowBanner: true,
		isPrompting: false,
		isInstalled: false,
		isIosEligible: false,
		showInstallPrompt,
		dismissBanner,
		markEngagement,
	}),
}));

const originalOpen = window.open;
const openSpy = vi.fn();
const originalGlobalReact = (globalThis as { React?: typeof React }).React;

beforeAll(() => {
	(globalThis as { React?: typeof React }).React = React;
});

beforeEach(() => {
	dismissBanner.mockClear();
	markEngagement.mockClear();
	showInstallPrompt.mockClear();
	openSpy.mockClear();
	Object.defineProperty(window, "open", {
		value: openSpy,
		writable: true,
		configurable: true,
	});
});

afterAll(() => {
	Object.defineProperty(window, "open", {
		value: originalOpen,
		writable: true,
		configurable: true,
	});
	(globalThis as { React?: typeof React }).React = originalGlobalReact;
});

describe("InstallPrompt waitlist CTA", () => {
	it("opens waitlist sign-in flow in a new tab", () => {
		render(<InstallPrompt />);

		const notifyButton = screen.getByRole("button", { name: /get notified/i });
		fireEvent.click(notifyButton);

		expect(openSpy).toHaveBeenCalledWith(
			WAITLIST_URL,
			"_blank",
			"noopener,noreferrer",
		);
		expect(markEngagement).toHaveBeenCalledTimes(1);
	});

	it("shares the callback path for downstream routing", () => {
		expect(WAITLIST_URL).toContain(encodeURIComponent(WAITLIST_CALLBACK));
	});
});
