import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { flexRender } from "@tanstack/react-table";
import type React from "react";

import type {
	Cell,
	HeaderGroup,
	Table as ReactTableType,
	Row,
} from "@tanstack/react-table";

interface DataTableProps<TData = unknown> {
	table: ReactTableType<TData>;
}

const DataTable = <TData,>({ table }: DataTableProps<TData>) => (
	<div className="rounded-md border">
		<Table>
			<TableHeader>
				{table.getHeaderGroups().map((headerGroup: HeaderGroup<TData>) => (
					<TableRow key={headerGroup.id}>
						{headerGroup.headers.map((header) => (
							<TableHead key={header.id} colSpan={header.colSpan}>
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
				{table.getRowModel().rows.length ? (
					table.getRowModel().rows.map((row: Row<TData>) => (
						<TableRow
							key={row.id}
							data-state={row.getIsSelected() && "selected"}
						>
							{row.getVisibleCells().map((cell: Cell<TData, unknown>) => (
								<TableCell key={cell.id}>
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</TableCell>
							))}
						</TableRow>
					))
				) : (
					<TableRow>
						<TableCell
							colSpan={table.getAllColumns().length}
							className="h-24 text-center"
						>
							No results.
						</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	</div>
);

export default DataTable;
