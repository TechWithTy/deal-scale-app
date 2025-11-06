"use client";
// import { getUserProfile } from "@/actions/auth";
import { DashboardNav } from "@/components/dashboard-nav";
import { navItems } from "@/constants/data";
import { cn } from "@/lib/_utils";
import { useNavbarStore } from "@/lib/stores/dashboard/navbarStore";
import { useSessionStore } from "@/lib/stores/user/useSessionStore";
import type { UserProfile } from "@/types/userProfile";

import Link from "next/link";
import Image from "next/image";
import React, {
	useState,
	type MouseEventHandler,
	type KeyboardEvent,
} from "react";
import { CrudToggle } from "external/crud-toggle/components/CrudToggle";
import { CreditsSummary } from "external/credit-view-purchase/components/CreditsSummary";
import type { CrudFlags } from "external/crud-toggle/utils/types";
import { VerticalStickyBanner } from "@/components/ui/vertical-sticky-banner";

void React;

export default function SidebarClient({ user }: { user: UserProfile | null }) {
	const { isSidebarMinimized, toggleSidebar } = useNavbarStore();
	const sessionUser = useSessionStore((state) => state.user);

	const [showPerms, setShowPerms] = useState(false);
	const [showCredits, setShowCredits] = useState(false);
	// Narrow session user to access subscription safely without 'any'
	type CreditsBucket = { allotted?: number; used?: number };
	type SubscriptionShape = {
		aiCredits?: CreditsBucket;
		leads?: CreditsBucket;
		skipTraces?: CreditsBucket;
	};
	const subs: SubscriptionShape | undefined =
		(sessionUser?.subscription as SubscriptionShape | undefined) ??
		(user?.subscription as SubscriptionShape | undefined);

	// Build CRUD flags from the session store user permissions (array of strings like "leads:read")
	const ENTITIES = [
		"leads",
		"campaigns",
		"reports",
		"team",
		"subscription",
		"ai",
		"tasks",
		"company",
	] as const;
	type Entity = (typeof ENTITIES)[number];
	const toFlags = (perms: string[] | undefined, entity: Entity) => ({
		create: Boolean(perms?.includes(`${entity}:create`)),
		read: Boolean(perms?.includes(`${entity}:read`)),
		update: Boolean(perms?.includes(`${entity}:update`)),
		delete: Boolean(perms?.includes(`${entity}:delete`)),
	});

	const handleAsideClick: MouseEventHandler<HTMLElement> = (e) => {
		// Ignore clicks on interactive elements (links, buttons, form inputs)
		const el = e.target as HTMLElement;
		const closestRoleBtn = el.closest("[role='button']") as HTMLElement | null;
		// Allow clicks on the main toggle wrapper itself
		if (
			closestRoleBtn &&
			closestRoleBtn.dataset.sidebarToggleWrapper !== "true"
		) {
			return;
		}
		const interactive = el.closest("a, button, input, textarea, select");
		if (interactive) return;
		toggleSidebar();
	};

	const handleAsideKeyDown = (e: KeyboardEvent<HTMLElement>) => {
		// Support keyboard activation (Enter or Space)
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			toggleSidebar();
		}
	};

	return (
		<div className="relative hidden md:block">
			<aside
				className={cn(
					"relative sticky top-0 z-40 h-[100dvh] flex-none overflow-y-auto overflow-x-visible border-r bg-card transition-[width] duration-500",
					isSidebarMinimized ? "w-[72px]" : "w-72",
				)}
			>
				<div
					aria-label={
						isSidebarMinimized ? "Expand sidebar" : "Collapse sidebar"
					}
					onClick={handleAsideClick}
					onKeyDown={handleAsideKeyDown}
					data-sidebar-toggle-wrapper="true"
					className="h-full cursor-pointer"
				>
					<button
						type="button"
						className="sr-only"
						onClick={(e) => {
							e.stopPropagation();
							toggleSidebar();
						}}
					>
						{isSidebarMinimized ? "Expand sidebar" : "Collapse sidebar"}
					</button>
					<div
						className={cn(
							"hidden overflow-visible p-5 lg:block",
							isSidebarMinimized ? "pt-6 pr-2" : "pt-10 pr-48",
						)}
					>
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								toggleSidebar();
							}}
							className={cn(
								"inline-flex items-center cursor-pointer hover:opacity-80 transition-opacity",
								isSidebarMinimized ? "w-full justify-center" : "",
							)}
							aria-label="Toggle sidebar"
						>
							<Image
								src="/logo/Deal Scale Black_Text.png"
								alt="Deal Scale"
								width={240}
								height={48}
								priority
								className={cn(
									"mr-2 block object-contain dark:hidden",
									isSidebarMinimized ? "h-auto w-20" : "h-auto w-48",
								)}
							/>
							<Image
								src="/logo/Deal Scale White_Text.png"
								alt="Deal Scale"
								width={240}
								height={48}
								priority
								className={cn(
									"mr-2 hidden object-contain dark:block",
									isSidebarMinimized ? "h-auto w-20" : "h-auto w-48",
								)}
							/>
						</button>
					</div>
					<div className="space-y-4 py-4 overflow-visible">
						{/* Quick Start Section - Prominent and Standout */}
						<div className="px-3 py-2">
							<Link
								href="/dashboard"
								className={cn(
									"group flex items-center gap-3 rounded-lg bg-primary px-3 py-3 font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md",
									isSidebarMinimized ? "justify-center px-2" : "justify-start",
								)}
								onClick={(e) => e.stopPropagation()}
							>
								<div className="flex size-8 items-center justify-center rounded-md bg-primary-foreground/20 group-hover:bg-primary-foreground/30">
									<svg
										className="size-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 4v16m8-8H4"
										/>
									</svg>
								</div>
								{!isSidebarMinimized && (
									<div className="flex flex-col">
										<span className="text-sm font-semibold">Quick Start</span>
										<span className="text-xs opacity-90">Get started fast</span>
									</div>
								)}
							</Link>
						</div>

						<div className="px-3 py-2 overflow-visible">
							<div className="mt-3 space-y-1 overflow-visible">
								<DashboardNav
									items={navItems}
									isMinimized={isSidebarMinimized}
								/>
							</div>
						</div>

						{/* Current user summary (role) */}
						{!isSidebarMinimized && sessionUser?.role && (
							<div className="px-3 py-1">
								<div
									className="rounded-md border border-border bg-card p-2 text-muted-foreground text-xs"
									data-testid="sidebar-role"
								>
									<span className="mr-1 font-semibold text-foreground">
										Role:
									</span>
									<span className="text-primary">
										{sessionUser?.role ?? ""}
									</span>
								</div>
							</div>
						)}

						{/* Credits (collapsible) */}
						{!isSidebarMinimized && (
							<div className="px-3 py-2">
								<button
									type="button"
									className="flex w-full items-center justify-between rounded-md border border-border bg-card px-2 py-1 font-semibold text-muted-foreground text-xs uppercase"
									onClick={() => setShowCredits((v) => !v)}
								>
									<span>Credits</span>
									<span className="text-foreground">
										{showCredits ? "−" : "+"}
									</span>
								</button>
								{showCredits && (
									<div className="mt-2">
										<CreditsSummary
											ai={subs?.aiCredits}
											leads={subs?.leads}
											skipTraces={subs?.skipTraces}
										/>
									</div>
								)}
							</div>
						)}

						{/* Permissions (read-only preview with invite requests) */}
						{!isSidebarMinimized && (
							<div className="px-3 py-2" data-sidebar-toggle-wrapper="true">
								<button
									type="button"
									className="flex w-full items-center justify-between rounded-md border border-border bg-card px-2 py-1 font-semibold text-muted-foreground text-xs uppercase"
									onClick={(e) => {
										e.stopPropagation();
										setShowPerms((v) => !v);
									}}
								>
									<span>Permissions</span>
									<span className="text-foreground">
										{showPerms ? "−" : "+"}
									</span>
								</button>
								{showPerms && (
									<div className="mt-2 space-y-3">
										{ENTITIES.map((entity) => {
											const flags = toFlags(
												sessionUser?.permissions as string[] | undefined,
												entity,
											) as CrudFlags;
											const label =
												entity === "ai"
													? "AI"
													: entity === "company"
														? "Company Profile"
														: entity.charAt(0).toUpperCase() + entity.slice(1);
											return (
												<div
													key={entity}
													className="flex items-center justify-between"
												>
													<span className="text-foreground text-sm">
														{label}
													</span>
													<CrudToggle
														value={flags}
														readOnly
														onInviteRequest={(key, desired) => {
															console.log("Invite request:", {
																entity: label,
																key,
																desired,
															});
														}}
														size="sm"
													/>
												</div>
											);
										})}
									</div>
								)}
							</div>
						)}
					</div>

					{/* ✅ Display user info, either from the server or client */}
					{!isSidebarMinimized && (
						<div
							className="p-4 text-foreground text-sm"
							data-testid="sidebar-email"
						>
							Logged in as:{" "}
							<strong>{sessionUser?.email ?? user?.email ?? ""}</strong>
						</div>
					)}
				</div>
			</aside>
			{/* Vertical Sticky Banner - Attached to right side of sidebar */}
			<VerticalStickyBanner
				isSidebarMinimized={isSidebarMinimized}
				variant="feature"
				tooltipText="New Feature Available! Check out our latest updates"
				link="/dashboard"
				subtitleLink="/dashboard/updates"
			>
				<p className={cn("text-[10px] font-semibold leading-tight")}>
					New Feature Available!
				</p>
				<p className={cn("text-[9px] leading-tight")}>Check out updates</p>
			</VerticalStickyBanner>
		</div>
	);
}
