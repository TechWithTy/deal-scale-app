"use client";

import { useTheme } from "next-themes";
import React from "react";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = "system" } = useTheme();
	const memoTheme = theme as ToasterProps["theme"];
	// Use higher z-index, ensure pointer events work, and proper corner positioning
	const memoClassName = "toaster group z-[10000] [&>ol]:pointer-events-auto";
	const memoToastOptions = React.useMemo<ToasterProps["toastOptions"]>(
		() => ({
			classNames: {
				toast:
					"group toast pointer-events-auto relative border-2 shadow-2xl backdrop-blur-sm transition-all [&>[data-content]]:text-sm [&_button]:pointer-events-auto [&_button]:cursor-pointer data-[type=success]:border-green-500 data-[type=success]:bg-green-500 data-[type=success]:text-white data-[type=error]:border-red-500 data-[type=error]:bg-red-500 data-[type=error]:text-white data-[type=warning]:border-yellow-500 data-[type=warning]:bg-yellow-500 data-[type=warning]:text-white data-[type=info]:border-blue-500 data-[type=info]:bg-blue-500 data-[type=info]:text-white",
				title: "group-[.toast]:font-bold group-[.toast]:text-inherit text-base",
				description:
					"group-[.toast]:text-sm group-[.toast]:text-inherit/95 group-[.toast]:font-medium",
				actionButton:
					"group-[.toast]:bg-white group-[.toast]:text-gray-900 group-[.toast]:hover:bg-gray-100 group-[.toast]:pointer-events-auto group-[.toast]:cursor-pointer group-[.toast]:font-semibold",
				cancelButton:
					"group-[.toast]:bg-white/20 group-[.toast]:text-white group-[.toast]:hover:bg-white/30 group-[.toast]:pointer-events-auto group-[.toast]:cursor-pointer",
				closeButton:
					"group-[.toast]:text-white group-[.toast]:hover:text-white/80 group-[.toast]:pointer-events-auto group-[.toast]:cursor-pointer group-[.toast]:relative group-[.toast]:z-[10001] group-[.toast]:!pointer-events-auto group-[.toast]:!cursor-pointer group-[.toast]:bg-white/10 group-[.toast]:hover:bg-white/20 group-[.toast]:rounded-md",
				icon: "group-[.toast]:text-white group-[.toast]:shrink-0",
			},
			// Ensure all toasts are dismissible, including those with infinite duration
			dismissible: true,
		}),
		[],
	);

	return (
		<Sonner
			theme={memoTheme}
			closeButton
			position="bottom-center"
			className={memoClassName}
			toastOptions={memoToastOptions}
			style={{
				zIndex: 10000,
			}}
			richColors
			expand={true}
			{...props}
		/>
	);
};

export { Toaster };
