import {
	flexRender,
	type Row,
	type Table as TanstackTable,
} from "@tanstack/react-table";
import type * as React from "react";

import { DataTablePagination } from "./data-table-pagination";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../ui/table";
import { getCommonPinningStyles } from "../../lib/data-table";
import { cn } from "../../lib/utils";

interface DataTableProps<TData> extends React.ComponentProps<"div"> {
        table: TanstackTable<TData>;
        actionBar?: React.ReactNode;
        onRowClick?: (row: Row<TData>) => void;
        focusedRowId?: string | null;
        getRowId?: (row: Row<TData>) => string | null | undefined;
}

export function DataTable<TData>({
        table,
        actionBar,
        children,
        className,
        onRowClick,
        focusedRowId,
        getRowId,
        ...props
}: DataTableProps<TData>) {
	return (
		<div className={cn("flex w-full flex-col gap-2.5", className)} {...props}>
			{children}
			<div className="overflow-x-auto rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead
										key={header.id}
										colSpan={header.colSpan}
										style={{
											...getCommonPinningStyles({
												column: header.column,
												withBorder: true,
											}),
										}}
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
                                                        table.getRowModel().rows.map((row) => {
                                                                const resolvedRowId =
                                                                        getRowId?.(row) ?? row.id;
                                                                const isFocused =
                                                                        focusedRowId !== null &&
                                                                        focusedRowId !== undefined &&
                                                                        resolvedRowId === focusedRowId;

                                                                return (
                                                                        <TableRow
                                                                        key={row.id}
                                                                        data-state={row.getIsSelected() && "selected"}
                                                                        data-row-id={resolvedRowId}
                                                                        data-focused={isFocused ? "true" : undefined}
                                                                        onClick={
                                                                                onRowClick
                                                                                        ? () => onRowClick(row)
                                                                                        : undefined
                                                                        }
                                                                        className={cn(
                                                                                onRowClick
                                                                                        ? "cursor-pointer hover:bg-accent"
                                                                                        : undefined,
                                                                                isFocused
                                                                                        ? "ring-2 ring-primary/60 ring-offset-2"
                                                                                        : undefined,
                                                                        )}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell
											key={cell.id}
											style={{
												...getCommonPinningStyles({ column: cell.column }),
											}}
										>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
                                                                        </TableRow>
                                                                );
                                                        })
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
			<div className="flex flex-col gap-2.5">
				<DataTablePagination table={table} />
				{actionBar}
			</div>
		</div>
	);
}
