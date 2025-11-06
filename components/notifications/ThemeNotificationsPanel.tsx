"use client";

import { AnimatedList } from "@/components/magicui/animated-list";
import { useNotificationsStore } from "@/lib/stores/notificationsStore";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ThemeNotificationsPanelProps {
	maxHeightClass?: string;
}

export default function ThemeNotificationsPanel({
	maxHeightClass = "h-[380px]",
}: ThemeNotificationsPanelProps) {
	const notifications = useNotificationsStore((s) => s.notifications);
	const dismiss = useNotificationsStore((s) => s.dismiss);
	const clearAll = useNotificationsStore((s) => s.clearAll);

	return (
		<div
			className={`relative w-[360px] overflow-hidden rounded-lg border bg-card text-card-foreground ${maxHeightClass}`}
		>
			<div className="flex items-center justify-between border-b px-3 py-2">
				<div className="font-medium text-sm">Notifications</div>
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="sm"
						onClick={clearAll}
						className="text-muted-foreground hover:text-foreground"
					>
						Clear all
					</Button>
				</div>
			</div>
			<div className="relative h-full overflow-y-auto p-2">
				<AnimatedList className="items-stretch">
					{notifications.map((n) => (
						<div
							key={n.id}
							className="group flex items-start gap-3 rounded-md border bg-background/60 p-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/40"
						>
							<div
								className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border"
								style={{
									borderColor: n.colorHsl ? `hsl(${n.colorHsl})` : undefined,
								}}
							>
								<span
									className="text-base"
									style={{
										color: n.colorHsl ? `hsl(${n.colorHsl})` : undefined,
									}}
								>
									{n.icon ?? "🔔"}
								</span>
							</div>
							<div className="flex min-w-0 flex-1 flex-col">
								<div className="truncate text-sm font-medium">{n.title}</div>
								{n.description ? (
									<div className="truncate text-muted-foreground text-xs">
										{n.description}
									</div>
								) : null}
								<div className="text-muted-foreground mt-1 text-[10px]">
									{new Date(n.createdAt).toLocaleTimeString()}
								</div>
							</div>
							<button
								aria-label="Dismiss notification"
								onClick={() => dismiss(n.id)}
								className="opacity-70 transition-opacity hover:opacity-100"
							>
								<X className="h-4 w-4" />
							</button>
						</div>
					))}
				</AnimatedList>
				<div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-background" />
			</div>
		</div>
	);
}
