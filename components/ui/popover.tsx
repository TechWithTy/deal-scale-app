"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as React from "react";

import { cn } from "@/lib/_utils";

const OPAQUE_OVERLAY_BACKGROUND = "#020617";
const OPAQUE_OVERLAY_FOREGROUND = "#f8fafc";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

type PopoverContentProps = React.ComponentPropsWithoutRef<
	typeof PopoverPrimitive.Content
> & {
	/**
	 * Render content inline instead of portaling to document.body.
	 * Useful for nested modals to prevent scroll locking on mobile.
	 */
	avoidPortal?: boolean;
	/**
	 * Additional props to pass to the Radix Portal when avoidPortal is false.
	 */
	portalProps?: React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Portal>;
};

const PopoverContent = React.forwardRef<
	React.ElementRef<typeof PopoverPrimitive.Content>,
	PopoverContentProps
>(
	(
		{
			className,
			align = "center",
			sideOffset = 4,
			avoidPortal = false,
			portalProps,
			style,
			...props
		},
		ref,
	) => {
		const content = (
			<PopoverPrimitive.Content
				ref={ref}
				align={align}
				sideOffset={sideOffset}
				onOpenAutoFocus={(event) => event.preventDefault()}
				onCloseAutoFocus={(event) => event.preventDefault()}
				className={cn(
					"!bg-popover !text-popover-foreground !opacity-100 z-50 w-72 rounded-md border border-border shadow-md outline-none backdrop-blur-none",
					className,
				)}
				style={{
					...style,
					backgroundColor: OPAQUE_OVERLAY_BACKGROUND,
					color: OPAQUE_OVERLAY_FOREGROUND,
					isolation: "isolate",
					opacity: 1,
				}}
				{...props}
			/>
		);

		if (avoidPortal) {
			return content;
		}

		return (
			<PopoverPrimitive.Portal {...portalProps}>
				{content}
			</PopoverPrimitive.Portal>
		);
	},
);
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent };
