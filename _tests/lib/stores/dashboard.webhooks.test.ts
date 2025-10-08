import { act } from "react";
import { beforeEach, describe, expect, it } from "vitest";

import { useModalStore } from "@/lib/stores/dashboard";

describe("useModalStore webhook stage", () => {
        beforeEach(() => {
                act(() => {
                        useModalStore.setState({
                                isWebhookModalOpen: false,
                                webhookStage: "incoming",
                                setWebhookStage: useModalStore.getState().setWebhookStage,
                        } as any);
                });
        });

        it("opens the webhook modal with incoming stage by default", () => {
                act(() => {
                        useModalStore.getState().openWebhookModal();
                });

                const state = useModalStore.getState();

                expect(state.isWebhookModalOpen).toBe(true);
                expect(state.webhookStage).toBe("incoming");
        });

        it("allows opening the webhook modal with the outgoing stage", () => {
                act(() => {
                        useModalStore.getState().openWebhookModal("outgoing");
                });

                const state = useModalStore.getState();

                expect(state.isWebhookModalOpen).toBe(true);
                expect(state.webhookStage).toBe("outgoing");
        });

        it("closes the webhook modal without mutating the last chosen stage", () => {
                act(() => {
                        useModalStore.getState().openWebhookModal("outgoing");
                        useModalStore.getState().closeWebhookModal();
                });

                const state = useModalStore.getState();

                expect(state.isWebhookModalOpen).toBe(false);
                expect(state.webhookStage).toBe("outgoing");
        });

        it("supports manually updating the shared webhook stage", () => {
                act(() => {
                        useModalStore.getState().setWebhookStage("feeds");
                });

                const state = useModalStore.getState();

                expect(state.webhookStage).toBe("feeds");
        });
});
