"use client";

import { Icons } from "@/components/icons";
import { cn } from "@/lib/_utils";
import type { NavItem } from "@/types";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type Dispatch, type SetStateAction, useState } from "react";
import { FeatureGuard } from "./access/FeatureGuard";
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
					if (item.onlyMobile && !isMobileNav) {
						return null;
					}

					const Icon = Icons[item.icon || "arrowRight"];

					const featureKey = item.featureKey;
					const isPrimary = item.variant === "primary";
					const guardWrapperClass = cn(
						"nav-item",
						isMobileNav
							? "nav-item--mobile"
							: isMinimized
								? "nav-item--minimized"
								: "nav-item--expanded",
						item.disabled && "is-disabled",
						isPrimary && "nav-item--primary",
					);
					const itemClasses = cn(
						"flex items-center gap-2 overflow-hidden rounded-md py-2 font-medium text-sm transition-colors group relative",
						!isPrimary && "hover:bg-accent hover:text-accent-foreground",
						path === item.href && !isPrimary ? "bg-accent" : "transparent",
						item.disabled && "cursor-not-allowed opacity-80",
						featureKey && "opacity-75",
						isPrimary &&
							"bg-slate-900 text-slate-50 shadow-lg hover:bg-slate-800 border border-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:border-slate-200 dark:hover:bg-slate-100",
					);

					const navContent = (
						<>
							{item.title === "Logout" ? (
								<button
									type="button"
									onClick={handleLogout}
									className={cn(
										"flex w-full items-center gap-2 overflow-hidden rounded-md py-2 font-medium text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
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
									className={itemClasses}
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
										<div className="-right-1 -translate-y-1/2 absolute top-1/2 h-2 w-2 rounded-full bg-orange-400 opacity-60" />
									)}
								</Link>
							)}
						</>
					);

					return (
						<Tooltip key={item.title}>
							<TooltipTrigger asChild>
								<span className="contents">
									{featureKey ? (
										<FeatureGuard
											featureKey={featureKey}
											wrapperClassName={guardWrapperClass}
											orientation={isMinimized ? "vertical" : "auto"}
											showPopover={!isMobileNav}
										>
											{navContent}
										</FeatureGuard>
									) : (
										navContent
									)}
								</span>
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
