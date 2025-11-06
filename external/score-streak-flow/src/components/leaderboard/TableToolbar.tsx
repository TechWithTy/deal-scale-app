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
	return (
		<div className="flex flex-wrap items-center justify-between gap-2">
			<h2 className="font-semibold text-lg text-foreground sm:text-xl md:text-2xl lg:text-3xl">{title}</h2>
			<div className="flex items-center gap-2 sm:gap-3">
				<div className="flex items-center gap-1 sm:gap-2">
					<label htmlFor="page-size" className="text-muted-foreground text-xs sm:text-sm">
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
				<Badge variant="secondary" className="text-xs sm:text-sm">{displayedCount} players</Badge>
			</div>
		</div>
	);
};
