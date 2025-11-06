"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { MainEmployeeForm } from "@/components/forms/steppers/employee-form/MainEmployeeForm";
import type { TeamMemberFormValues } from "@/types/zod/userSetup/team-member-form-schema";

export interface InviteEmployeeModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const defaultInviteValues: TeamMemberFormValues = {
	firstName: "",
	lastName: "",
	email: "",
	phone: "",
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
	platformIntegration: {
		callTransferBufferTime: 30,
		textBufferPeriod: 5,
		autoResponseEnabled: false,
		workingHoursStart: "09:00",
		workingHoursEnd: "17:00",
		timezone: "America/New_York",
		maxConcurrentConversations: 5,
		enableCallRecording: false,
		enableTextNotifications: true,
		enableEmailNotifications: true,
	},
};

export default function InviteEmployeeModal({
	open,
	onOpenChange,
}: InviteEmployeeModalProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="max-h-[80vh] max-w-3xl overflow-y-auto"
				style={{ touchAction: "pan-y" }}
			>
				<DialogHeader>
					<DialogTitle>Invite Team Member</DialogTitle>
				</DialogHeader>
				<MainEmployeeForm mode="invite" initialData={defaultInviteValues} />
			</DialogContent>
		</Dialog>
	);
}
