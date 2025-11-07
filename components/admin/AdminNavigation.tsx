"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/_utils";

export interface AdminNavigationItem {
	href: string;
	label: string;
	description?: string;
}

interface AdminNavigationProps {
	items: AdminNavigationItem[];
}

export default function AdminNavigation({ items }: AdminNavigationProps) {
	const pathname = usePathname();
	return (
		<nav className="flex flex-1 flex-col gap-1 px-4 pb-6">
			{items.map((item) => {
				const isActive = pathname === item.href;
				return (
					<Link
						key={item.href}
						href={item.href}
						className={cn(
							"rounded-md px-3 py-2 font-medium text-sm transition-colors",
							isActive
								? "bg-primary/10 text-primary"
								: "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
						)}
					>
						<div>{item.label}</div>
						{item.description ? (
							<p className="text-muted-foreground text-xs">
								{item.description}
							</p>
						) : null}
					</Link>
				);
			})}
		</nav>
	);
}
