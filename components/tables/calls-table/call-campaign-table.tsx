import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { type ColumnDef, flexRender } from "@tanstack/react-table";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import React from "react";
import { useDataTable } from "../../../external/shadcn-table/src/hooks/use-data-table";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	searchKey: string;
	pageCount: number;
	pageSizeOptions?: number[];
}

export function CallCampaignTable<TData, TValue>({
	columns,
	data,
	searchKey,
	pageCount,
	pageSizeOptions = [10, 20, 30, 50],
}: DataTableProps<TData, TValue>) {
	const { table } = useDataTable<TData>({
		data,
		columns: columns as ColumnDef<TData>[],
		pageCount,
		initialState: {
			pagination: { pageIndex: 0, pageSize: pageSizeOptions?.[0] ?? 10 },
		},
		// let the shared hook manage filtering/sorting/pagination via nuqs
		getRowId: (row, index) => {
			const candidate = row as unknown as { id?: string | number };
			return candidate.id !== undefined ? String(candidate.id) : String(index);
		},
	});

	return (
		<>
			<Input
				placeholder={`Search ${searchKey}...`}
				value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
				onChange={(e) =>
					table.getColumn(searchKey)?.setFilterValue(e.target.value)
				}
				className="w-full max-w-sm"
			/>

			{/* Add horizontal scroll with overflow-x-auto */}
			<div className="w-full overflow-x-auto">
				{/* Ensure horizontal scroll */}
				<Table className="min-w-[1200px]">
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header, index) => (
									<TableHead
										key={header.id}
										className={`${index === 0 ? "text-left" : "text-center"}`} // Center all headers except the first one
									>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id}>
									{row.getVisibleCells().map((cell, index) => (
										<TableCell
											key={cell.id}
											className={index === 0 ? "text-left" : "text-center"} // Center all cells except the first one
										>
											<span>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</span>
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<div className="flex items-center justify-between gap-2 py-4">
				<div className="text-sm">
					Page {table.getState().pagination.pageIndex + 1} of{" "}
					{table.getPageCount()}
				</div>
				<div className="flex items-center space-x-2">
					<Button
						aria-label="Go to previous page"
						type="button"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						<ChevronLeftIcon className="h-4 w-4" />
					</Button>
					<Button
						aria-label="Go to next page"
						type="button"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						<ChevronRightIcon className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</>
	);
}
