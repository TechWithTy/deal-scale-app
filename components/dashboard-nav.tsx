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
		<nav className="grid items-start gap-2 overflow-visible">
			<TooltipProvider>
				{items.map((item, index) => {
					if (item.onlyMobile && !isMobileNav) {
						return null;
					}

					// Handle separator
					if (item.icon === "separator") {
						return (
							<div
								key={`separator-${index}`}
								className={cn(
									"my-2 h-px bg-border",
									isMinimized ? "mx-2" : "mx-3",
								)}
							/>
						);
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
						"flex items-center gap-2 rounded-md py-2 font-medium text-sm transition-colors group relative overflow-visible",
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
							) : item.external ? (
								<a
									href={item.disabled ? "#" : item.href || "/"}
									className={itemClasses}
									target="_blank"
									rel="noopener noreferrer"
									onClick={() => {
										if (setOpen) setOpen(false);
									}}
								>
									<Icon className="ml-3 size-5 flex-none" />
									{isMobileNav || (!isMinimized && !isMobileNav) ? (
										<span className="mr-2 truncate">{item.title}</span>
									) : null}
									{/* Badge indicator */}
									{item.badge && !isMinimized && (
										<span className="ml-auto mr-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
											{item.badge}
										</span>
									)}
									{/* Sale indicator with tooltip - only show when no featureKey (no tab blockers) to avoid overlap */}
									{item.hasSaleItems && item.saleLink && !featureKey && (
										<Tooltip>
											<TooltipTrigger asChild>
												<button
													type="button"
													onClick={(e) => {
														e.stopPropagation();
														e.preventDefault();
														window.open(
															item.saleLink,
															"_blank",
															"noopener,noreferrer",
														);
														if (setOpen) setOpen(false);
													}}
													className={cn(
														"absolute -translate-y-1/2 top-1/2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background transition-transform hover:scale-125 cursor-pointer",
														isMinimized ? "right-0" : "right-2",
													)}
													aria-label="Items on sale"
												/>
											</TooltipTrigger>
											<TooltipContent side="right" sideOffset={8}>
												<p className="font-semibold">Items on sale</p>
												<p className="text-xs">
													Click to view marketplace deals
												</p>
											</TooltipContent>
										</Tooltip>
									)}
								</a>
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
									{/* Badge indicator */}
									{item.badge && !isMinimized && (
										<span className="ml-auto mr-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
											{item.badge}
										</span>
									)}
									{/* Sale indicator with tooltip - only show when no featureKey (no tab blockers) to avoid overlap */}
									{item.hasSaleItems && item.saleLink && !featureKey && (
										<Tooltip>
											<TooltipTrigger asChild>
												<button
													type="button"
													onClick={(e) => {
														e.stopPropagation();
														e.preventDefault();
														window.open(
															item.saleLink,
															"_blank",
															"noopener,noreferrer",
														);
														if (setOpen) setOpen(false);
													}}
													className={cn(
														"absolute -translate-y-1/2 top-1/2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background transition-transform hover:scale-125 cursor-pointer",
														isMinimized ? "right-0" : "right-2",
													)}
													aria-label="Items on sale"
												/>
											</TooltipTrigger>
											<TooltipContent side="right" sideOffset={8}>
												<p className="font-semibold">Items on sale</p>
												<p className="text-xs">
													Click to view marketplace deals
												</p>
											</TooltipContent>
										</Tooltip>
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
