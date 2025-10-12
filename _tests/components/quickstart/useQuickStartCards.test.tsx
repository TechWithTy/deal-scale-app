import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { QuickStartCardConfig } from "@/components/quickstart/QuickStartActionsGrid";
import { useQuickStartCards } from "@/components/quickstart/useQuickStartCards";

// Ensure legacy JSX runtime expectations during SSR-style evaluation.
(globalThis as Record<string, unknown>).React = React;

describe("useQuickStartCards", () => {
	const defaultParams = {
		onImport: vi.fn(),
		onSelectList: vi.fn(),
		onConfigureConnections: vi.fn(),
		onCampaignCreate: vi.fn(),
                onViewTemplates: vi.fn(),
                onOpenWebhookModal: vi.fn(),
                onBrowserExtension: vi.fn(),
                createRouterPush: vi.fn(() => vi.fn()),
                onStartNewSearch: vi.fn(),
                onOpenSavedSearches: vi.fn(),
        } as const;

	const getCards = () => {
		let captured: QuickStartCardConfig[] | null = null;

		function TestComponent() {
			captured = useQuickStartCards(defaultParams);
			return null;
		}

		renderToStaticMarkup(React.createElement(TestComponent));
		return captured ?? [];
	};

	it("exposes themed feature chips for every quick start card", () => {
		const cards = getCards();

		expect(cards.length).toBeGreaterThan(0);
		for (const card of cards) {
			expect(card.featureChips).toBeDefined();
			expect(card.featureChips?.length ?? 0).toBeGreaterThanOrEqual(3);
			for (const chip of card.featureChips ?? []) {
				expect(chip.label.length).toBeGreaterThan(0);
			}
		}
	});

	it("highlights investor and wholesaler value propositions", () => {
		const cards = getCards();

		const importCard = cards.find((card) => card.key === "import");
		expect(importCard?.featureChips).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					label: "Investor CRM Sync",
					tone: "info",
				}),
			]),
		);

		const campaignCard = cards.find((card) => card.key === "campaign");
		expect(campaignCard?.featureChips).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					label: "Multi-Channel Touches",
					tone: "accent",
				}),
			]),
		);

                const marketCard = cards.find((card) => card.key === "market-deals");
                expect(marketCard?.featureChips).toEqual(
                        expect.arrayContaining([
                                expect.objectContaining({
                                        label: "Off-Market Alerts",
                                        tone: "success",
                                }),
                        ]),
                );
                expect(marketCard?.actions).toEqual(
                        expect.arrayContaining([
                                expect.objectContaining({ label: "Start New Search" }),
                                expect.objectContaining({ label: "Saved Searches" }),
                        ]),
                );
        });
});
