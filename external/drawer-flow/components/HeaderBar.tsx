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
		<div className="relative flex flex-none items-center justify-between bg-secondary p-4 select-none">
			{/* Centered subtle resize handle */}
			<div
				className="pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-1.5 w-28 cursor-ns-resize rounded-full bg-gray-400 ring-1 ring-gray-300 hover:bg-gray-500 transition"
				onMouseDown={startResizing}
				aria-label="Resize drawer"
				title="Resize drawer"
			/>

			<h2 className="font-semibold text-lg">{titleCount} Items</h2>
			<div className="flex items-center gap-2">
				<DrawerClose asChild>
					<Button variant="ghost" size="icon" aria-label="Close">
						<X className="h-4 w-4" />
					</Button>
				</DrawerClose>
			</div>
		</div>
	);
};
