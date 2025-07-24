"use client";

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
import {
	type ColumnDef,
	type PaginationState,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	searchKey: string;
	pageCount: number;
	pageSizeOptions?: number[];
}

// Helper function to download message content
// const downloadMessageContent = (message: TextMessage) => {
//   const messageContent = message.body || 'No content available';
//   const blob = new Blob([messageContent], { type: 'text/plain' });
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement('a');
//   a.href = url;
//   a.download = `message-${message.id}.txt`; // Naming the file with message id
//   a.click();
//   URL.revokeObjectURL(url); // Clean up the URL
// };

export function IndividualMessageTable<TData, TValue>({
	columns,
	data,
	searchKey,
	pageCount,
	pageSizeOptions = [10, 20, 30, 50],
}: DataTableProps<TData, TValue>) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const page = searchParams?.get("page") ?? "1";
	const per_page = searchParams?.get("limit") ?? "10";

	const [{ pageIndex, pageSize }, setPagination] =
		React.useState<PaginationState>({
			pageIndex: Number(page) - 1,
			pageSize: Number(per_page),
		});

	const createQueryString = React.useCallback(
		(params: Record<string, string | number | null>) => {
			const newSearchParams = new URLSearchParams(searchParams?.toString());

			for (const [key, value] of Object.entries(params)) {
				if (value === null) {
					newSearchParams.delete(key);
				} else {
					newSearchParams.set(key, String(value));
				}
			}

			return newSearchParams.toString();
		},
		[searchParams],
	);

	React.useEffect(() => {
		router.push(
			`${pathname}?${createQueryString({
				page: pageIndex + 1,
				limit: pageSize,
			})}`,
			{
				scroll: false,
			},
		);
	}, [pageIndex, pageSize, router, pathname, createQueryString]);

	const table = useReactTable({
		data: data.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize), // Limit data by current page and page size
		columns,
		pageCount,
		getCoreRowModel: getCoreRowModel(),
		state: {
			pagination: { pageIndex, pageSize },
		},
		onPaginationChange: setPagination,
		getPaginationRowModel: getPaginationRowModel(),
		manualPagination: true,
	});

	return (
		<>
			<Input
				placeholder={`Search ${searchKey}...`}
				value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
				onChange={(event) =>
					table.getColumn(searchKey)?.setFilterValue(event.target.value)
				}
				className="my-5 w-full md:max-w-sm"
			/>

			<div className="w-full overflow-x-auto">
				<Table className="min-w-[1200px]">
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id} className="text-left">
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
											className={index === 0 ? "text-left" : ""}
										>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
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
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						<ChevronLeftIcon className="h-4 w-4" />
					</Button>
					<Button
						aria-label="Go to next page"
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
