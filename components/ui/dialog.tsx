"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import * as React from "react";

import { cn } from "@/lib/_utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Overlay>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Overlay
		ref={ref}
		className={cn(
			"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-background/80 data-[state=closed]:animate-out data-[state=open]:animate-in",
			className,
		)}
		onMouseDown={(e) => {
			// Check if click target is within a toast - if so, don't let overlay handle it
			const target = e.target as HTMLElement;
			// Check using composedPath for shadow DOM compatibility
			const nativeEvent = e.nativeEvent || e;
			const composedPath = (
				typeof nativeEvent.composedPath === "function"
					? nativeEvent.composedPath()
					: [target]
			) as HTMLElement[];

			// Check if any element in the event path is a toast
			for (const element of composedPath) {
				if (
					element &&
					element !== document.body &&
					element.nodeType === Node.ELEMENT_NODE
				) {
					const isToast =
						(element.hasAttribute &&
							element.hasAttribute("data-sonner-toast")) ||
						(element.closest &&
							element.closest("[data-sonner-toast]") !== null) ||
						(element.closest &&
							element.closest('[class*="toaster"]') !== null) ||
						(element.closest && element.closest('[id^="sonner-"]') !== null) ||
						(element.closest && element.closest('[class*="sonner"]') !== null);

					if (isToast) {
						e.stopPropagation();
						e.preventDefault();
						return;
					}

					// Check by z-index
					try {
						const zIndex = window.getComputedStyle(element).zIndex;
						if (zIndex && Number.parseInt(zIndex, 10) >= 10000) {
							e.stopPropagation();
							e.preventDefault();
							return;
						}
					} catch {
						// Ignore errors accessing computed styles
					}
				}
			}

			// Fallback: check target and parents
			let element: HTMLElement | null = target;
			while (element && element !== document.body) {
				const isToast =
					element.hasAttribute("data-sonner-toast") ||
					element.closest("[data-sonner-toast]") !== null ||
					element.closest('[class*="toaster"]') !== null ||
					element.closest('[id^="sonner-"]') !== null ||
					element.closest('[class*="sonner"]') !== null;

				if (isToast) {
					e.stopPropagation();
					e.preventDefault();
					return;
				}

				try {
					const zIndex = window.getComputedStyle(element).zIndex;
					if (zIndex && Number.parseInt(zIndex, 10) >= 10000) {
						e.stopPropagation();
						e.preventDefault();
						return;
					}
				} catch {
					// Ignore errors
				}
				element = element.parentElement;
			}
		}}
		onClick={(e) => {
			// Same check for onClick - stop propagation to prevent modal close
			const target = e.target as HTMLElement;
			const nativeEvent = e.nativeEvent || e;
			const composedPath = (
				typeof nativeEvent.composedPath === "function"
					? nativeEvent.composedPath()
					: [target]
			) as HTMLElement[];

			// Check if any element in the event path is a toast
			for (const element of composedPath) {
				if (
					element &&
					element !== document.body &&
					element.nodeType === Node.ELEMENT_NODE
				) {
					const isToast =
						(element.hasAttribute &&
							element.hasAttribute("data-sonner-toast")) ||
						(element.closest &&
							element.closest("[data-sonner-toast]") !== null) ||
						(element.closest &&
							element.closest('[class*="toaster"]') !== null) ||
						(element.closest && element.closest('[id^="sonner-"]') !== null) ||
						(element.closest && element.closest('[class*="sonner"]') !== null);

					if (isToast) {
						e.stopPropagation();
						e.preventDefault();
						return;
					}

					// Check by z-index
					try {
						const zIndex = window.getComputedStyle(element).zIndex;
						if (zIndex && Number.parseInt(zIndex, 10) >= 10000) {
							e.stopPropagation();
							e.preventDefault();
							return;
						}
					} catch {
						// Ignore errors
					}
				}
			}

			// Fallback: check target and parents
			let element: HTMLElement | null = target;
			while (element && element !== document.body) {
				const isToast =
					element.hasAttribute("data-sonner-toast") ||
					element.closest("[data-sonner-toast]") !== null ||
					element.closest('[class*="toaster"]') !== null ||
					element.closest('[id^="sonner-"]') !== null ||
					element.closest('[class*="sonner"]') !== null;

				if (isToast) {
					e.stopPropagation();
					e.preventDefault();
					return;
				}

				try {
					const zIndex = window.getComputedStyle(element).zIndex;
					if (zIndex && Number.parseInt(zIndex, 10) >= 10000) {
						e.stopPropagation();
						e.preventDefault();
						return;
					}
				} catch {
					// Ignore errors
				}
				element = element.parentElement;
			}
		}}
		{...props}
	/>
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
	<DialogPortal>
		<DialogOverlay />
		<DialogPrimitive.Content
			ref={ref}
			className={cn(
				"-translate-x-1/2 -translate-y-1/2 !border-border !bg-card !text-card-foreground !h-auto !max-h-[90vh] !min-h-0 !overflow-auto data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 pointer-events-auto fixed top-[50%] left-[50%] z-50 grid w-full max-w-lg gap-4 border p-6 shadow-lg duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in sm:rounded-lg md:w-full",
				className,
			)}
			onInteractOutside={(e) => {
				// Don't close modal if clicking on toast
				const target = e.target as HTMLElement;
				const nativeEvent = e.nativeEvent || e;
				const composedPath = (
					typeof nativeEvent.composedPath === "function"
						? nativeEvent.composedPath()
						: [target]
				) as HTMLElement[];

				// Check if any element in the event path is a toast
				for (const element of composedPath) {
					if (
						element &&
						element !== document.body &&
						element.nodeType === Node.ELEMENT_NODE
					) {
						// Check for toast attributes/classes
						const isToast =
							(element.hasAttribute &&
								element.hasAttribute("data-sonner-toast")) ||
							(element.closest &&
								element.closest("[data-sonner-toast]") !== null) ||
							(element.closest &&
								element.closest('[class*="toaster"]') !== null) ||
							(element.closest &&
								element.closest('[id^="sonner-"]') !== null) ||
							(element.closest &&
								element.closest('[class*="sonner"]') !== null);

						if (isToast) {
							e.preventDefault();
							return;
						}

						// Check by z-index
						try {
							const zIndex = window.getComputedStyle(element).zIndex;
							if (zIndex && Number.parseInt(zIndex, 10) >= 10000) {
								e.preventDefault();
								return;
							}
						} catch {
							// Ignore errors accessing computed styles
						}
					}
				}

				// Fallback: check the target itself and parents
				let element: HTMLElement | null = target;
				while (element && element !== document.body) {
					const isToast =
						element.hasAttribute("data-sonner-toast") ||
						element.closest("[data-sonner-toast]") !== null ||
						element.closest('[class*="toaster"]') !== null ||
						element.closest('[id^="sonner-"]') !== null ||
						element.closest('[class*="sonner"]') !== null;

					if (isToast) {
						e.preventDefault();
						return;
					}

					try {
						const zIndex = window.getComputedStyle(element).zIndex;
						if (zIndex && Number.parseInt(zIndex, 10) >= 10000) {
							e.preventDefault();
							return;
						}
					} catch {
						// Ignore errors
					}
					element = element.parentElement;
				}

				// Allow default behavior for non-toast clicks
				if (props.onInteractOutside) {
					props.onInteractOutside(e);
				}
			}}
			{...props}
		>
			{children}
			<DialogPrimitive.Close className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
				<Cross2Icon className="h-4 w-4" />
				<span className="sr-only">Close</span>
			</DialogPrimitive.Close>
		</DialogPrimitive.Content>
	</DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			"flex flex-col space-y-1.5 text-center sm:text-left",
			className,
		)}
		{...props}
	/>
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			"flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
			className,
		)}
		{...props}
	/>
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Title>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Title
		ref={ref}
		className={cn(
			"font-semibold text-lg leading-none tracking-tight",
			className,
		)}
		{...props}
	/>
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Description>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Description
		ref={ref}
		className={cn("text-muted-foreground text-sm", className)}
		{...props}
	/>
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
	Dialog,
	DialogPortal,
	DialogOverlay,
	DialogTrigger,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogDescription,
};
