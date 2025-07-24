"use client";
// import { getUserProfile } from "@/actions/auth";
import { DashboardNav } from "@/components/dashboard-nav";
import { navItems } from "@/constants/data";
import { cn } from "@/lib/_utils/kanban/utils";
import { useNavbarStore } from "@/lib/stores/dashboard/navbarStore";
import { useSessionStore } from "@/lib/stores/user/useSessionStore";
import { useUserProfileStore } from "@/lib/stores/user/userProfile";
import type { UserProfile } from "@/types/userProfile";

import { ChevronLeft, FlameIcon } from "lucide-react";
import Link from "next/link";
import React, { useEffect } from "react";

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

	return (
		<aside
			className={cn(
				"relative hidden h-screen flex-none border-r bg-card transition-[width] duration-500 md:block",
				isSidebarMinimized ? "w-[72px]" : "w-72",
			)}
		>
			<div className="hidden p-5 pt-10 lg:block">
				<Link href="https://www.cybershoptech.com" target="_blank">
					<FlameIcon className="mr-2 h-8 w-8" />
				</Link>
			</div>
			<ChevronLeft
				className={cn(
					"-right-3 absolute top-10 z-50 cursor-pointer rounded-full border bg-background text-3xl text-foreground",
					isSidebarMinimized && "rotate-180",
				)}
				onClick={toggleSidebar}
			/>
			<div className="space-y-4 py-4">
				<div className="px-3 py-2">
					<div className="mt-3 space-y-1">
						<DashboardNav items={navItems} />
					</div>
				</div>
			</div>

			{/* ✅ Display user info, either from the server or client */}
			{user && !isSidebarMinimized && (
				<div className="p-4 text-foreground text-sm">
					Logged in as: <strong>{user.email}</strong>
				</div>
			)}
		</aside>
	);
}
