import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { describe, expect, it } from "vitest";

import WebhookFeedPreview, {
        type FeedItemType,
} from "@/components/reusables/modals/user/webhooks/WebhookFeedPreview";

(globalThis as unknown as { React: typeof React }).React = React;

const renderComponent = (ui: React.ReactElement) => {
        const container = document.createElement("div");
        document.body.appendChild(container);
        const root = createRoot(container);

        act(() => {
                root.render(ui);
        });

        return { container, root };
};

describe("WebhookFeedPreview", () => {
        const sampleFeed: FeedItemType[] = [
                {
                        id: "feed-1",
                        title: "message.sent — Jane Doe",
                        publishedAt: "Wed, 08 Oct 2025 14:35:00 GMT",
                        link: "https://example.com/feed/1",
                        summary: "Sample summary",
                        author: "DealScale",
                },
        ];

        it("renders a helpful empty state", () => {
                const { container } = renderComponent(<WebhookFeedPreview feedItems={[]} />);

                expect(container.textContent).toMatch(/no feed entries published yet/i);
        });

        it("renders feed entries as expandable items", () => {
                const { container } = renderComponent(
                        <WebhookFeedPreview feedItems={sampleFeed} />,
                );

                expect(container.textContent).toMatch(/current rss feed/i);
                expect(container.textContent).toMatch(/message.sent — Jane Doe/i);
                const trigger = container.querySelector("button");
                expect(trigger).not.toBeNull();

                act(() => {
                        trigger?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
                });

                const anchor = container.querySelector("a[href]");
                expect(anchor?.getAttribute("href")).toBe(sampleFeed[0].link);
        });
});
