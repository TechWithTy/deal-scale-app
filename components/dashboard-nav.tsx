"use client";

// import { signOut } from "@/actions/auth";
import { Icons } from "@/components/icons";
import { useSidebar } from "@/hooks/useSidebar";
import { cn } from "@/lib/_utils";
import type { NavItem } from "@/types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type Dispatch, type SetStateAction, useState } from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "./ui/tooltip";

interface DashboardNavProps {
	items: NavItem[];
	setOpen?: Dispatch<SetStateAction<boolean>>;
	isMobileNav?: boolean;
}

export function DashboardNav({
	items,
	setOpen,
	isMobileNav = false,
}: DashboardNavProps) {
	const path = usePathname();
	const { isMinimized } = useSidebar();
	const [loading, setLoading] = useState(false);

	const handleLogout = async (event: React.MouseEvent) => {
		event.preventDefault();
		setLoading(true);

		// await signOut();

		setLoading(false);
	};

	if (!items?.length) {
		return null;
	}

	return (
		<nav className="grid items-start gap-2">
			<TooltipProvider>
				{items.map((item, index) => {
					const Icon = Icons[item.icon || "arrowRight"];

					return (
						<Tooltip key={item.title}>
							<TooltipTrigger asChild>
								{item.title === "Logout" ? (
									<button
										type="button"
										onClick={handleLogout}
										className={cn(
											"flex w-full items-center gap-2 overflow-hidden rounded-md py-2 font-medium text-sm hover:bg-accent hover:text-accent-foreground",
											item.disabled && "cursor-not-allowed opacity-80",
										)}
										disabled={loading}
									>
										<Icon className="ml-3 size-5 flex-none" />
										{isMobileNav || (!isMinimized && !isMobileNav) ? (
											<span className="mr-2 truncate">Logout</span>
										) : null}
									</button>
								) : (
									<Link
										href={item.disabled ? "/" : item.href || "/"}
										className={cn(
											"flex items-center gap-2 overflow-hidden rounded-md py-2 font-medium text-sm hover:bg-accent hover:text-accent-foreground",
											path === item.href ? "bg-accent" : "transparent",
											item.disabled && "cursor-not-allowed opacity-80",
										)}
										onClick={() => {
											if (setOpen) setOpen(false);
										}}
									>
										<Icon className="ml-3 size-5 flex-none" />
										{isMobileNav || (!isMinimized && !isMobileNav) ? (
											<span className="mr-2 truncate">{item.title}</span>
										) : null}
									</Link>
								)}
							</TooltipTrigger>
							<TooltipContent
								align="center"
								side="right"
								sideOffset={8}
								className={!isMinimized ? "hidden" : "inline-block"}
							>
								{item.title}
							</TooltipContent>
						</Tooltip>
					);
				})}
			</TooltipProvider>
		</nav>
	);
}
