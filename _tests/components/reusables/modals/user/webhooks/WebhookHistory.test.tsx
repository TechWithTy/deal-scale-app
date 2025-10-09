import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { describe, expect, it } from "vitest";

import WebhookHistory, {
        type WebhookEntryType,
} from "@/components/reusables/modals/user/webhooks/WebhookHistory";

(globalThis as unknown as { React: typeof React }).React = React;

const buildHistory = (overrides?: Partial<WebhookEntryType>): WebhookEntryType => ({
        id: "entry-1",
        date: "Jan 01, 2025 8:00 AM",
        event: "lead.created",
        payload: { id: "123" },
        status: "delivered",
        responseCode: 200,
        ...overrides,
});

const renderComponent = (ui: React.ReactElement) => {
        const container = document.createElement("div");
        document.body.appendChild(container);
        const root = createRoot(container);

        act(() => {
                root.render(ui);
        });

        return { container, root };
};

describe("WebhookHistory", () => {
        it("renders guidance when viewing feeds stage", () => {
                const { container } = renderComponent(
                        <WebhookHistory
                                activeStage="feeds"
                                historyByStage={{
                                        incoming: [buildHistory()],
                                        outgoing: [buildHistory({ id: "entry-2", event: "message.sent" })],
                                }}
                        />,
                );

                expect(container.textContent).toMatch(
                        /webhook history unavailable in feed view/i,
                );
                expect(container.textContent).toMatch(
                        /feeds tab now includes its own expandable rss preview/i,
                );
        });

        it("lists only the incoming events when active", () => {
                const { container } = renderComponent(
                        <WebhookHistory
                                activeStage="incoming"
                                historyByStage={{
                                        incoming: [
                                                buildHistory({
                                                        id: "incoming-1",
                                                        event: "lead.status.updated",
                                                }),
                                        ],
                                        outgoing: [
                                                buildHistory({ id: "outgoing-1", event: "message.sent" }),
                                        ],
                                }}
                        />,
                );

                expect(container.textContent).toMatch(/incoming webhook history/i);
                expect(container.textContent).toMatch(/lead.status.updated/i);
                expect(container.textContent).not.toMatch(/message.sent/i);
        });

        it("shows an empty state when a direction has no attempts", () => {
                const { container } = renderComponent(
                        <WebhookHistory
                                activeStage="outgoing"
                                historyByStage={{ incoming: [buildHistory()], outgoing: [] }}
                        />,
                );

                expect(container.textContent).toMatch(/no webhook attempts recorded yet/i);
        });
});
