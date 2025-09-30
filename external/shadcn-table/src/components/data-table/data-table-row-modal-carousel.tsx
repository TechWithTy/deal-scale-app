"use client";

import * as React from "react";
import type { Row, Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";

export interface DataTableRowModalCarouselProps<TData> {
	table: Table<TData>;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	index: number;
	setIndex: (i: number) => void;
	rows: Row<TData>[];
	onPrev: () => void;
	onNext: () => void;
	title?: (row: Row<TData>, index: number) => React.ReactNode;
	description?: (row: Row<TData>, index: number) => React.ReactNode;
	render: (row: Row<TData>, index: number) => React.ReactNode;
	actions?: (row: Row<TData>, index: number) => React.ReactNode;
	counter?: (row: Row<TData>, index: number) => React.ReactNode;
}

export function DataTableRowModalCarousel<TData>(
	props: DataTableRowModalCarouselProps<TData>,
) {
	const {
		open,
		onOpenChange,
		rows,
		index,
		onPrev,
		onNext,
		title,
		description,
		render,
		actions,
		counter,
	} = props;
	const row = rows[index];

	React.useEffect(() => {
		if (!open) return;
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowRight") onNext();
			if (e.key === "ArrowLeft") onPrev();
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [open, onNext, onPrev]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="-translate-x-1/2 -translate-y-1/2 border border-border bg-card fixed left-1/2 max-h-[90vh] max-w-4xl overflow-hidden p-0 shadow-lg top-1/2 w-full">
				<DialogHeader className="p-6 pb-4">
					<DialogTitle>
						{row && title
							? title(row, index)
							: "Lead Details"}
					</DialogTitle>
				</DialogHeader>
				<div
					className="px-6 overflow-y-auto"
					style={{ maxHeight: "calc(90vh - 200px)" }}
				>
					{row ? (
						render(row, index)
					) : (
						<div className="text-muted-foreground">No row</div>
					)}
				</div>
				<div className="mt-4 flex items-center justify-between gap-2 border-t p-6 pt-4">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						Close
					</Button>
					<div className="flex gap-2">
						{actions && actions(row, index)}
						{row && counter
							? counter(row, index)
							: rows.length > 0
								? `${index + 1} / ${rows.length}`
								: "0 / 0"}
					</div>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={onNext}
						aria-label="Next"
						className="gap-1.5"
					>
						<ChevronRight />
						Next
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
