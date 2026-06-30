"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { TeamInviteForm } from "./TeamInviteForm";

export interface InviteEmployeeModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	token?: string;
}

export default function InviteEmployeeModal({
	open,
	onOpenChange,
	token,
}: InviteEmployeeModalProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg" data-tour="employee-invite-modal">
				<DialogHeader>
					<DialogTitle>Invite Team Member</DialogTitle>
				</DialogHeader>
				<div data-tour="employee-invite-form">
					<TeamInviteForm token={token} onSuccess={() => onOpenChange(false)} />
				</div>
			</DialogContent>
		</Dialog>
	);
}
