"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { DrawerClose } from "@/components/ui/drawer";
import { X } from "lucide-react";
import { useResizeHandle } from "../hooks/useResizeHandle";

interface HeaderBarProps {
	titleCount: number;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ titleCount }) => {
	const { startResizing } = useResizeHandle();

	return (
		<div className="flex flex-none items-center justify-between bg-secondary p-4 select-none">
			<h2 className="font-semibold text-lg">{titleCount} Items</h2>
			<div className="flex items-center gap-2">
				<div
					className="h-3 w-32 cursor-ns-resize rounded-full bg-primary/60 ring-1 ring-border shadow-sm hover:bg-primary transition-colors"
					onMouseDown={startResizing}
					aria-label="Resize drawer"
					title="Resize drawer"
				/>
				<DrawerClose asChild>
					<Button variant="ghost" size="icon" aria-label="Close">
						<X className="h-4 w-4" />
					</Button>
				</DrawerClose>
			</div>
		</div>
	);
};
