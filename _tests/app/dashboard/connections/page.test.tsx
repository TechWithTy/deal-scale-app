import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ConnectionsPage from "@/app/dashboard/connections/page";
import { useModalStore } from "@/lib/stores/dashboard";

describe("ConnectionsPage", () => {
        beforeEach(() => {
                act(() => {
                        useModalStore.setState({
                                isWebhookModalOpen: false,
                                webhookStage: "incoming",
                                openWebhookModal: useModalStore.getState().openWebhookModal,
                                setWebhookStage: useModalStore.getState().setWebhookStage,
                        } as any);
                });
        });

        it("renders the connections overview with tabs", () => {
                render(<ConnectionsPage />);

                expect(
                        screen.getByRole("heading", {
                                level: 1,
                                name: /connections hub/i,
                        }),
                ).toBeDefined();

                expect(screen.getAllByRole("tab", { name: /incoming/i })).not.toHaveLength(0);
                expect(screen.getAllByRole("tab", { name: /outgoing/i })).not.toHaveLength(0);
                expect(screen.getAllByRole("tab", { name: /feeds/i })).not.toHaveLength(0);
        });

        it("reflects store stage changes in the tab selection", () => {
                render(<ConnectionsPage />);

                const [incomingTab] = screen.getAllByRole("tab", { name: /incoming/i });
                expect(incomingTab.getAttribute("data-state")).toBe("active");

                act(() => {
                        useModalStore.getState().setWebhookStage("outgoing");
                });

                const [outgoingTab] = screen.getAllByRole("tab", { name: /outgoing/i });
                expect(outgoingTab.getAttribute("data-state")).toBe("active");

                act(() => {
                        useModalStore.getState().setWebhookStage("feeds");
                });

                const [feedsTab] = screen.getAllByRole("tab", { name: /feeds/i });
                expect(feedsTab.getAttribute("data-state")).toBe("active");
        });

        it("opens the shared webhook modal with the selected stage", async () => {
                const openWebhookModalMock = vi.fn();

                act(() => {
                        useModalStore.setState({
                                openWebhookModal: openWebhookModalMock,
                        } as any);
                });

                render(<ConnectionsPage />);

                act(() => {
                        fireEvent.click(
                                screen.getAllByRole("button", { name: /configure incoming webhook/i })[0],
                        );
                });

                expect(openWebhookModalMock).toHaveBeenCalledWith("incoming");

                act(() => {
                        useModalStore.getState().setWebhookStage("outgoing");
                });

                const outgoingButtons = await screen.findAllByRole("button", {
                        name: /configure outgoing webhook/i,
                });

                act(() => {
                        fireEvent.click(outgoingButtons[0]);
                });

                expect(openWebhookModalMock).toHaveBeenLastCalledWith("outgoing");

                act(() => {
                        useModalStore.getState().setWebhookStage("feeds");
                });

                const feedButtons = await screen.findAllByRole("button", {
                        name: /view feed options/i,
                });

                act(() => {
                        fireEvent.click(feedButtons[0]);
                });

                expect(openWebhookModalMock).toHaveBeenLastCalledWith("feeds");
        });
});
