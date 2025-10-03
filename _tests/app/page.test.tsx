import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type React from "react";

vi.mock("next/navigation", () => ({
        redirect: vi.fn(),
}));

describe("HomePage", () => {
        beforeEach(() => {
                vi.resetModules();
        });

        afterEach(() => {
                vi.restoreAllMocks();
        });

        it("renders the marketing hero without triggering auth redirects", async () => {
                const HomePage = (await import("@/app/page")).default;
                const element = (await HomePage()) as React.ReactElement;
                const html = renderToStaticMarkup(element);
                const template = document.createElement("div");
                template.innerHTML = html;

                const hero = template.querySelector("section[data-testid='hero']");
                expect(hero).not.toBeNull();
                expect(hero?.querySelector("h1")?.textContent).toMatch(/close more deals/i);
                const cta = hero?.querySelector<HTMLAnchorElement>("a[href='/signup']");
                expect(cta?.textContent).toMatch(/get started/i);
        });
});
