"use client";

import { MainEmployeeForm } from "@/components/forms/steppers/employee-form/MainEmployeeForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Breadcrumbs } from "@/components/breadcrumbs";
import React from "react";

const breadcrumbItems = [
	{ title: "Dashboard", link: "/dashboard" },
	{ title: "Employee", link: "/dashboard/employee" },
	{ title: "Invite", link: "/dashboard/employee/invite" },
];

export default function InviteEmployeePage() {
	return (
		<ScrollArea className="h-full">
			<div className="flex-1 space-y-4 p-8">
				<Breadcrumbs items={breadcrumbItems} />
				<MainEmployeeForm mode="invite" />
			</div>
		</ScrollArea>
	);
}
