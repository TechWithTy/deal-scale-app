"use client";

import { MainEmployeeForm } from "@/components/forms/steppers/employee-form/MainEmployeeForm";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { TeamMember } from "@/types/userProfile";
import type { TeamMemberUpdatePasswordFormValues } from "@/types/zod/userSetup/team-member-form-schema";

function toFormValues(
	member: TeamMember | null,
): TeamMemberUpdatePasswordFormValues | undefined {
	if (!member) return undefined;
	return {
		id: member.id,
		firstName: member.firstName,
		lastName: member.lastName,
		email: member.email,
		role: member.role,
		permissions: {
			canGenerateLeads: !!member.permissions?.canGenerateLeads,
			canStartCampaigns: !!member.permissions?.canStartCampaigns,
			canViewReports: !!member.permissions?.canViewReports,
			canManageTeam: !!member.permissions?.canManageTeam,
			canManageSubscription: !!member.permissions?.canManageSubscription,
			canAccessAI: !!member.permissions?.canAccessAI,
			canMoveCompanyTasks: !!member.permissions?.canMoveCompanyTasks,
			canEditCompanyProfile: !!member.permissions?.canEditCompanyProfile,
		},
		twoFactorAuth: {
			isEnabled: !!member.twoFactorAuth?.isEnabled,
			methods: {
				sms: !!member.twoFactorAuth?.methods?.sms,
				email: !!member.twoFactorAuth?.methods?.email,
				authenticatorApp: !!member.twoFactorAuth?.methods?.authenticatorApp,
			},
		},
		updatePassword: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
	};
}

export interface EmployeeRowModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	member: TeamMember | null;
}

export default function EmployeeRowModal({
	open,
	onOpenChange,
	member,
}: EmployeeRowModalProps) {
	const initial = toFormValues(member);
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="max-h-[80vh] max-w-3xl overflow-y-auto"
				style={{ touchAction: "pan-y" }}
			>
				<DialogHeader>
					<DialogTitle>Team Member</DialogTitle>
				</DialogHeader>
				{initial ? (
					<MainEmployeeForm mode="edit" initialData={initial} />
				) : (
					<div className="text-muted-foreground text-sm">
						No team member selected.
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
