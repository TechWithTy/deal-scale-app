import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	DoubleArrowLeftIcon,
	DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type React from "react";

interface EmployeeTablePaginationProps {
	pageIndex: number;
	pageCount: number;
	pageSize: number;
	pageSizeOptions: number[];
	canPreviousPage: boolean;
	canNextPage: boolean;
	setPageIndex: (index: number) => void;
	setPageSize: (size: number) => void;
}

export const EmployeeTablePagination: React.FC<
	EmployeeTablePaginationProps
> = ({
	pageIndex,
	pageCount,
	pageSize,
	pageSizeOptions,
	canPreviousPage,
	canNextPage,
	setPageIndex,
	setPageSize,
}) => (
	<div className="flex w-full items-center justify-between gap-2 sm:justify-end">
		<div className="flex w-[100px] items-center justify-center font-medium text-sm">
			Page {pageIndex + 1} of {pageCount}
		</div>
		<div className="flex items-center space-x-2">
			<Button
				aria-label="Go to first page"
				variant="outline"
				className="hidden h-8 w-8 p-0 lg:flex"
				onClick={() => setPageIndex(0)}
				disabled={!canPreviousPage}
			>
				<DoubleArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
			</Button>
			<Button
				aria-label="Go to previous page"
				variant="outline"
				className="h-8 w-8 p-0"
				onClick={() => setPageIndex(pageIndex - 1)}
				disabled={!canPreviousPage}
			>
				<ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
			</Button>
			<Button
				aria-label="Go to next page"
				variant="outline"
				className="h-8 w-8 p-0"
				onClick={() => setPageIndex(pageIndex + 1)}
				disabled={!canNextPage}
			>
				<ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
			</Button>
			<Button
				aria-label="Go to last page"
				variant="outline"
				className="hidden h-8 w-8 p-0 lg:flex"
				onClick={() => setPageIndex(pageCount - 1)}
				disabled={!canNextPage}
			>
				<DoubleArrowRightIcon className="h-4 w-4" aria-hidden="true" />
			</Button>
			<Select
				value={`${pageSize}`}
				onValueChange={(value) => setPageSize(Number(value))}
			>
				<SelectTrigger className="h-8 w-[70px]">
					<SelectValue placeholder={pageSize} />
				</SelectTrigger>
				<SelectContent side="top">
					{pageSizeOptions.map((size) => (
						<SelectItem key={size} value={`${size}`}>
							{size}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	</div>
);
