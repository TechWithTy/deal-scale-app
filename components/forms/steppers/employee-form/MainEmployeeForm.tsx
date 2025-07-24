"use client";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

import { zodResolver } from "@hookform/resolvers/zod";
// MainEmployeeForm.tsx
import type React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { EmployeeInfoFields } from "./steps/EmployeeInfoFields";
import { EmployeePermissionsSection } from "./steps/EmployeePermissionsSection";
import { EmployeeRoleField } from "./steps/EmployeeRoleField";
import { EmployeeTwoFactorSection } from "./steps/EmployeeTwoFactorSection";
import { ResetPasswordSection } from "./steps/ResetPasswordSection";
import { UpdatePasswordSection } from "./steps/UpdatePasswordSection";
import { Breadcrumbs } from "@/components/breadcrumbs";

import { teamMemberFormSchema } from "@/types/zod/userSetup/team-member-form-schema";
import type {
	TeamMemberFormValues,
	TeamMemberUpdatePasswordFormValues,
} from "@/types/zod/userSetup/team-member-form-schema";

type MainEmployeeFormProps =
	| { mode: "invite"; initialData?: TeamMemberFormValues }
	| { mode: "edit"; initialData: TeamMemberUpdatePasswordFormValues };

export const MainEmployeeForm: React.FC<MainEmployeeFormProps> = (props) => {
	const { mode } = props;
	const isEdit = mode === "edit";
	const initialData = isEdit
		? props.initialData
		: (props.initialData ?? undefined);
	const [loading, setLoading] = useState(false);
	const title = isEdit
		? `Edit Team Member${initialData?.firstName ? `: ${initialData.firstName} ${initialData.lastName}` : ""}`
		: "Invite Team Member";
	const description = isEdit
		? "Edit team member details. You can also reset or update their password."
		: "Invite a new team member via email.";
	const action = isEdit ? "Save changes" : "Invite";

	const defaultValues:
		| TeamMemberFormValues
		| TeamMemberUpdatePasswordFormValues =
		isEdit && initialData
			? initialData
			: {
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

	// Watch for role changes
	const role = form.watch("role");

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
			<Form
				form={form}
				onSubmit={form.handleSubmit(onSubmit)}
				className="w-full space-y-8"
			>
				<EmployeeInfoFields form={form} loading={loading} />
				<EmployeeRoleField form={form} loading={loading} />
				{role !== "admin" ? (
					<EmployeePermissionsSection
						form={form}
						loading={loading}
						defaultValues={defaultValues}
					/>
				) : (
					<div className="rounded-md border bg-muted p-4 text-muted-foreground">
						This user is an <b>Admin</b> and automatically has all permissions.
					</div>
				)}
				<EmployeeTwoFactorSection form={form} loading={loading} />
				{isEdit && initialData?.id && initialData?.email && (
					<>
						<ResetPasswordSection
							userId={initialData.id}
							userEmail={initialData.email}
						/>
						<UpdatePasswordSection userId={initialData.id} />
					</>
				)}
				{isEdit && !initialData && (
					<div className="mt-4 rounded-md border bg-red-50 p-4 text-red-600">
						Error: No team member data provided for edit mode.
					</div>
				)}
				<div className="flex justify-end">
					<Button type="submit" disabled={loading}>
						{action}
					</Button>
				</div>
			</Form>
		</>
	);
};
