"use client";

import SuperUsersTable from "@/components/tables/super-users/SuperUsersTable";

export default function AdminUsersPage() {
	return (
		<div className="space-y-4">
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
