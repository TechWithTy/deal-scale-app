"use client";

import { Icons } from "@/components/icons";
import { cn } from "@/lib/_utils";
import type { NavItem } from "@/types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type Dispatch, type SetStateAction, useState } from "react";
import { signOut } from "next-auth/react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "./ui/tooltip";
import { FeatureGuard } from "./access/FeatureGuard";

interface DashboardNavProps {
	items: NavItem[];
	setOpen?: Dispatch<SetStateAction<boolean>>;
	isMobileNav?: boolean;
	isMinimized?: boolean;
}

export function DashboardNav({
	items,
	setOpen,
	isMobileNav = false,
	isMinimized,
}: DashboardNavProps) {
	const path = usePathname();
	const [loading, setLoading] = useState(false);

	const handleLogout = async (event: React.MouseEvent) => {
		event.preventDefault();
		setLoading(true);

		try {
			await signOut({ callbackUrl: "/signin", redirect: true });
		} finally {
			setLoading(false);
		}
	};

	if (!items?.length) {
		return null;
	}

	return (
		<nav className="grid items-start gap-2">
			<TooltipProvider>
				{items.map((item, index) => {
					const Icon = Icons[item.icon || "arrowRight"];

					// Determine feature key based on item title
					const getFeatureKey = (title: string): string | null => {
						switch (title) {
							case "Assistants":
								return "aiAssistants.page";
							case "Kanban":
								return "boards.kanban";
							case "Campaign Manager":
								// For campaigns, we need to check both direct mail and social media features
								// The specific feature will be determined by the context where this is used
								return null; // Let specific components handle their own feature guards
							default:
								return null;
						}
					};

					const featureKey = getFeatureKey(item.title);

					const navContent = (
						<>
							{item.title === "Logout" ? (
								<button
									type="button"
									onClick={handleLogout}
									className={cn(
										"flex w-full items-center gap-2 overflow-hidden rounded-md py-2 font-medium text-sm hover:bg-accent hover:text-accent-foreground transition-colors",
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
										"flex items-center gap-2 overflow-hidden rounded-md py-2 font-medium text-sm hover:bg-accent hover:text-accent-foreground transition-colors group relative",
										path === item.href ? "bg-accent" : "transparent",
										item.disabled && "cursor-not-allowed opacity-80",
										featureKey && "opacity-75", // Slightly dim blocked features
									)}
									onClick={() => {
										if (setOpen) setOpen(false);
									}}
								>
									<Icon className="ml-3 size-5 flex-none" />
									{isMobileNav || (!isMinimized && !isMobileNav) ? (
										<span className="mr-2 truncate">{item.title}</span>
									) : null}
									{/* Visual indicator for blocked features */}
									{featureKey && (
										<div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-orange-400 opacity-60" />
									)}
								</Link>
							)}
						</>
					);

					return (
						<Tooltip key={item.title}>
							<TooltipTrigger asChild>
								{featureKey ? (
									<FeatureGuard
										featureKey={featureKey}
										wrapperClassName="nav-item"
									>
										{navContent}
									</FeatureGuard>
								) : (
									navContent
								)}
							</TooltipTrigger>
							{isMinimized && (
								<TooltipContent align="center" side="right" sideOffset={8}>
									{item.title}
								</TooltipContent>
							)}
						</Tooltip>
					);
				})}
			</TooltipProvider>
		</nav>
	);
}
