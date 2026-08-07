"use client";

import ThemeNotificationsPanel from "@/components/notifications/ThemeNotificationsPanel";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	listNotifications,
	markAllNotificationsRead,
} from "@/lib/api/public-api-notifications";
import { toAppNotification } from "@/lib/notifications/public-api-notification-normalizers";
import { useNotificationsStore } from "@/lib/stores/notificationsStore";
import { Bell } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef } from "react";

export default function NotificationsDropdown() {
	const { data: session } = useSession();
	const token = session?.publicApi?.accessToken;
	const notifications = useNotificationsStore((s) => s.notifications);
	const add = useNotificationsStore((s) => s.add);
	const hasUnread = useNotificationsStore((s) => s.hasUnread());
	const markAllRead = useNotificationsStore((s) => s.markAllRead);
	const setNotifications = useNotificationsStore((s) => s.setNotifications);

	const hydratedRef = useRef(false);
	useEffect(() => {
		if (!token || hydratedRef.current) return;
		hydratedRef.current = true;
		void listNotifications({ limit: 25 }, token)
			.then((payload) => {
				setNotifications((payload.items ?? []).map(toAppNotification));
			})
			.catch((error) => {
				hydratedRef.current = false;
				console.warn("[Notifications] Failed to load public API feed.", error);
			});
	}, [token, setNotifications]);

	const handleOpenChange = useCallback(
		(open: boolean) => {
			if (!open) return;
			markAllRead();
			if (token) {
				void markAllNotificationsRead(undefined, token).catch((error) => {
					console.warn(
						"[Notifications] Failed to mark public API feed read.",
						error,
					);
				});
			}
		},
		[token, markAllRead],
	);

	const seededRef = useRef(false);
	useEffect(() => {
		if (token || seededRef.current) return;
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
				icon: "i",
				colorHsl: "46 100% 50%",
			});
			add({
				title: "Leads imported",
				description: "42 new leads added",
				icon: "+",
				colorHsl: "200 85% 45%",
			});
		}
	}, [add, notifications.length, token]);

	return (
		<DropdownMenu onOpenChange={handleOpenChange}>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="icon"
					aria-label="Open notifications"
					className="relative"
				>
					<Bell className="h-[1.1rem] w-[1.1rem]" />
					{hasUnread ? (
						<span className="-right-0.5 -top-0.5 absolute inline-flex h-2.5 w-2.5 rounded-full bg-destructive" />
					) : null}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className="max-h-[85vh] p-0"
				sideOffset={8}
			>
				<ThemeNotificationsPanel maxHeightClass="h-[600px]" />
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
