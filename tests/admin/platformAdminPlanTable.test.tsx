import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { planColumns } from "@/components/admin/PlatformAdminPlanTable";
import { createPlatformAdminPlan } from "@/lib/admin/platformAdminPlan";

vi.mock("external/shadcn-table/src/nuqs-shared.ts", () => ({
        parseAsInteger: {
                withOptions: () => ({
                        withDefault: (defaultValue: number) => ({
                                parse: () => defaultValue,
                        }),
                }),
        },
        useQueryState: () => {
                throw new Error("nuqs unavailable in tests");
        },
        NuqsAdapter: ({ children }: { children: React.ReactNode }) => children,
}));

afterEach(() => {
        cleanup();
});

function renderUserStoryCell(index: number) {
        const plan = createPlatformAdminPlan();
        const column = planColumns.find((col) => col.accessorKey === "userStory");
        if (!column || !column.cell) {
                throw new Error("User story column missing");
        }
        const row = {
                original: plan[index],
        } as unknown as Parameters<NonNullable<typeof column.cell>>[0]["row"];
        const cell = column.cell({
                row,
                table: {} as never,
                getValue: () => plan[index]?.userStory,
                column: {} as never,
                renderValue: () => plan[index]?.userStory,
        } as Parameters<NonNullable<typeof column.cell>>[0]);
        render(<>{cell}</>);
}

describe("platform admin plan columns", () => {
        it("includes impersonation acceptance criteria in the user story column", () => {
                renderUserStoryCell(4);
                expect(
                        screen.queryByText(
                                /Impersonating \[User Name] - End Session/i,
                        ),
                ).not.toBeNull();
        });

        it("shows the user story narrative for platform admin impersonation", () => {
                renderUserStoryCell(4);
                expect(
                        screen.queryByText(
                                /As a Platform Admin, I want to impersonate a user/i,
                        ),
                ).not.toBeNull();
        });
});
