"use client";

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
	getFilteredRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import DataTable from "./steps/tables/DataTable";
import PaginationControls from "./steps/tables/PaginationControls";
import SearchBar from "./steps/tables/SearchBar";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	searchKey: string;
	pageCount: number;
	pageSizeOptions?: number[];
}

export function SocialMediaCampaignTable<TData, TValue>({
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
	const [search, setSearch] = useState("");

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

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pageIndex, pageSize, router, pathname, createQueryString]);

	const table = useReactTable({
		data: data.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize),
		columns,
		pageCount,
		getFilteredRowModel: getFilteredRowModel(),
		getCoreRowModel: getCoreRowModel(),
		state: {
			pagination: { pageIndex, pageSize },
			globalFilter: search,
		},
		onPaginationChange: setPagination,
		getPaginationRowModel: getPaginationRowModel(),
		manualPagination: true,
	});

	return (
		<>
			<SearchBar value={search} onChange={setSearch} searchKey={searchKey} />
			<DataTable table={table} />
			<PaginationControls
				pageIndex={pageIndex}
				pageCount={pageCount}
				setPagination={setPagination}
			/>
		</>
	);
}

export default SocialMediaCampaignTable;
