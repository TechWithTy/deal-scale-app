// "use client";
// import {
// 	type ColumnDef,
// 	type PaginationState,
// 	getCoreRowModel,
// 	getFilteredRowModel,
// 	getPaginationRowModel,
// 	useReactTable,
// } from "@tanstack/react-table";
// import React from "react";

// import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
// import { useEmployeeTablePagination } from "../steps/useEmployeeTablePagination";
// import { EmployeeTableFilters } from "../steps/EmployeeTableFilters";
// import { EmployeeTableBody } from "../steps/EmployeeTableBody";
// import { EmployeeTablePagination } from "../steps/EmployeeTablePagination";

// interface DataTableProps<TData, TValue> {
// 	columns: ColumnDef<TData, TValue>[];
// 	data: TData[];
// 	searchKey: string;
// 	pageNo: number;
// 	totalUsers: number;
// 	pageSizeOptions?: number[];
// 	pageCount: number;
// 	searchParams?: {
// 		[key: string]: string | string[] | undefined;
// 	};
// }

// // * Optimized EmployeeTable using modular steps
// export function EmployeeTable<TData, TValue>({
// 	columns,
// 	data,
// 	pageNo,
// 	searchKey,
// 	totalUsers,
// 	pageCount,
// 	pageSizeOptions = [10, 20, 30, 40, 50],
// }: DataTableProps<TData, TValue>) {
// 	// * Use custom hook for pagination/search state
// 	const {
// 		router,
// 		pathname,
// 		searchParams,
// 		createQueryString,
// 		pagination,
// 		setPagination,
// 	} = useEmployeeTablePagination();

// 	const { pageIndex, pageSize } = pagination;

// 	const table = useReactTable({
// 		data,
// 		columns,
// 		pageCount: pageCount ?? -1,
// 		getCoreRowModel: getCoreRowModel(),
// 		getFilteredRowModel: getFilteredRowModel(),
// 		state: {
// 			pagination: { pageIndex, pageSize },
// 		},
// 		onPaginationChange: setPagination,
// 		getPaginationRowModel: getPaginationRowModel(),
// 		manualPagination: true,
// 		manualFiltering: true,
// 	});

// 	const searchValue = table.getColumn(searchKey)?.getFilterValue() as string;

// 	// React.useEffect(() => {
// 	//   if (debounceValue.length > 0) {
// 	//     router.push(
// 	//       `${pathname}?${createQueryString({
// 	//         [selectedOption.value]: `${debounceValue}${
// 	//           debounceValue.length > 0 ? `.${filterVariety}` : ""
// 	//         }`,
// 	//       })}`,
// 	//       {
// 	//         scroll: false,
// 	//       }
// 	//     )
// 	//   }

// 	//   if (debounceValue.length === 0) {
// 	//     router.push(
// 	//       `${pathname}?${createQueryString({
// 	//         [selectedOption.value]: null,
// 	//       })}`,
// 	//       {
// 	//         scroll: false,
// 	//       }
// 	//     )
// 	//   }
// 	//   // eslint-disable-next-line react-hooks/exhaustive-deps
// 	// }, [debounceValue, filterVariety, selectedOption.value])

// 	React.useEffect(() => {
// 		if (searchValue?.length > 0) {
// 			router.push(
// 				`${pathname}?${createQueryString({
// 					page: null,
// 					limit: null,
// 					search: searchValue,
// 				})}`,
// 				{
// 					scroll: false,
// 				},
// 			);
// 		}
// 		if (searchValue?.length === 0 || searchValue === undefined) {
// 			router.push(
// 				`${pathname}?${createQueryString({
// 					page: null,
// 					limit: null,
// 					search: null,
// 				})}`,
// 				{
// 					scroll: false,
// 				},
// 			);
// 		}

// 		setPagination((prev) => ({ ...prev, pageIndex: 0 }));
// 		// eslint-disable-next-line react-hooks/exhaustive-deps
// 	}, [searchValue]);

// 	return (
// 		<>
// 			{/* Filter/Search UI */}
// 			<EmployeeTableFilters
// 				searchKey={searchKey}
// 				searchValue={searchValue ?? ""}
// 				onChange={(value) => table.getColumn(searchKey)?.setFilterValue(value)}
// 			/>
// 			<ScrollArea className="h-[calc(80vh-220px)] rounded-md border">
// 				<EmployeeTableBody table={table} columnsLength={columns.length} />
// 				<ScrollBar orientation="horizontal" />
// 			</ScrollArea>

// 			<div className="flex flex-col items-center justify-end gap-2 space-x-2 py-4 sm:flex-row">
// 				<div className="flex w-full items-center justify-between">
// 					<div className="flex-1 text-muted-foreground text-sm">
// 						{table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
// 					</div>
// 				</div>
// 				<EmployeeTablePagination
// 					pageIndex={table.getState().pagination.pageIndex}
// 					pageCount={table.getPageCount()}
// 					pageSize={table.getState().pagination.pageSize}
// 					pageSizeOptions={pageSizeOptions}
// 					canPreviousPage={table.getCanPreviousPage()}
// 					canNextPage={table.getCanNextPage()}
// 					setPageIndex={table.setPageIndex}
// 					setPageSize={table.setPageSize}
// 				/>
// 						<Button
// 							aria-label="Go to next page"
// 							variant="outline"
// 							className="h-8 w-8 p-0"
// 							onClick={() => table.nextPage()}
// 							disabled={!table.getCanNextPage()}
// 						>
// 							<ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
// 						</Button>
// 						<Button
// 							aria-label="Go to last page"
// 							variant="outline"
// 							className="hidden h-8 w-8 p-0 lg:flex"
// 							onClick={() => table.setPageIndex(table.getPageCount() - 1)}
// 							disabled={!table.getCanNextPage()}
// 						>
// 							<DoubleArrowRightIcon className="h-4 w-4" aria-hidden="true" />
// 						</Button>
// 					</div>
// 				</div>
// 			</div>
// 		</>
// 	);
// }
