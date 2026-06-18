import { Badge } from "@root/components/ui/badge";
import type React from "react";

interface Props {
	title: string;
	displayedCount: number;
	pageSize: number;
	setPageSize: (n: number) => void;
	pageSizeOptions: readonly number[];
}

export const TableToolbar: React.FC<Props> = ({
	title,
	displayedCount,
	pageSize,
	setPageSize,
	pageSizeOptions,
}) => {
	const hasPlayers = displayedCount > 0;

	return (
		<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
			<h2 className="min-w-0 truncate font-semibold text-base text-foreground sm:text-lg md:text-xl">
				{title}
			</h2>
			<div className="flex min-w-0 flex-wrap items-center gap-2 sm:justify-end">
				{hasPlayers && (
					<div className="flex items-center gap-1 sm:gap-2">
						<label
							htmlFor="page-size"
							className="whitespace-nowrap text-muted-foreground text-xs sm:text-sm"
						>
							Show
						</label>
						<select
							id="page-size"
							className="h-7 rounded border border-input bg-background px-1.5 text-xs sm:h-8 sm:px-2 sm:text-sm"
							value={pageSize}
							onChange={(e) => setPageSize(Number.parseInt(e.target.value))}
						>
							{pageSizeOptions.map((opt) => (
								<option key={opt} value={opt}>
									{opt}
								</option>
							))}
						</select>
					</div>
				)}
				<Badge
					variant="secondary"
					className="max-w-full whitespace-nowrap text-xs sm:text-sm"
				>
					{hasPlayers
						? `${displayedCount.toLocaleString()} players`
						: "No players"}
				</Badge>
			</div>
		</div>
	);
};
