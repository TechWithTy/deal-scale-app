"use client";

import { useTheme } from "next-themes";
import React from "react";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = "system" } = useTheme();
	const memoTheme = theme as ToasterProps["theme"];
	const memoClassName = "toaster group z-[9999]";
	const memoToastOptions = React.useMemo<ToasterProps["toastOptions"]>(
		() => ({
			classNames: {
				toast:
					"group toast border border-border bg-card text-foreground shadow-lg transition-all [&>[data-content]]:text-sm data-[type=success]:border-primary data-[type=success]:bg-primary data-[type=success]:text-primary-foreground data-[type=error]:border-destructive data-[type=error]:bg-destructive data-[type=error]:text-destructive-foreground data-[type=warning]:border-accent data-[type=warning]:bg-accent data-[type=warning]:text-accent-foreground data-[type=info]:border-secondary data-[type=info]:bg-secondary data-[type=info]:text-secondary-foreground",
				title: "group-[.toast]:font-semibold group-[.toast]:text-inherit",
				description: "group-[.toast]:text-sm group-[.toast]:text-inherit/90",
				actionButton:
					"group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:hover:bg-primary/90",
				cancelButton:
					"group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:hover:bg-muted/80",
				closeButton:
					"group-[.toast]:text-inherit/70 group-[.toast]:hover:text-inherit",
				icon: "group-[.toast]:text-inherit",
			},
		}),
		[],
	);

	return (
		<Sonner
			theme={memoTheme}
			position="bottom-right"
			className={memoClassName}
			toastOptions={memoToastOptions}
			{...props}
		/>
	);
};

export { Toaster };
