"use client";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import {
	type TeamMemberFormValues,
	teamMemberFormSchema,
} from "@/types/zod/userSetup/team-member-form-schema";

import { zodResolver } from "@hookform/resolvers/zod";
// MainEmployeeForm.tsx
import type React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { EmployeeInfoFields } from "./steps/EmployeeInfoFields";
import { EmployeePermissionsSection } from "./steps/EmployeePermissionsSection";
import { EmployeeRoleField } from "./steps/EmployeeRoleField";
import { EmployeeTwoFactorSection } from "./steps/EmployeeTwoFactorSection";

interface MainEmployeeFormProps {
	initialData?: TeamMemberFormValues | null;
}

export const MainEmployeeForm: React.FC<MainEmployeeFormProps> = ({
	initialData,
}) => {
	const [loading, setLoading] = useState(false);
	const title = initialData ? "Edit Team Member" : "Invite Team Member";
	const description = initialData
		? "Edit team member details."
		: "Invite a new team member via email.";
	const action = initialData ? "Save changes" : "Invite";
	const defaultValues: TeamMemberFormValues = initialData || {
		firstName: "",
		lastName: "",
		email: "",
		role: "member",
		permissions: {
			canGenerateLeads: false,
			canStartCampaigns: false,
			canViewReports: false,
			canManageTeam: false,
			canManageSubscription: false,
			canAccessAI: false,
			canMoveCompanyTasks: false,
			canEditCompanyProfile: false,
		},
		twoFactorAuth: {
			isEnabled: false,
			methods: { sms: false, email: false, authenticatorApp: false },
		},
	};

	const form = useForm<TeamMemberFormValues>({
		resolver: zodResolver(teamMemberFormSchema),
		defaultValues,
	});

	const onSubmit = async (data: TeamMemberFormValues) => {
		try {
			setLoading(true);
			// todo: Integrate API call here
			// Simulate success toast
			// toast(initialData ? "Team member updated successfully" : "Team member invited successfully");
		} catch (error) {
			// todo: error handling
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<div className="flex items-center justify-between">
				<Heading title={title} description={description} />
			</div>
			<Separator />
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="w-full space-y-8"
				>
					<EmployeeInfoFields form={form} loading={loading} />
					<EmployeeRoleField form={form} loading={loading} />
					<EmployeePermissionsSection
						form={form}
						loading={loading}
						defaultValues={defaultValues}
					/>
					<EmployeeTwoFactorSection form={form} loading={loading} />
					<div className="flex justify-end">
						<Button type="submit" disabled={loading}>
							{action}
						</Button>
					</div>
				</form>
			</Form>
		</>
	);
};
