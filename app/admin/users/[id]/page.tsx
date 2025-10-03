"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import AdjustCreditsModal from "@/components/admin/AdjustCreditsModal";
import { useImpersonationStore } from "@/lib/stores/impersonationStore";
import { formatAdminRole } from "@/lib/admin/roles";

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
	at: string; // ISO date
	message: string;
}

export default function AdminUserDetailPage() {
	const params = useParams();
	const userId = String(params?.id ?? "");
	const [user, setUser] = useState<AdminDetailUser | null>(null);
	const [logs, setLogs] = useState<ActivityEvent[]>([]);
	const [loading, setLoading] = useState(true);
	const [creditsOpen, setCreditsOpen] = useState(false);
	const { startImpersonation } = useImpersonationStore();

	useEffect(() => {
		let alive = true;
		const load = async () => {
			try {
				// Mock user fetch
				await new Promise((r) => setTimeout(r, 300));
				const mock: AdminDetailUser = {
					id: userId,
					email: `user_${userId}@example.com`,
					firstName: "Jane",
					lastName: "Doe",
					role: "platform_support",
					status: "active",
					credits: {
						ai: { allotted: 1000, used: 250 },
						leads: { allotted: 500, used: 120 },
						skipTraces: { allotted: 300, used: 80 },
					},
				};
				if (alive) setUser(mock);
				// Mock logs fetch
				await new Promise((r) => setTimeout(r, 200));
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
				if (alive) setLogs(mockLogs);
			} finally {
				if (alive) setLoading(false);
			}
		};
		load();
		return () => {
			alive = false;
		};
	}, [userId]);

	const remaining = (allotted: number, used: number) =>
		Math.max(0, allotted - used);

	return (
		<div className="space-y-4 p-6">
			<div>
				<h1 className="font-semibold text-2xl">User Detail</h1>
				<p className="text-muted-foreground text-sm">
					View profile, adjust credits, and manage troubleshooting actions.
				</p>
			</div>

			{loading && <div className="text-muted-foreground text-sm">Loading…</div>}
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
								<div className="text-muted-foreground text-xs">
									Role: {formatAdminRole(user.role)}
								</div>
							</div>
							<div className="flex items-center gap-2">
								<Button
									variant="secondary"
									onClick={() => setCreditsOpen(true)}
								>
									Adjust Credits
								</Button>
								<Button
									onClick={() => {
										// Mock API to start impersonation
										startImpersonation({
											adminToken: "mock-admin-jwt",
											userName:
												`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
											userId: user.id,
										});
										// In real impl: navigate to main user dashboard
										if (typeof window !== "undefined")
											window.alert("Impersonation started (mock)");
									}}
								>
									Impersonate
								</Button>
							</div>
						</div>

						<div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
							<div className="rounded-md border p-3">
								<div className="text-muted-foreground text-xs">AI Credits</div>
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
						const bucket = user.credits[type as keyof typeof user.credits] as {
							allotted: number;
							used: number;
						};
						// Simple mock: if delta > 0 we reduce used, if negative we increase used
						const used = Math.max(0, bucket.used - delta);
						setUser({
							...user,
							credits: { ...user.credits, [type]: { ...bucket, used } },
						});
					}}
				/>
			)}
		</div>
	);
}
