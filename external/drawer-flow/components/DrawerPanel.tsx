"use client";
import React from "react";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useDrawerFlowStore } from "../stores/drawerFlowStore";

interface DrawerPanelProps {
	children: React.ReactNode;
	onOpenChange?: (open: boolean) => void;
}

export const DrawerPanel: React.FC<DrawerPanelProps> = ({
	children,
	onOpenChange,
}) => {
	const { isOpen, setOpen, height } = useDrawerFlowStore();

	return (
		<Drawer
			open={isOpen}
			defaultOpen={false}
			onOpenChange={(o) => {
				setOpen(o);
				onOpenChange?.(o);
			}}
		>
			{/* Use DrawerContent so Vaul controls visibility & bottom positioning */}
			<DrawerContent>
				<div
					className="flex h-full max-h-[90vh] flex-col overflow-hidden"
					style={height ? { maxHeight: height } : undefined}
				>
					{children}
				</div>
			</DrawerContent>
		</Drawer>
	);
};
