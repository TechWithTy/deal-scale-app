"use client";

import {
	CaretDownIcon,
	CaretSortIcon,
	CaretUpIcon,
	CheckIcon,
} from "@radix-ui/react-icons";
import * as SelectPrimitive from "@radix-ui/react-select";
import * as React from "react";

import { cn } from "@/lib/_utils";

const OPAQUE_OVERLAY_BACKGROUND = "#020617";
const OPAQUE_OVERLAY_FOREGROUND = "#f8fafc";

const dismissRadixOverlay = () => {
	document.dispatchEvent(
		new KeyboardEvent("keydown", {
			bubbles: true,
			cancelable: true,
			key: "Escape",
		}),
	);
};

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
	<SelectPrimitive.Trigger
		ref={ref}
		className={cn(
			"flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
			className,
		)}
		{...props}
	>
		<span className="flex-1 truncate text-left">{children}</span>
		<SelectPrimitive.Icon asChild>
			<CaretSortIcon className="h-4 w-4 shrink-0 opacity-50" />
		</SelectPrimitive.Icon>
	</SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & {
		portal?: boolean;
	}
>(
	(
		{
			className,
			children,
			position = "popper",
			side = "bottom",
			avoidCollisions = false,
			align = "start",
			sideOffset = 4,
			portal = true,
			style,
			onPointerDownOutside,
			...props
		},
		ref,
	) => {
		const content = (
			<SelectPrimitive.Content
				ref={ref}
				className={cn(
					"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 !bg-popover !text-popover-foreground !opacity-100 relative z-[10000] max-h-[60vh] min-w-[8rem] overflow-hidden rounded-md border shadow-2xl backdrop-blur-none data-[state=closed]:animate-out data-[state=open]:animate-in",
					position === "popper" && "min-w-[var(--radix-select-trigger-width)]",
					className,
				)}
				position={position}
				side={side}
				align={align}
				sideOffset={sideOffset}
				avoidCollisions={avoidCollisions}
				style={{
					...style,
					backgroundColor: OPAQUE_OVERLAY_BACKGROUND,
					color: OPAQUE_OVERLAY_FOREGROUND,
					opacity: 1,
					zIndex: 10000,
					isolation: "isolate",
				}}
				onPointerDownOutside={(event) => {
					onPointerDownOutside?.(event);
					dismissRadixOverlay();
				}}
				{...props}
			>
				<SelectPrimitive.ScrollUpButton
					className="flex cursor-default items-center justify-center border-border border-b bg-popover py-1 text-muted-foreground"
					style={{ backgroundColor: OPAQUE_OVERLAY_BACKGROUND }}
				>
					<CaretUpIcon className="h-4 w-4" />
				</SelectPrimitive.ScrollUpButton>
				<SelectPrimitive.Viewport
					className="!bg-popover max-h-[60vh] touch-pan-y overflow-y-auto overscroll-contain p-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-500 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-slate-700 [&::-webkit-scrollbar]:w-2"
					style={{
						backgroundColor: OPAQUE_OVERLAY_BACKGROUND,
					}}
				>
					{children}
				</SelectPrimitive.Viewport>
				<SelectPrimitive.ScrollDownButton
					className="flex cursor-default items-center justify-center border-border border-t bg-popover py-1 text-muted-foreground"
					style={{ backgroundColor: OPAQUE_OVERLAY_BACKGROUND }}
				>
					<CaretDownIcon className="h-4 w-4" />
				</SelectPrimitive.ScrollDownButton>
			</SelectPrimitive.Content>
		);

		return portal ? (
			<SelectPrimitive.Portal>{content}</SelectPrimitive.Portal>
		) : (
			content
		);
	},
);
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Label>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
	<SelectPrimitive.Label
		ref={ref}
		className={cn("px-2 py-1.5 font-semibold text-sm", className)}
		{...props}
	/>
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, style, ...props }, ref) => (
	<SelectPrimitive.Item
		ref={ref}
		className={cn(
			"!text-popover-foreground relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none [--overlay-item-background:#020617] focus:text-accent-foreground data-[disabled]:pointer-events-none data-[highlighted]:text-accent-foreground data-[disabled]:opacity-50 focus:[--overlay-item-background:#1e293b] data-[highlighted]:[--overlay-item-background:#1e293b]",
			className,
		)}
		style={
			{
				...style,
				backgroundColor: "var(--overlay-item-background)",
				color: OPAQUE_OVERLAY_FOREGROUND,
				opacity: 1,
				"--overlay-item-background": OPAQUE_OVERLAY_BACKGROUND,
			} as React.CSSProperties
		}
		{...props}
	>
		<span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
			<SelectPrimitive.ItemIndicator>
				<CheckIcon className="h-4 w-4" />
			</SelectPrimitive.ItemIndicator>
		</span>
		<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
	</SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Separator>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
	<SelectPrimitive.Separator
		ref={ref}
		className={cn("-mx-1 my-1 h-px bg-muted", className)}
		{...props}
	/>
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
	Select,
	SelectGroup,
	SelectValue,
	SelectTrigger,
	SelectContent,
	SelectLabel,
	SelectItem,
	SelectSeparator,
};
