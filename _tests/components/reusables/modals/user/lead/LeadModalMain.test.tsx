import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import LeadModalMain from "@/components/reusables/modals/user/lead/LeadModalMain";

const { downloadTemplateMock } = vi.hoisted(() => ({
        downloadTemplateMock: vi.fn(),
}));

(globalThis as Record<string, unknown>).React = React;

vi.mock("@/components/quickstart/utils/downloadLeadCsvTemplate", () => ({
        __esModule: true,
        downloadLeadCsvTemplate: downloadTemplateMock,
}));

vi.mock("@/lib/stores/leadList", () => ({
        useLeadListStore: (selector: (state: { addLeadList: () => void; leadLists: [] }) => unknown) =>
                selector({ addLeadList: vi.fn(), leadLists: [] }),
}));

vi.mock("papaparse", () => ({
        __esModule: true,
        default: {
                parse: vi.fn(() => ({ data: [] })),
        },
}));

vi.mock("sonner", () => ({
        toast: {
                error: vi.fn(),
                success: vi.fn(),
                loading: vi.fn(() => "toast-id"),
                dismiss: vi.fn(),
        },
}));

describe("LeadModalMain", () => {
        it("lets users download the sample CSV from the upload step", async () => {
                downloadTemplateMock.mockReset();

                render(
                        <LeadModalMain
                                isOpen
                                onClose={vi.fn()}
                                initialListMode="create"
                        />,
                );

                const listNameInput = screen.getByLabelText(/new list name/i);
                fireEvent.change(listNameInput, { target: { value: "Sample List" } });

                const nextButton = screen.getByRole("button", { name: /next/i });
                fireEvent.click(nextButton);

                const button = await screen.findByRole("button", { name: /download sample csv/i });
                expect(button).toBeDefined();

                fireEvent.click(button);

                expect(downloadTemplateMock).toHaveBeenCalledTimes(1);
        });
});
