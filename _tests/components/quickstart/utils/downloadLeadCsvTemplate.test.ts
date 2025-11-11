import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";

import {
        buildLeadCsvTemplateCsv,
        downloadLeadCsvTemplate,
} from "@/components/quickstart/utils/downloadLeadCsvTemplate";
import { LEAD_CSV_TEMPLATE_FIELDS } from "@/lib/config/leads/csvTemplateConfig";

const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;

describe("downloadLeadCsvTemplate", () => {
        beforeEach(() => {
                vi.restoreAllMocks();
        });

        afterEach(() => {
                URL.createObjectURL = originalCreateObjectURL;
                URL.revokeObjectURL = originalRevokeObjectURL;
        });

        it("builds csv content from the configured headers and example values", () => {
                const csv = buildLeadCsvTemplateCsv();
                const [headers, sampleRow] = csv.trim().split("\n");

                const expectedHeaders = LEAD_CSV_TEMPLATE_FIELDS.map((field) => `"${field.label}"`).join(",");
                const expectedRow = LEAD_CSV_TEMPLATE_FIELDS.map((field) => `"${field.example}"`).join(",");

                expect(headers).toBe(expectedHeaders);
                expect(sampleRow).toBe(expectedRow);
        });

        it("creates and clicks a temporary anchor with a persona-aware filename", async () => {
                const blobUrl = "blob:mock";
                const click = vi.fn();
                const anchor = {
                        click,
                        setAttribute: vi.fn(),
                        style: { display: "" },
                        href: "",
                        download: "",
                } as unknown as HTMLAnchorElement;

                const createObjectURLMock = vi.fn(() => blobUrl);
                const revokeObjectURLMock = vi.fn();

                URL.createObjectURL = createObjectURLMock;
                URL.revokeObjectURL = revokeObjectURLMock;

                const fetchMock = vi
                        .spyOn(globalThis, "fetch")
                        .mockResolvedValue({
                                ok: true,
                                text: () => Promise.resolve("col1,col2\nvalue1,value2\n"),
                        } as unknown as Response);
                const createElementSpy = vi
                        .spyOn(document, "createElement")
                        .mockReturnValue(anchor);
                const appendChildSpy = vi
                        .spyOn(document.body, "appendChild")
                        .mockImplementation(() => anchor);
                const removeChildSpy = vi
                        .spyOn(document.body, "removeChild")
                        .mockImplementation(() => anchor);

                await downloadLeadCsvTemplate({
                        personaId: "investor",
                        goalId: "investor-pipeline",
                });

                expect(createElementSpy).toHaveBeenCalledWith("a");
                expect(appendChildSpy).toHaveBeenCalledWith(anchor);
                expect(click).toHaveBeenCalledTimes(1);
                expect(anchor.download).toMatch(/investor/);
                expect(anchor.download).toMatch(/seller-pipeline/);
                expect(revokeObjectURLMock).toHaveBeenCalledWith(blobUrl);
                expect(removeChildSpy).toHaveBeenCalledWith(anchor);
                expect(fetchMock).toHaveBeenCalledWith("/example_data/ExampleCsv.csv");
        });
});
