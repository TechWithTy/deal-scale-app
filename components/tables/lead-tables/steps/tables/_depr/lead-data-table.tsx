// import type { ColumnDef } from "@tanstack/react-table";
// import React, { useState } from "react";
// import { useLeadTablePagination } from "@/components/tables/lead-tables/steps/tables/useLeadTablePagination";
// import { LeadTableFilters } from "@/components/tables/lead-tables/steps/tables/LeadTableFilters";
// import { LeadTableBody } from "@/components/tables/lead-tables/steps/tables/LeadTableBody";
// import { LeadTablePagination } from "@/components/tables/lead-tables/steps/tables/LeadTablePagination";
// import {
// 	useReactTable,
// 	getCoreRowModel,
// 	getFilteredRowModel,
// 	getPaginationRowModel,
// } from "@tanstack/react-table";
// import type { LeadTypeGlobal } from "@/types/_dashboard/leads";
// import { MessageCircle } from "lucide-react";
// import ActivitySidebar from "../../../../../reusables/sidebars/activity";
// import { ScrollArea, ScrollBar } from "../../../../../ui/scroll-area";
// import { Button } from "../../../../../ui/button";

// // Status options for the dropdown
// const statusOptions = [
// 	{
// 		value: "new",
// 		label: "New Lead",
// 		bgColor: "bg-blue-600",
// 		textColor: "text-white",
// 	},
// 	{
// 		value: "contacted",
// 		label: "Contacted",
// 		bgColor: "bg-yellow-600",
// 		textColor: "text-white",
// 	},
// 	{
// 		value: "closed",
// 		label: "Closed",
// 		bgColor: "bg-green-600",
// 		textColor: "text-white",
// 	},
// 	{
// 		value: "lost",
// 		label: "Lost",
// 		bgColor: "bg-red-600",
// 		textColor: "text-white",
// 	},
// ];

// // Function to get the status color for the dropdown
// // const getStatusColor = (status: string) => {
// //   const selectedStatus = statusOptions.find(
// //     (option) => option.value === status
// //   );
// //   return selectedStatus
// //     ? `${selectedStatus.bgColor} ${selectedStatus.textColor}`
// //     : '';
// // };

// interface DataTableProps {
// 	columns: ColumnDef<LeadTypeGlobal>[];
// 	data: LeadTypeGlobal[];
// 	searchKey: string;
// 	pageCount: number;
// 	pageSizeOptions?: number[];
// }

// export function LeadDataTable({
// 	columns,
// 	data,
// 	searchKey,
// 	pageCount,
// 	pageSizeOptions = [10, 20, 30, 50],
// }: DataTableProps) {
// 	const [statuses, setStatuses] = useState<Record<string, string>>({});
// 	const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
// 	const [selectedLead, setSelectedLead] = useState<LeadTypeGlobal | null>(null);

// 	// Use custom pagination/search hook
// 	const {
// 		router,
// 		pathname,
// 		searchParams,
// 		createQueryString,
// 		pagination,
// 		setPagination,
// 	} = useLeadTablePagination(pageSizeOptions[0]);
// 	const { pageIndex, pageSize } = pagination;

// 	// Table instance
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

// 	React.useEffect(() => {
// 		if (searchValue?.length > 0) {
// 			router.push(
// 				`${pathname}?${createQueryString({
// 					page: null,
// 					limit: null,
// 					search: searchValue,
// 				})}`,
// 				{ scroll: false },
// 			);
// 		}
// 		if (searchValue?.length === 0 || searchValue === undefined) {
// 			router.push(
// 				`${pathname}?${createQueryString({
// 					page: null,
// 					limit: null,
// 					search: null,
// 				})}`,
// 				{ scroll: false },
// 			);
// 		}
// 		setPagination((prev) => ({ ...prev, pageIndex: 0 }));
// 		// biome-ignore lint/correctness/useExhaustiveDependencies: intentional
// 	}, [searchValue]);

// 	// Status change logic
// 	const handleStatusChange = (id: string, newValue: string) => {
// 		setStatuses((prev) => ({ ...prev, [id]: newValue }));
// 	};

// 	// Sidebar logic
// 	const openSidebar = (lead: LeadTypeGlobal) => {
// 		setSelectedLead(lead);
// 		setIsSidebarOpen(true);
// 	};
// 	const closeSidebar = () => setIsSidebarOpen(false);

// 	// Status dropdown options
// 	const statusOptions = [
// 		{
// 			value: "new",
// 			label: "New Lead",
// 			bgColor: "bg-blue-600",
// 			textColor: "text-white",
// 		},
// 		{
// 			value: "contacted",
// 			label: "Contacted",
// 			bgColor: "bg-yellow-600",
// 			textColor: "text-white",
// 		},
// 		{
// 			value: "closed",
// 			label: "Closed",
// 			bgColor: "bg-green-600",
// 			textColor: "text-white",
// 		},
// 		{
// 			value: "lost",
// 			label: "Lost",
// 			bgColor: "bg-red-600",
// 			textColor: "text-white",
// 		},
// 	];

// 	return (
// 		<>
// 			{/* Filter/Search UI */}
// 			<LeadTableFilters
// 				searchKey={searchKey}
// 				searchValue={searchValue ?? ""}
// 				onChange={(value) => table.getColumn(searchKey)?.setFilterValue(value)}
// 			/>
// 			<ScrollArea className="h-[calc(80vh-220px)] rounded-md border md:h-[calc(80dvh-200px)]">
// 				<LeadTableBody table={table} columnsLength={columns.length} />
// 				<ScrollBar orientation="horizontal" />
// 			</ScrollArea>
// 			<div className="flex flex-col items-center justify-end gap-2 space-x-2 py-4 sm:flex-row">
// 				<div className="flex w-full items-center justify-between">
// 					<div className="flex-1 text-muted-foreground text-sm">
// 						{table.getFilteredSelectedRowModel().rows.length} of{" "}
// 						{table.getFilteredRowModel().rows.length} row(s) selected.
// 					</div>
// 				</div>
// 				<LeadTablePagination
// 					pageIndex={table.getState().pagination.pageIndex}
// 					pageCount={table.getPageCount()}
// 					pageSize={table.getState().pagination.pageSize}
// 					pageSizeOptions={pageSizeOptions}
// 					canPreviousPage={table.getCanPreviousPage()}
// 					canNextPage={table.getCanNextPage()}
// 					setPageIndex={table.setPageIndex}
// 					setPageSize={table.setPageSize}
// 				/>
// 			</div>
// 			{/* Conditionally render the ActivitySidebar with the selected lead */}
// 			{isSidebarOpen && selectedLead && (
// 				<ActivitySidebar onClose={closeSidebar} leadData={selectedLead} />
// 			)}
// 		</>
// 	);
// }
