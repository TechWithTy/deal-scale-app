import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type React from "react";

interface PaginationControlsProps {
	pageIndex: number;
	pageCount: number;
	setPagination: (
		updater: (prev: { pageIndex: number; pageSize: number }) => {
			pageIndex: number;
			pageSize: number;
		},
	) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
	pageIndex,
	pageCount,
	setPagination,
}) => (
	<div className="flex items-center justify-between space-x-2 py-4">
		<div className="flex-1 text-muted-foreground text-sm">
			Page {pageIndex + 1} of {pageCount}
		</div>
		<div className="space-x-2">
			<Button
				variant="outline"
				size="sm"
				onClick={() =>
					setPagination((prev) => ({
						...prev,
						pageIndex: Math.max(prev.pageIndex - 1, 0),
					}))
				}
				disabled={pageIndex === 0}
				type="button"
			>
				<ChevronLeftIcon className="h-4 w-4" />
			</Button>
			<Button
				variant="outline"
				size="sm"
				onClick={() =>
					setPagination((prev) => ({
						...prev,
						pageIndex: Math.min(prev.pageIndex + 1, pageCount - 1),
					}))
				}
				disabled={pageIndex >= pageCount - 1}
				type="button"
			>
				<ChevronRightIcon className="h-4 w-4" />
			</Button>
		</div>
	</div>
);

export default PaginationControls;
