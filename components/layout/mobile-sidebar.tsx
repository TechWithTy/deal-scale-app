"use client";
import { DashboardNav } from "@/components/dashboard-nav";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { navItems } from "@/constants/data";
import { MenuIcon } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { CrudToggle } from "@/external/crud-toggle/components/CrudToggle";
import type { CrudFlags } from "@/external/crud-toggle/utils/types";
import { CreditsSummary } from "@/external/credit-view-purchase/components/CreditsSummary";

// import { Playlist } from "../data/playlists";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
	// playlists: Playlist[];
}

export function MobileSidebar({ className }: SidebarProps) {
	const [open, setOpen] = useState(false);
	const [showPerms, setShowPerms] = useState(false);
	const [showCredits, setShowCredits] = useState(false);
	const { data: session } = useSession();

	// Narrow session user to access subscription safely without 'any'
	type CreditsBucket = { allotted?: number; used?: number };
	type SubscriptionShape = {
		aiCredits?: CreditsBucket;
		leads?: CreditsBucket;
		skipTraces?: CreditsBucket;
	};
	const subs: SubscriptionShape | undefined = (
		session?.user as { subscription?: SubscriptionShape } | undefined
	)?.subscription;

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
	return (
		<>
			<Sheet open={open} onOpenChange={setOpen}>
				<SheetTrigger asChild>
					<MenuIcon />
				</SheetTrigger>
				<SheetContent side="left" className="!px-0">
					<div className="space-y-4 py-4">
						<div className="px-3 py-2">
							<h2 className="mb-2 px-4 font-semibold text-lg tracking-tight">
								Overview
							</h2>
							<div className="space-y-1">
								<DashboardNav
									items={navItems}
									isMobileNav={true}
									setOpen={setOpen}
								/>
							</div>

							{/* Credits (collapsible) */}
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
						</div>

						{/* Current user role summary (optional) */}
						{session?.user?.role && (
							<div className="px-3 py-1">
								<div className="rounded-md border border-border bg-card p-2 text-muted-foreground text-xs">
									<span className="mr-1 font-semibold text-foreground">
										Role:
									</span>
									<span className="text-primary">{session.user.role}</span>
								</div>
							</div>
						)}

						{/* Permissions (read-only, collapsible) */}
						<div className="px-3 py-2">
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
								<div className="mt-2 max-h-64 space-y-3 overflow-y-auto pr-1">
									{ENTITIES.map((entity) => {
										const flags = toFlags(
											session?.user?.permissions as string[] | undefined,
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
												<span className="text-foreground text-sm">{label}</span>
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
					</div>
				</SheetContent>
			</Sheet>
		</>
	);
}
