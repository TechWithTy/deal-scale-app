"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { useDrawerFlowStore } from "../stores/drawerFlowStore";

interface FooterBarProps {
	loadMore: () => Promise<void> | void;
}

export const FooterBar: React.FC<FooterBarProps> = ({ loadMore }) => {
	const { hasMore, isLoading, pageSize, setPageSize, pageSizeOptions } =
		useDrawerFlowStore();

	return (
		<div className="flex flex-none items-center justify-between border-t border-border p-4">
			<div className="flex items-center gap-2">
				<label htmlFor="df-page-size" className="text-sm">
					Page size:
				</label>
				<select
					id="df-page-size"
					value={pageSize}
					onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
					className="rounded border border-border bg-background px-2 py-1 text-sm"
				>
					{pageSizeOptions.map((opt) => (
						<option key={opt} value={opt}>
							{opt}
						</option>
					))}
				</select>
			</div>

			<Button onClick={loadMore} disabled={!hasMore || isLoading}>
				{isLoading ? "Loading..." : hasMore ? "Load More" : "No More"}
			</Button>
		</div>
	);
};
