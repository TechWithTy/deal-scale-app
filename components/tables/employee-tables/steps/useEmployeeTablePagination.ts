import type { PaginationState } from "@tanstack/react-table";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

// * Handles pagination/search param state and effects for EmployeeTable
export function useEmployeeTablePagination() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const page = searchParams?.get("page") ?? "1";
	const pageAsNumber = Number(page);
	const fallbackPage =
		Number.isNaN(pageAsNumber) || pageAsNumber < 1 ? 1 : pageAsNumber;

	const per_page = searchParams?.get("limit") ?? "10";
	const perPageAsNumber = Number(per_page);
	const fallbackPerPage = Number.isNaN(perPageAsNumber) ? 10 : perPageAsNumber;

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

	const [pagination, setPagination] = React.useState<PaginationState>({
		pageIndex: fallbackPage - 1,
		pageSize: fallbackPerPage,
	});

	return {
		router,
		pathname,
		searchParams,
		createQueryString,
		pagination,
		setPagination,
	};
}
