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
			<DialogContent className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden border border-border bg-card text-foreground shadow-xl">
				<DialogHeader className="border-b border-border pb-4 pl-6 pr-6 pt-6">
					<DialogTitle className="flex items-center gap-2 text-xl font-semibold">
						{row && title
							? title(row, index)
							: "Lead Details"}
						{row && (
							<span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
								{index + 1} of {rows.length}
							</span>
						)}
					</DialogTitle>
				</DialogHeader>
				<div className="flex-1 overflow-y-auto px-6 py-4">
					{row ? (
						render(row, index)
					) : (
						<div className="flex h-32 items-center justify-center">
							<div className="text-center text-muted-foreground">
								<div className="mb-2 text-4xl">📋</div>
								<p>No lead data available</p>
							</div>
						</div>
					)}
				</div>
				<div className="border-t border-border bg-muted/30 px-6 py-4">
					<div className="flex items-center justify-between">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							className="gap-2"
						>
							✕ Close
						</Button>
						<div className="flex items-center gap-2">
							{actions && row && actions(row, index)}
							<div className="flex gap-1">
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={onPrev}
									disabled={index === 0}
									aria-label="Previous"
									className="gap-1.5"
								>
									← Prev
								</Button>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={onNext}
									disabled={index === rows.length - 1}
									aria-label="Next"
									className="gap-1.5"
								>
									Next →
								</Button>
							</div>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
