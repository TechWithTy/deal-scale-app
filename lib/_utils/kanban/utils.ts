import type { ColumnDragData } from "@/components/kanban/board-column";
import type { TaskDragData } from "@/components/kanban/task-card";
import type { Active, DataRef, Over } from "@dnd-kit/core";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

type DraggableData = ColumnDragData | TaskDragData;

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function hasDraggableData<T extends Active | Over>(
	entry: T | null | undefined,
): entry is T & {
	data: DataRef<DraggableData>;
} {
	if (!entry) {
		return false;
	}

	const data = entry.data.current;

	if (data?.type === "Column" || data?.type === "Task") {
		return true;
	}

	return false;
}
