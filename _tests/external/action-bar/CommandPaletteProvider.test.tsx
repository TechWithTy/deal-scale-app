import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();
const originalPlatform = window.navigator.platform;

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: pushMock }),
	usePathname: () => "/",
}));

import {
	CommandPaletteProvider,
	useCommandPalette,
} from "external/action-bar/components/providers/CommandPaletteProvider";

beforeEach(() => {
	pushMock.mockClear();
	Object.defineProperty(window.navigator, "platform", {
		configurable: true,
		value: "Win32",
	});
});

afterEach(() => {
	cleanup();
	pushMock.mockReset();
	Object.defineProperty(window.navigator, "platform", {
		configurable: true,
		value: originalPlatform,
	});
});

function PaletteStatus() {
	const { isOpen } = useCommandPalette();
	return <div data-testid="palette-status">{isOpen ? "open" : "closed"}</div>;
}

const latestStatusText = () =>
	screen.getAllByTestId("palette-status").at(-1)?.textContent ?? "";

describe("CommandPaletteProvider keyboard shortcuts", () => {
	it("toggles open state with Ctrl+K", () => {
		render(
			<CommandPaletteProvider>
				<PaletteStatus />
			</CommandPaletteProvider>,
		);

		expect(latestStatusText()).toBe("closed");

		fireEvent.keyDown(window, { key: "k", ctrlKey: true });

		expect(latestStatusText()).toBe("open");

		fireEvent.keyDown(window, { key: "k", ctrlKey: true });

		expect(latestStatusText()).toBe("closed");
	});

	it("supports backup Ctrl+Shift+D shortcut", () => {
		render(
			<CommandPaletteProvider>
				<PaletteStatus />
			</CommandPaletteProvider>,
		);

		expect(latestStatusText()).toBe("closed");

		fireEvent.keyDown(window, { key: "d", ctrlKey: true, shiftKey: true });

		expect(latestStatusText()).toBe("open");

		fireEvent.keyDown(window, { key: "d", ctrlKey: true, shiftKey: true });

		expect(latestStatusText()).toBe("closed");
	});

	it("supports Cmd+K on macOS with Meta key", () => {
		Object.defineProperty(window.navigator, "platform", {
			configurable: true,
			value: "MacIntel",
		});

		render(
			<CommandPaletteProvider>
				<PaletteStatus />
			</CommandPaletteProvider>,
		);

		expect(latestStatusText()).toBe("closed");

		fireEvent.keyDown(window, { key: "k", metaKey: true });

		expect(latestStatusText()).toBe("open");

		fireEvent.keyDown(window, { key: "k", metaKey: true });

		expect(latestStatusText()).toBe("closed");
	});

	it("supports Cmd+Shift+D backup on macOS", () => {
		Object.defineProperty(window.navigator, "platform", {
			configurable: true,
			value: "MacIntel",
		});

		render(
			<CommandPaletteProvider>
				<PaletteStatus />
			</CommandPaletteProvider>,
		);

		expect(latestStatusText()).toBe("closed");

		fireEvent.keyDown(window, { key: "d", metaKey: true, shiftKey: true });

		expect(latestStatusText()).toBe("open");

		fireEvent.keyDown(window, { key: "d", metaKey: true, shiftKey: true });

		expect(latestStatusText()).toBe("closed");
	});

	it("still opens with the slash shortcut", () => {
		render(
			<CommandPaletteProvider>
				<PaletteStatus />
			</CommandPaletteProvider>,
		);

		fireEvent.keyDown(window, { key: "/" });

		expect(latestStatusText()).toBe("open");
	});
});
