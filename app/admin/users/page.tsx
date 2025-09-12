"use client";

import SuperUsersTable from "@/components/tables/super-users/SuperUsersTable";
import ImpersonationBanner from "@/components/admin/ImpersonationBanner";

export default function AdminUsersPage() {
	return (
		<div className="space-y-4 p-6">
			<ImpersonationBanner />
			<div>
				<h1 className="font-semibold text-2xl">Platform Users</h1>
				<p className="text-muted-foreground text-sm">
					Search by email to locate a user and open their detail page.
				</p>
			</div>
			<SuperUsersTable />
		</div>
	);
}
