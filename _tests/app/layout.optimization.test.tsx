// biome-ignore lint/style/useImportType: JSX runtime is required for server render tests
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

declare module "react" {
	interface HTMLAttributes<T> {
		"data-testid"?: string;
	}
}

const authMock = vi.fn();

vi.mock("@/auth", () => ({
	auth: authMock,
}));

vi.mock("external/action-bar", () => ({
	CommandPaletteProvider: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="command-palette">{children}</div>
	),
	ActionBarRoot: () => <div data-testid="command-root" />,
}));

vi.mock("@uploadthing/react/styles.css", () => ({}), { virtual: true });

vi.mock("@/components/layout/providers", () => ({
	__esModule: true,
	default: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="providers">{children}</div>
	),
}));

vi.mock("@/components/auth/SessionSync", () => ({
	__esModule: true,
	default: () => <div data-testid="session-sync" />,
}));

vi.mock("next/font/google", () => ({
	Inter: () => ({ className: "mocked-inter" }),
}));

vi.mock("nuqs/adapters/next/app", () => ({
	NuqsAdapter: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="nuqs">{children}</div>
	),
}));

vi.mock("next/script", () => ({
	__esModule: true,
	default: ({ children, ...props }: { children?: React.ReactNode }) => (
		<script {...props}>{children}</script>
	),
}));

async function renderLayoutWithSession(session: unknown) {
	authMock.mockResolvedValue(session);
	const mod = await import("@/app/layout");
	const Layout = mod.default;
	const element = await Layout({
		children: <div data-testid="page-slot">content</div>,
	});
	const html = renderToStaticMarkup(element as React.ReactElement);
	const template = document.createElement("div");
	template.innerHTML = html;
	authMock.mockReset();
	return template;
}

describe("RootLayout conditional shell", () => {
	it("omits heavy app shell wrappers for anonymous visitors", async () => {
		const dom = await renderLayoutWithSession(null);
		expect(dom.querySelector("[data-testid='command-palette']")).toBeNull();
		expect(dom.querySelector("[data-testid='session-sync']")).toBeNull();
		expect(dom.querySelector("[data-testid='nuqs']")).toBeNull();
		expect(dom.querySelector("script#supademo-script")).toBeNull();
	});

	it("renders the authenticated app shell when a session exists", async () => {
		const dom = await renderLayoutWithSession({ user: { id: "123" } });
		expect(dom.querySelector("[data-testid='command-palette']")).not.toBeNull();
		expect(dom.querySelector("[data-testid='session-sync']")).not.toBeNull();
		expect(dom.querySelector("[data-testid='nuqs']")).not.toBeNull();
		const supademoScript = dom.querySelector("script#supademo-script");
		expect(supademoScript).not.toBeNull();
		expect(supademoScript?.getAttribute("src")).toBe("/api/supademo/script");
	});
});
