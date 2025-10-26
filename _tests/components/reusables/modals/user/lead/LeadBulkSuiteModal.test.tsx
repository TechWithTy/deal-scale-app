import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import LeadBulkSuiteModal from "@/components/reusables/modals/user/lead/LeadBulkSuiteModal";

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

vi.mock("sonner", () => ({
        toast: {
                error: vi.fn(),
                success: vi.fn(),
                loading: vi.fn(() => "toast-id"),
                dismiss: vi.fn(),
        },
}));

describe("LeadBulkSuiteModal", () => {
        it("exposes a sample CSV download action for new uploads", () => {
                downloadTemplateMock.mockReset();

                render(
                        <LeadBulkSuiteModal
                                isOpen
                                onClose={vi.fn()}
                                initialCsvFile={null}
                                initialCsvHeaders={[]}
                        />,
                );

                const button = screen.getByRole("button", { name: /download sample csv/i });
                expect(button).toBeDefined();

                fireEvent.click(button);

                expect(downloadTemplateMock).toHaveBeenCalledTimes(1);
        });
});
