"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { formatAdminRole } from "@/lib/admin/roles";
import AdjustCreditsModal from "./AdjustCreditsModal";
import { useImpersonationStore } from "@/lib/stores/impersonationStore";
import { toast } from "sonner";

export interface AdminUserDetailModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	userId: string | null;
	initialCreditsOpen?: boolean;
	openCreditsModal?: boolean;
}

interface AdminDetailUser {
	id: string;
	email: string;
	firstName?: string;
	lastName?: string;
	role: string;
	status?: string;
	credits?: {
		ai: { allotted: number; used: number };
		leads: { allotted: number; used: number };
		skipTraces: { allotted: number; used: number };
	};
}

interface ActivityEvent {
	id: string;
	at: string;
	message: string;
}

export default function AdminUserDetailModal({
	open,
	onOpenChange,
	userId,
	initialCreditsOpen,
	openCreditsModal = false,
}: AdminUserDetailModalProps) {
	const [user, setUser] = useState<AdminDetailUser | null>(null);
	const [logs, setLogs] = useState<ActivityEvent[]>([]);
	const [loading, setLoading] = useState(false);
	const [creditsOpen, setCreditsOpen] = useState(false);
	const { startImpersonation } = useImpersonationStore();

	useEffect(() => {
		if (!open || !userId) return;
		let alive = true;
		const run = async () => {
			setLoading(true);
			try {
				await new Promise((r) => setTimeout(r, 250));
				const mock: AdminDetailUser = {
					id: userId,
					email: `user_${userId}@example.com`,
					firstName: "Jane",
					lastName: "Doe",
					role: "user",
					status: "active",
					credits: {
						ai: { allotted: 1000, used: 250 },
						leads: { allotted: 500, used: 120 },
						skipTraces: { allotted: 300, used: 80 },
					},
				};
				const mockLogs: ActivityEvent[] = [
					{
						id: "1",
						at: new Date().toISOString(),
						message: "Admin John granted 100 AI Credits",
					},
					{
						id: "2",
						at: new Date(Date.now() - 3600_000).toISOString(),
						message: "User signed in",
					},
				];
				if (alive) {
					setUser(mock);
					setLogs(mockLogs);
				}
			} finally {
				if (alive) setLoading(false);
			}
		};
		run();
		return () => {
			alive = false;
		};
	}, [open, userId]);

	// If requested, open the credits sub-modal shortly after loading user
	useEffect(() => {
		if (!open) return;
		if ((initialCreditsOpen || openCreditsModal) && user && !loading) {
			const t = setTimeout(() => setCreditsOpen(true), 50);
			return () => clearTimeout(t);
		}
	}, [open, user, loading, initialCreditsOpen, openCreditsModal]);

	const remaining = (a: number, u: number) => Math.max(0, a - u);

	const handleImpersonate = (target: AdminDetailUser) => {
		const fullName =
			`${target.firstName ?? ""} ${target.lastName ?? ""}`.trim();
		startImpersonation({
			adminToken: "mock-admin-jwt",
			userName: fullName || target.email,
			userId: target.id,
		});
		toast.success(
			`Impersonation session started for ${fullName || target.email}`,
		);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="max-h-[80vh] max-w-3xl overflow-y-auto"
				style={{ touchAction: "pan-y" }}
			>
				<DialogHeader>
					<DialogTitle>User Detail</DialogTitle>
				</DialogHeader>
				{loading && (
					<div className="text-muted-foreground text-sm">Loading…</div>
				)}
				{!loading && user && (
					<div className="space-y-4">
						<div className="rounded-md border p-4">
							<div className="flex flex-wrap items-center justify-between gap-3">
								<div>
									<div className="font-medium">
										{user.firstName} {user.lastName}
									</div>
									<div className="text-muted-foreground text-sm">
										{user.email}
									</div>
								</div>
								<div className="flex items-center gap-2">
									<Button
										variant="secondary"
										onClick={() => setCreditsOpen(true)}
									>
										Adjust Credits
									</Button>
									<Button onClick={() => handleImpersonate(user)}>
										Impersonate
									</Button>
								</div>
							</div>
							<div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
								<div className="rounded-md border p-3">
									<div className="text-muted-foreground text-xs">
										AI Credits
									</div>
									<div className="text-sm">
										Remaining:{" "}
										{remaining(
											user.credits?.ai?.allotted ?? 0,
											user.credits?.ai?.used ?? 0,
										)}
									</div>
								</div>
								<div className="rounded-md border p-3">
									<div className="text-muted-foreground text-xs">
										Leads Credits
									</div>
									<div className="text-sm">
										Remaining:{" "}
										{remaining(
											user.credits?.leads?.allotted ?? 0,
											user.credits?.leads?.used ?? 0,
										)}
									</div>
								</div>
								<div className="rounded-md border p-3">
									<div className="text-muted-foreground text-xs">
										Skip Traces Credits
									</div>
									<div className="text-sm">
										Remaining:{" "}
										{remaining(
											user.credits?.skipTraces?.allotted ?? 0,
											user.credits?.skipTraces?.used ?? 0,
										)}
									</div>
								</div>
							</div>
						</div>
						<Tabs defaultValue="activity">
							<TabsList>
								<TabsTrigger value="activity">Activity Log</TabsTrigger>
								<TabsTrigger value="profile">Profile</TabsTrigger>
							</TabsList>
							<TabsContent value="activity">
								<div className="rounded-md border">
									{logs.length === 0 ? (
										<div className="p-4 text-muted-foreground text-sm">
											No activity.
										</div>
									) : (
										<ul className="divide-y">
											{logs.map((e) => (
												<li key={e.id} className="p-3 text-sm">
													<div className="text-muted-foreground">
														{new Date(e.at).toLocaleString()}
													</div>
													<div>{e.message}</div>
												</li>
											))}
										</ul>
									)}
								</div>
							</TabsContent>
							<TabsContent value="profile">
								<div className="rounded-md border p-4 text-sm">
									<div>
										<span className="text-muted-foreground">Role:</span>{" "}
										{formatAdminRole(user.role)}
									</div>
									<div>
										<span className="text-muted-foreground">Status:</span>{" "}
										{user.status}
									</div>
								</div>
							</TabsContent>
						</Tabs>
					</div>
				)}
				{user && (
					<AdjustCreditsModal
						open={creditsOpen}
						onOpenChange={setCreditsOpen}
						userId={user.id}
						onSuccess={(delta, type) => {
							if (!user.credits) return;
							const bucket = user.credits[
								type as keyof typeof user.credits
							] as { allotted: number; used: number };
							const used = Math.max(0, bucket.used - delta);
							setUser({
								...user,
								credits: { ...user.credits, [type]: { ...bucket, used } },
							});
						}}
					/>
				)}
			</DialogContent>
		</Dialog>
	);
}
