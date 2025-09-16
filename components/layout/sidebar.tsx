"use client";
// import { getUserProfile } from "@/actions/auth";
import { DashboardNav } from "@/components/dashboard-nav";
import { navItems } from "@/constants/data";
import { cn } from "@/lib/_utils";
import { useNavbarStore } from "@/lib/stores/dashboard/navbarStore";
import { useSessionStore } from "@/lib/stores/user/useSessionStore";
import { useUserProfileStore } from "@/lib/stores/user/userProfile";
import type { UserProfile } from "@/types/userProfile";

import Link from "next/link";
import Image from "next/image";
import {
	useEffect,
	useState,
	type MouseEventHandler,
	type KeyboardEvent,
} from "react";
import { CrudToggle } from "@/external/crud-toggle/components/CrudToggle";
import type { CrudFlags } from "@/external/crud-toggle/utils/types";

export default function SidebarClient({ user }: { user: UserProfile | null }) {
	const { isSidebarMinimized, toggleSidebar } = useNavbarStore();
	const { setSessionUser } = useSessionStore(); // ✅ Zustand state
	const { setUserProfile, userProfile } = useUserProfileStore(); // ✅ Zustand store update function

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		// if (user?.id) {
		// 	getUserProfile(user.id).then((profileResponse) => {
		// 		if (profileResponse.status === "success") {
		// 			setUserProfile(profileResponse.userProfile); // ✅ Update Zustand store
		// 			console.log("User profile Set", userProfile);
		// 		} else {
		// 			console.log("Error fetching user profile");
		// 		}
		// 	});
		// }
	}, [user, setUserProfile]);

	const [showPerms, setShowPerms] = useState(false);

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
		<aside
			className={cn(
				"sticky top-0 z-40 hidden h-[100dvh] flex-none overflow-y-auto border-r bg-card transition-[width] duration-500 md:block",
				isSidebarMinimized ? "w-[72px]" : "w-72",
			)}
		>
			<div
				role="button"
				aria-label={isSidebarMinimized ? "Expand sidebar" : "Collapse sidebar"}
				tabIndex={0}
				onClick={handleAsideClick}
				onKeyDown={handleAsideKeyDown}
				data-sidebar-toggle-wrapper="true"
				className="h-full cursor-pointer"
			>
				<div
					className={cn(
						"hidden overflow-visible p-5 lg:block",
						isSidebarMinimized ? "pt-6 pr-2" : "pt-10 pr-48",
					)}
				>
					<Link
						href="https://www.dealscale.io"
						target="_blank"
						className={cn(
							"inline-flex items-center",
							isSidebarMinimized ? "w-full justify-center" : "",
						)}
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
					</Link>
				</div>
				<div className="space-y-4 py-4">
					<div className="px-3 py-2">
						<div className="mt-3 space-y-1">
							<DashboardNav items={navItems} isMinimized={isSidebarMinimized} />
						</div>
					</div>

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
								<span className="text-foreground">{showPerms ? "−" : "+"}</span>
							</button>
							{showPerms && (
								<div className="mt-2 space-y-3">
									{[
										{
											label: "Leads",
											flags: {
												create: true,
												read: true,
												update: false,
												delete: false,
											} as CrudFlags,
										},
										{
											label: "Campaigns",
											flags: {
												create: false,
												read: true,
												update: false,
												delete: false,
											} as CrudFlags,
										},
										{
											label: "Reports",
											flags: {
												create: false,
												read: true,
												update: false,
												delete: false,
											} as CrudFlags,
										},
										{
											label: "Team",
											flags: {
												create: false,
												read: true,
												update: false,
												delete: false,
											} as CrudFlags,
										},
										{
											label: "Subscription",
											flags: {
												create: false,
												read: true,
												update: false,
												delete: false,
											} as CrudFlags,
										},
										{
											label: "AI",
											flags: {
												create: false,
												read: true,
												update: false,
												delete: false,
											} as CrudFlags,
										},
										{
											label: "Tasks",
											flags: {
												create: false,
												read: true,
												update: false,
												delete: false,
											} as CrudFlags,
										},
										{
											label: "Company Profile",
											flags: {
												create: false,
												read: true,
												update: false,
												delete: false,
											} as CrudFlags,
										},
									].map((item) => (
										<div
											key={item.label}
											className="flex items-center justify-between"
										>
											<span className="text-foreground text-sm">
												{item.label}
											</span>
											<CrudToggle
												value={item.flags}
												readOnly
												onInviteRequest={(key, desired) => {
													// TODO: replace with modal/toast request flow
													console.log("Invite request:", {
														entity: item.label,
														key,
														desired,
													});
												}}
												size="sm"
											/>
										</div>
									))}
								</div>
							)}
						</div>
					)}
				</div>

				{/* ✅ Display user info, either from the server or client */}
				{user && !isSidebarMinimized && (
					<div className="p-4 text-foreground text-sm">
						Logged in as: <strong>{user.email}</strong>
					</div>
				)}
			</div>
		</aside>
	);
}
