import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { QuickStartCardConfig } from "@/components/quickstart/types";

// Ensure legacy JSX runtime expectations during SSR-style evaluation.
(globalThis as Record<string, unknown>).React = React;

type QuickStartCardParams = {
        readonly onImport: ReturnType<typeof vi.fn>;
        readonly onSelectList: ReturnType<typeof vi.fn>;
        readonly onConfigureConnections: ReturnType<typeof vi.fn>;
        readonly onCampaignCreate: ReturnType<typeof vi.fn>;
        readonly onViewTemplates: ReturnType<typeof vi.fn>;
        readonly onOpenWebhookModal: ReturnType<typeof vi.fn>;
        readonly onBrowserExtension: ReturnType<typeof vi.fn>;
        readonly createRouterPush: ReturnType<typeof vi.fn>;
        readonly onStartNewSearch: ReturnType<typeof vi.fn>;
        readonly onOpenSavedSearches: ReturnType<typeof vi.fn>;
};

const createParams = () => {
        const routeHandlers = new Map<string, ReturnType<typeof vi.fn>>();
        const params: QuickStartCardParams = {
                onImport: vi.fn(),
                onSelectList: vi.fn(),
                onConfigureConnections: vi.fn(),
                onCampaignCreate: vi.fn(),
                onViewTemplates: vi.fn(),
                onOpenWebhookModal: vi.fn(),
                onBrowserExtension: vi.fn(),
                createRouterPush: vi.fn((path: string) => {
                        const handler = vi.fn();
                        routeHandlers.set(path, handler);
                        return handler;
                }),
                onStartNewSearch: vi.fn(),
                onOpenSavedSearches: vi.fn(),
        };

        return { params, routeHandlers };
};

const renderQuickStartCards = async (
        params: QuickStartCardParams,
): Promise<QuickStartCardConfig[]> => {
        const { useQuickStartCards } = await import("@/components/quickstart/useQuickStartCards");
        let captured: QuickStartCardConfig[] | null = null;

        function TestComponent() {
                captured = useQuickStartCards(params);
                return null;
        }

        renderToStaticMarkup(React.createElement(TestComponent));
        return captured ?? [];
};

describe("useQuickStartCards", () => {
        beforeEach(() => {
                vi.resetModules();
        });

        afterEach(() => {
                vi.clearAllMocks();
        });

        it("retains marketing value propositions for production cards", async () => {
                const { params } = createParams();
                const cards = await renderQuickStartCards(params);

                expect(cards.length).toBeGreaterThan(0);
                for (const card of cards) {
                        expect(card.featureChips).toBeDefined();
                        expect(card.featureChips?.length ?? 0).toBeGreaterThanOrEqual(3);
                        for (const chip of card.featureChips ?? []) {
                                expect(chip.label.length).toBeGreaterThan(0);
                        }
                }

                const importCard = cards.find((card) => card.key === "import");
                expect(importCard?.featureChips).toEqual(
                        expect.arrayContaining([
                                expect.objectContaining({
                                        label: "Investor CRM Sync",
                                        tone: "info",
                                }),
                        ]),
                );
                expect(importCard?.wizardPreset).toEqual(
                        expect.objectContaining({ startStep: "lead-intake" }),
                );

                const wizardCard = cards.find((card) => card.key === "wizard");
                expect(wizardCard).toBeDefined();
                expect(wizardCard?.actions[0]?.label).toMatch(/launch guided setup/i);
                expect(typeof wizardCard?.actions[0]?.onClick).toBe("function");

                const campaignCard = cards.find((card) => card.key === "campaign");
                expect(campaignCard?.featureChips).toEqual(
                        expect.arrayContaining([
                                expect.objectContaining({
                                        label: "Multi-Channel Touches",
                                        tone: "accent",
                                }),
                        ]),
                );
        });

        it("filters disabled cards, sorts by order, and wires actions from configuration", async () => {
                vi.doMock("@/lib/config/quickstart", async () => {
                        const { Plus } = await import("lucide-react");

                        return {
                                quickStartCardDescriptors: [
                                        {
                                                id: "disabled", 
                                                enabled: false,
                                                order: 1,
                                                title: "Disabled",
                                                description: "Should never appear",
                                                icon: Plus,
                                                featureChips: [],
                                                actions: [
                                                        {
                                                                id: "hidden-action",
                                                                kind: "handler",
                                                                label: "Hidden",
                                                                icon: Plus,
                                                                handler: "onImport",
                                                        },
                                                ],
                                        },
                                        {
                                                id: "alpha",
                                                enabled: true,
                                                order: 2,
                                                title: "Alpha",
                                                description: "First visible card",
                                                icon: Plus,
                                                featureChips: [],
                                                actions: [
                                                        {
                                                                id: "alpha-route",
                                                                kind: "route",
                                                                label: "Go Alpha",
                                                                icon: Plus,
                                                                href: "/alpha",
                                                        },
                                                ],
                                        },
                                        {
                                                id: "beta",
                                                enabled: true,
                                                order: 3,
                                                title: "Beta",
                                                description: "Second visible card",
                                                icon: Plus,
                                                featureChips: [],
                                                wizardPreset: {
                                                        startStep: "review",
                                                        templateId: "template-beta",
                                                },
                                                actions: [
                                                        {
                                                                id: "beta-webhook",
                                                                kind: "webhook",
                                                                label: "Launch Webhook",
                                                                icon: Plus,
                                                                stage: "incoming",
                                                        },
                                                        {
                                                                id: "beta-handler",
                                                                kind: "handler",
                                                                label: "Start Campaign",
                                                                icon: Plus,
                                                                handler: "onCampaignCreate",
                                                        },
                                                ],
                                        },
                                ],
                        } as const;
                });

                const { params, routeHandlers } = createParams();
                const cards = await renderQuickStartCards(params);

                expect(cards.map((card) => card.key)).toEqual(["alpha", "beta"]);
                expect(params.createRouterPush).toHaveBeenCalledWith("/alpha");

                const alphaRouteHandler = routeHandlers.get("/alpha");
                expect(alphaRouteHandler).toBeDefined();
                expect(cards[0]?.actions[0]?.onClick).toBe(alphaRouteHandler);

                cards[1]?.actions[0]?.onClick();
                expect(params.onOpenWebhookModal).toHaveBeenCalledWith("incoming");

                expect(cards[1]?.wizardPreset).toEqual(
                        expect.objectContaining({
                                startStep: "review",
                                templateId: "template-beta",
                        }),
                );
        });
});
