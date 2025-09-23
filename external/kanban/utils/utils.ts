import type { Active, DataRef, Over } from "@dnd-kit/core";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

type DraggableData = { type: "Column" | "Task"; [key: string]: unknown };

export function hasDraggableData<T extends Active | Over>(
	entry: T | null | undefined,
): entry is T & { data: DataRef<DraggableData> } {
	if (!entry) return false;
	const data = entry.data.current as DraggableData | undefined;
	return data?.type === "Column" || data?.type === "Task";
}
