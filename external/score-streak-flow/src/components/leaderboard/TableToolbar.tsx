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
		<div className="flex items-center justify-between">
			<h2 className="font-semibold text-2xl text-foreground">{title}</h2>
			<div className="flex items-center gap-3">
				<div className="flex items-center gap-2">
					<label htmlFor="page-size" className="text-muted-foreground text-sm">
						Show
					</label>
					<select
						id="page-size"
						className="h-8 rounded border border-input bg-background px-2 text-sm"
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
				<Badge variant="secondary">{displayedCount} players</Badge>
			</div>
		</div>
	);
};
