"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as React from "react";

import { cn } from "@/lib/_utils";

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
					"z-50 w-72 rounded-md border border-border bg-popover text-popover-foreground shadow-md outline-none",
					className,
				)}
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
