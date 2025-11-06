"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ThemeNotificationsPanel from "@/components/notifications/ThemeNotificationsPanel";
import { useNotificationsStore } from "@/lib/stores/notificationsStore";
import { useEffect, useRef } from "react";

export default function NotificationsDropdown() {
	const notifications = useNotificationsStore((s) => s.notifications);
	const add = useNotificationsStore((s) => s.add);
	const hasUnread = useNotificationsStore((s) => s.hasUnread());
	const markAllRead = useNotificationsStore((s) => s.markAllRead);

	// Seed a couple demo notifications for first-time view (guarded against StrictMode double-invoke)
	const seededRef = useRef(false);
	useEffect(() => {
		if (seededRef.current) return;
		if (
			typeof window !== "undefined" &&
			sessionStorage.getItem("ds-notifs-seeded") === "true"
		) {
			seededRef.current = true;
			return;
		}
		if (notifications.length === 0) {
			seededRef.current = true;
			try {
				sessionStorage.setItem("ds-notifs-seeded", "true");
			} catch {}
			add({
				title: "Welcome to Deal Scale",
				description: "You're all set!",
				icon: "✨",
				colorHsl: "46 100% 50%",
			});
			add({
				title: "Leads imported",
				description: "42 new leads added",
				icon: "📥",
				colorHsl: "200 85% 45%",
			});
			// Approval demo
			add({
				title: "Approve campaign launch?",
				description: "Starter plan, 42 leads, SMS + Email",
				icon: "🚀",
				colorHsl: "142 76% 36%",
				// @ts-expect-error extend action via duck typing
				action: {
					approveLabel: "Approve",
					denyLabel: "Deny",
					onApprove: () => console.log("Campaign approved"),
					onDeny: () => console.log("Campaign denied"),
				},
			} as any);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<DropdownMenu onOpenChange={(open) => open && markAllRead()}>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="icon"
					aria-label="Open notifications"
					className="relative"
				>
					<Bell className="h-[1.1rem] w-[1.1rem]" />
					{hasUnread ? (
						<span className="absolute -right-0.5 -top-0.5 inline-flex h-2.5 w-2.5 rounded-full bg-destructive" />
					) : null}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="p-0">
				<ThemeNotificationsPanel maxHeightClass="h-[420px]" />
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
