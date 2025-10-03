import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import AdminNavigation from "@/components/admin/AdminNavigation";
import ImpersonationBanner from "@/components/admin/ImpersonationBanner";
import { Badge } from "@/components/ui/badge";
import {
	formatAdminRole,
	isAdminAreaAuthorized,
	isClassicAdminRole,
	isClassicSupportRole,
	isPlatformAdminRole,
	isPlatformSupportRole,
} from "@/lib/admin/roles";

const NAV_ITEMS = [
	{
		href: "/admin",
		label: "Platform Plan",
		description: "Track platform admin delivery milestones.",
	},
	{
		href: "/admin/users",
		label: "Users",
		description: "Search and manage customer accounts.",
	},
];

export default async function AdminLayout({
	children,
}: { children: ReactNode }) {
	const session = await auth();
	const role = session?.user?.role ?? null;
	if (!isAdminAreaAuthorized(role)) {
		redirect("/dashboard");
	}

	const roleLabel = formatAdminRole(role);
	const contextHint = isPlatformAdminRole(role)
		? "Full platform controls"
		: isPlatformSupportRole(role)
			? "Focused troubleshooting toolkit"
			: isClassicAdminRole(role)
				? "Organization administration"
				: isClassicSupportRole(role)
					? "Support operations toolkit"
					: "Administrator tools";

	return (
		<div className="min-h-screen bg-background text-foreground">
			<div className="flex min-h-screen flex-col lg:flex-row">
				<aside className="border-b border-r border-border/50 bg-muted/10 lg:w-64 lg:border-b-0">
					<div className="px-6 py-6">
						<h2 className="font-semibold text-lg">Platform Admin Console</h2>
						<p className="text-muted-foreground text-sm">
							Secure workflows for high-impact support operations.
						</p>
					</div>
					<AdminNavigation items={NAV_ITEMS} />
				</aside>
				<div className="flex flex-1 flex-col">
					<ImpersonationBanner />
					<header className="border-b border-border/50 px-6 py-4">
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<div className="text-muted-foreground text-xs uppercase tracking-wide">
									Signed in as
								</div>
								<div className="text-sm font-medium">
									{session?.user?.email}
								</div>
								<p className="text-muted-foreground text-sm">{contextHint}</p>
							</div>
							<Badge variant="outline">{roleLabel}</Badge>
						</div>
					</header>
					<main className="flex-1 overflow-y-auto px-6 py-6">
						<div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
							{children}
						</div>
					</main>
				</div>
			</div>
		</div>
	);
}
