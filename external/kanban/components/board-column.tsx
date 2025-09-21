"use client";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { KanbanColumn, KanbanTask } from "../utils/types";
import { useDndContext } from "@dnd-kit/core";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cva } from "class-variance-authority";
import { GripVertical } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ColumnActions } from "./column-action";
import { defaultCols } from "../utils/mocks";
import { TaskCard } from "./task-card";

export type ColumnType = "Column";

export interface ColumnDragData {
	type: ColumnType;
	column: KanbanColumn;
}

interface BoardColumnProps {
	column: KanbanColumn;
	tasks: KanbanTask[];
	isOverlay?: boolean;
}

export function BoardColumn({ column, tasks, isOverlay }: BoardColumnProps) {
	const tasksIds = useMemo(() => {
		return tasks.map((task) => task.id);
	}, [tasks]);

	const {
		setNodeRef,
		attributes,
		listeners,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: column.id,
		data: {
			type: "Column",
			column,
		} satisfies ColumnDragData,
		attributes: { roleDescription: `Column: ${column.title}` },
	});

	const style = { transition, transform: CSS.Translate.toString(transform) };

	const variants = cva(
		"h-[75vh] max-h-[75vh] w-[350px] max-w-full bg-secondary flex flex-col flex-shrink-0 snap-center",
		{
			variants: {
				dragging: {
					default: "border-2 border-transparent",
					over: "ring-2 opacity-30",
					overlay: "ring-2 ring-primary",
				},
			},
		},
	);

	const defaultColIds = new Set(defaultCols.map((col) => col.id));

	return (
		<Card
			ref={setNodeRef}
			style={style}
			className={variants({
				dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
			})}
		>
			<CardHeader className="space-between flex flex-row items-center border-b-2 p-4 text-left font-semibold">
				<Button
					variant={"ghost"}
					{...attributes}
					{...listeners}
					className="-ml-2 relative h-auto cursor-grab p-1 text-primary/50"
				>
					<span className="sr-only">{`Move column: ${column.title}`}</span>
					<GripVertical />
				</Button>
				<span className="!mt-0 mr-auto font-semibold text-base">
					{column.title}
				</span>
				{!defaultColIds.has(column.id) && (
					<ColumnActions title={column.title} id={String(column.id)} />
				)}
			</CardHeader>
			<CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden p-2">
				<ScrollArea className="min-h-0 flex-1">
					<div className="flex flex-col gap-6">
						<SortableContext items={tasksIds}>
							{tasks.map((task) => (
								<TaskCard key={task.id} task={task} />
							))}
						</SortableContext>
					</div>
				</ScrollArea>
			</CardContent>
		</Card>
	);
}

export function BoardContainer({ children }: { children: React.ReactNode }) {
	const dndContext = useDndContext();
	const variations = cva("px-2  pb-4 md:px-0 flex lg:justify-start", {
		variants: { dragging: { default: "", active: "snap-none" } },
	});
	return (
		<ScrollArea className="w-full whitespace-nowrap rounded-md">
			<div
				className={variations({
					dragging: dndContext.active ? "active" : "default",
				})}
			>
				<div className="flex flex-row items-start justify-center gap-4">
					{children}
				</div>
			</div>
			<ScrollBar orientation="horizontal" />
		</ScrollArea>
	);
}
