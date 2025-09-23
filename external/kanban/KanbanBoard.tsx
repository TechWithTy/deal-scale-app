"use client";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { hasDraggableData } from "./utils/utils";
import { useTaskStore } from "./utils/store";
import { useKanbanView } from "./utils/viewStore";
import type { KanbanColumn, KanbanTask, Status } from "./utils/types";
import {
	type Active,
	type Announcements,
	DndContext,
	type DragEndEvent,
	type DragOverEvent,
	DragOverlay,
	type DragStartEvent,
	type Over,
	MouseSensor,
	TouchSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import NewSectionDialog from "./components/new-section-dialog";
import { TaskCard } from "./components/task-card";
import { BoardContainer, BoardColumn } from "./components/board-column";
import ViewSearchAndSort from "./components/ViewSearchAndSort";
// Removed inline create buttons; creation handled by top-right NewTaskDialog

export type ColumnId = KanbanColumn["id"];

export function KanbanBoard() {
	const columns = useTaskStore((state) => state.columns);
	const setColumns = useTaskStore((state) => state.setCols);
	const tasks = useTaskStore((state) => state.tasks);
	const setTasks = useTaskStore((state) => state.setTasks);
	// View state: subscribe to search/filters/sort so we rerender on change
	const viewDeps = useKanbanView((s) => ({
		searchQuery: s.searchQuery,
		filters: s.filters,
		sort: s.sort,
	}));
	const deriveVisibleTasks = useKanbanView((s) => s.deriveVisibleTasks);
	// Compute every render so changes in view state immediately reflect
	const visibleTasks = deriveVisibleTasks(tasks);
	const pickedUpTaskColumn = useRef<ColumnId | null>(null);
	const columnsId = useMemo(
		() => columns.map((col) => String(col.id)),
		[columns],
	);

	const [activeColumn, setActiveColumn] = useState<KanbanColumn | null>(null);
	const [isMounted, setIsMounted] = useState<boolean>(false);
	const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);
	// Creation dialogs are managed outside via NewTaskDialog.

	const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

	useEffect(() => {
		setIsMounted(true);
	}, []);

	if (!isMounted) return null;

	// Typed drag data helpers to avoid `any`
	type ColumnDragData = { type: "Column"; column: KanbanColumn };
	type TaskDragData = { type: "Task"; task: KanbanTask };
	type DragData = ColumnDragData | TaskDragData;

	function readDragData(
		entry: Active | Over | null | undefined,
	): DragData | null {
		if (!hasDraggableData(entry)) return null;
		// We set data.current on draggable sources to match DragData shape
		return entry.data.current as DragData;
	}

	function getDraggingTaskData(taskId: string, columnId: ColumnId) {
		const tasksInColumn = visibleTasks.filter(
			(task) => String(task.status) === String(columnId),
		);
		const taskPosition = tasksInColumn.findIndex(
			(task) => String(task.id) === String(taskId),
		);
		const column = columns.find((col) => String(col.id) === String(columnId));
		return {
			tasksInColumn,
			taskPosition,
			column,
		};
	}

	const announcements: Announcements = {
		onDragStart({ active }) {
			if (!hasDraggableData(active)) return;

			if (active.data.current?.type === "Column") {
				const startColumnIdx = columnsId.findIndex(
					(id) => id === String(active.id),
				);
				const startColumn = columns[startColumnIdx];
				return `Picked up Column ${startColumn?.title} at position: ${startColumnIdx + 1} of ${columnsId.length}`;
			}
			if (active.data.current?.type === "Task") {
				const data = readDragData(active);
				pickedUpTaskColumn.current =
					data?.type === "Task" ? (data.task.status as ColumnId) : null;
				const currentColumnId =
					pickedUpTaskColumn.current ?? (columnsId[0] as ColumnId);
				const { tasksInColumn, taskPosition, column } = getDraggingTaskData(
					String(active.id),
					currentColumnId,
				);
				const taskTitle = data?.type === "Task" ? data.task.title : "";
				return `Picked up Task ${taskTitle} at position: ${taskPosition + 1} of ${tasksInColumn.length} in column ${column?.title}`;
			}
		},
		onDragOver({ active, over }) {
			if (!hasDraggableData(active) || !hasDraggableData(over)) return;
			if (
				active.data.current?.type === "Task" &&
				over.data.current?.type === "Task"
			) {
				const overData = readDragData(over);
				const overStatus: ColumnId =
					overData?.type === "Task"
						? (overData.task.status as ColumnId)
						: (columnsId[0] as ColumnId);
				const { tasksInColumn, taskPosition, column } = getDraggingTaskData(
					String(over.id),
					overStatus,
				);
				const activeData = readDragData(active);
				const activeTaskTitle =
					activeData?.type === "Task" ? activeData.task.title : "";
				return `Task ${activeTaskTitle} was moved over position ${taskPosition + 1} of ${tasksInColumn.length} in column ${column?.title}`;
			}
		},
		onDragEnd({ active, over }) {
			if (!hasDraggableData(active) || !hasDraggableData(over)) {
				pickedUpTaskColumn.current = null;
				return;
			}
			const activeTaskId = active.id;
			const overTaskId = over.id;
			const activeTaskData = readDragData(active);
			if (activeTaskId === overTaskId) return;
			const activeTaskIndex = tasks.findIndex(
				(task) => String(task.id) === String(activeTaskId),
			);
			const overTaskIndex = tasks.findIndex(
				(task) => String(task.id) === String(overTaskId),
			);
			if (activeTaskData?.type === "Task") {
				const activeTask = tasks[activeTaskIndex];
				const overTask = tasks[overTaskIndex];
				if (overTask && activeTask.status !== overTask.status) {
					activeTask.status = overTask.status;
				}
				const updatedTasks = arrayMove(tasks, activeTaskIndex, overTaskIndex);
				setTasks(updatedTasks);
				return `Task "${activeTask.title}" was moved to position ${overTaskIndex + 1} in column "${overTask.status}".`;
			}
			pickedUpTaskColumn.current = null;
			return;
		},
		onDragCancel({ active }) {
			pickedUpTaskColumn.current = null;
			const t = readDragData(active)?.type;
			return `Dragging ${t ?? "item"} cancelled.`;
		},
	};

	return (
		<DndContext
			accessibility={{ announcements }}
			sensors={sensors}
			onDragStart={onDragStart}
			onDragEnd={onDragEnd}
			onDragOver={onDragOver}
		>
			{/* View toolbar: search + sorting */}
			<div className="px-2 md:px-0">
				<ViewSearchAndSort />
			</div>
			<BoardContainer>
				{/* Actions toolbar removed; use top-right NewTaskDialog buttons */}
				<SortableContext items={columnsId}>
					{columns?.map((col, index) => (
						<Fragment key={String(col.id)}>
							<BoardColumn
								column={col}
								tasks={visibleTasks.filter(
									(task) => String(task.status) === String(col.id),
								)}
							/>
							{index === columns?.length - 1 && (
								<div className="w-[300px]">
									<NewSectionDialog />
								</div>
							)}
						</Fragment>
					))}
					{!columns.length && <NewSectionDialog />}
				</SortableContext>
			</BoardContainer>

			{/* Create/Edit Dialog removed here; managed by NewTaskDialog */}

			{"document" in window &&
				createPortal(
					<DragOverlay>
						{activeColumn && (
							<BoardColumn
								isOverlay
								column={activeColumn}
								tasks={visibleTasks.filter(
									(task) => task.status === activeColumn.id,
								)}
							/>
						)}
						{activeTask && <TaskCard task={activeTask} isOverlay />}
					</DragOverlay>,
					document.body,
				)}
		</DndContext>
	);

	function onDragStart(event: DragStartEvent) {
		if (!hasDraggableData(event.active)) return;
		const data = readDragData(event.active);
		if (data?.type === "Column") {
			setActiveColumn(data.column);
			return;
		}
		if (data?.type === "Task") {
			setActiveTask(data.task);
			return;
		}
	}

	function onDragEnd(event: DragEndEvent) {
		setActiveColumn(null);
		setActiveTask(null);
		const { active, over } = event;
		if (!over) return;
		const activeId = active.id;
		const overId = over.id;
		if (!hasDraggableData(active)) return;
		const activeData = readDragData(active);
		if (activeId === overId) return;
		const isActiveAColumn = activeData?.type === "Column";
		if (!isActiveAColumn) return;
		const activeColumnIndex = columns.findIndex(
			(col) => String(col.id) === String(activeId),
		);
		const overColumnIndex = columns.findIndex(
			(col) => String(col.id) === String(overId),
		);
		setColumns(arrayMove(columns, activeColumnIndex, overColumnIndex));
	}

	function onDragOver(event: DragOverEvent) {
		const { active, over } = event;
		if (!over) return;
		const activeId = active.id;
		const overId = over.id;
		if (activeId === overId) return;
		if (!hasDraggableData(active) || !hasDraggableData(over)) return;
		const activeData = readDragData(active);
		const overData = readDragData(over);
		const isActiveATask = activeData?.type === "Task";
		const isOverATask = overData?.type === "Task";
		if (!isActiveATask) return;
		if (isActiveATask && isOverATask) {
			const activeIndex = tasks.findIndex((t) => t.id === activeId);
			const overIndex = tasks.findIndex((t) => t.id === overId);
			const activeTask = tasks[activeIndex];
			const overTask = tasks[overIndex];
			if (activeTask && overTask && activeTask.status !== overTask.status) {
				activeTask.status = overTask.status;
				setTasks(arrayMove(tasks, activeIndex, overIndex - 1));
			}
			setTasks(arrayMove(tasks, activeIndex, overIndex));
		}
		const isOverAColumn = overData?.type === "Column";
		if (isActiveATask && isOverAColumn) {
			const activeIndex = tasks.findIndex((t) => t.id === activeId);
			const activeTask = tasks[activeIndex];
			if (activeTask && columnsId.includes(String(overId))) {
				activeTask.status = overId as Status;
				setTasks(arrayMove(tasks, activeIndex, activeIndex));
			}
		}
	}
}
