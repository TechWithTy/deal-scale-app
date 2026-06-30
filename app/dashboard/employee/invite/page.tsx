"use client";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { TeamInviteForm } from "@/components/tables/employee-tables/TeamInviteForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSession } from "next-auth/react";
import React from "react";

const breadcrumbItems = [
	{ title: "Dashboard", link: "/dashboard" },
	{ title: "Employee", link: "/dashboard/employee" },
	{ title: "Invite", link: "/dashboard/employee/invite" },
];

export default function InviteEmployeePage() {
	const { data: session } = useSession();

	return (
		<ScrollArea className="h-full">
			<div className="flex-1 space-y-4 p-8">
				<Breadcrumbs items={breadcrumbItems} />
				<TeamInviteForm token={session?.publicApi?.accessToken} />
			</div>
		</ScrollArea>
	);
}
