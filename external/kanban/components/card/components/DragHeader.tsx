"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GripVertical, MoreVertical, Pencil, Trash } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";

export function DragHeader({
	attributes,
	listeners,
	onEdit,
	onDelete,
	aiControls,
	className = "",
}: {
	attributes: HTMLAttributes<HTMLElement>;
	listeners: any;
	onEdit: () => void;
	onDelete: () => void;
	aiControls?: ReactNode;
	className?: string;
}) {
	return (
		<div
			className={`space-between relative flex flex-row border-secondary border-b-2 px-3 py-3 ${className}`}
		>
			<Button
				variant="ghost"
				{...attributes}
				{...listeners}
				className="-ml-2 h-auto cursor-grab p-1 text-secondary-foreground/50"
			>
				<span className="sr-only">Move task</span>
				<GripVertical />
			</Button>
			<Badge variant="outline" className="ml-auto font-semibold">
				Task
			</Badge>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon" className="ml-1 h-8 w-8">
						<MoreVertical className="h-4 w-4" />
						<span className="sr-only">Open quick actions</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-36">
					<DropdownMenuItem onClick={onEdit}>
						<Pencil className="mr-2 h-4 w-4" /> Edit
					</DropdownMenuItem>
					<DropdownMenuItem
						className="text-destructive focus:text-destructive"
						onClick={onDelete}
					>
						<Trash className="mr-2 h-4 w-4" /> Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			{aiControls}
		</div>
	);
}
