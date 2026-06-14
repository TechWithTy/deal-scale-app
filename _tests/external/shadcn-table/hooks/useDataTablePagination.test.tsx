import type { ColumnDef } from "@tanstack/react-table";
import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { makeData } from "@/external/shadcn-table/src/examples/Lead/demoData";
import type { DemoRow } from "@/external/shadcn-table/src/examples/Lead/types";
import { useDataTable } from "@/external/shadcn-table/src/hooks/use-data-table";

vi.mock("@/external/shadcn-table/src/nuqs-shared", async () => {
	const React = await vi.importActual<typeof import("react")>("react");
	const parser = {
		withOptions: () => parser,
		withDefault: (defaultValue: unknown) => ({ defaultValue }),
	};

	return {
		NuqsAdapter: ({ children }: { children: ReactNode }) => children,
		parseAsArrayOf: () => parser,
		parseAsInteger: parser,
		parseAsString: parser,
		useQueryState: (_key: string, options?: { defaultValue?: unknown }) => {
			return React.useState(options?.defaultValue);
		},
		useQueryStates: () => React.useState({}),
	};
});

const columns: ColumnDef<DemoRow>[] = [
	{
		accessorKey: "list",
	},
];

function ClientPaginationHarness() {
	const { table } = useDataTable<DemoRow>({
		data: makeData(100),
		columns,
		pageCount: 10,
		initialState: {
			pagination: { pageIndex: 0, pageSize: 10 },
		},
		manualPagination: false,
	});

	return (
		<div>
			<div data-testid="visible-row-count">
				{table.getRowModel().rows.length}
			</div>
			<div data-testid="filtered-row-count">
				{table.getFilteredRowModel().rows.length}
			</div>
			<div data-testid="selected-row-count">
				{table.getFilteredSelectedRowModel().rows.length}
			</div>
			<button
				type="button"
				onClick={() => table.toggleAllPageRowsSelected(true)}
			>
				Select page
			</button>
		</div>
	);
}

describe("useDataTable pagination", () => {
	it("can paginate client-side data and select only the current page", () => {
		render(<ClientPaginationHarness />);

		expect(screen.getByTestId("visible-row-count")).toHaveTextContent("10");
		expect(screen.getByTestId("filtered-row-count")).toHaveTextContent("100");
		expect(screen.getByTestId("selected-row-count")).toHaveTextContent("0");

		fireEvent.click(screen.getByRole("button", { name: "Select page" }));

		expect(screen.getByTestId("selected-row-count")).toHaveTextContent("10");
	});
});
