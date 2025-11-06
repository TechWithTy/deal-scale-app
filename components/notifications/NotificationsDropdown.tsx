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
			// Credit offer notification
			const dueDate = new Date();
			dueDate.setDate(dueDate.getDate() + 30);
			const dueDateStr = dueDate.toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
				year: "numeric",
			});

			add({
				title: "Credit Offer from Top Leader",
				description: (
					<div className="space-y-1.5">
						<div className="text-sm leading-relaxed break-words">
							100 AI credits • 5% monthly • Net 30
						</div>
						<div className="text-xs text-muted-foreground">
							Due: {dueDateStr}
						</div>
						<a
							href="https://dealscale.io/credit-terms"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center text-xs text-primary hover:underline"
							onClick={(e) => e.stopPropagation()}
						>
							View terms & conditions →
						</a>
					</div>
				) as any,
				icon: "💳",
				colorHsl: "280 70% 50%",
				// @ts-expect-error extend action via duck typing
				action: {
					approveLabel: "Accept Offer",
					denyLabel: "Decline",
					onApprove: () => {
						console.log("Credit offer accepted");
						// Show success notification
						add({
							title: "Credit offer accepted!",
							description: "100 AI credits added to your account",
							icon: "✅",
							colorHsl: "142 76% 36%",
						});
					},
					onDeny: () => console.log("Credit offer declined"),
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
			<DropdownMenuContent
				align="end"
				className="p-0 max-h-[85vh]"
				sideOffset={8}
			>
				<ThemeNotificationsPanel maxHeightClass="h-[600px]" />
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
