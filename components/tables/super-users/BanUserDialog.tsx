"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import type { AdminUser } from "./types";

type BanUserDialogProps = {
	emailConfirmation: string;
	onEmailConfirmationChange: (value: string) => void;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	open: boolean;
	user: AdminUser | null;
};

export function BanUserDialog({
	emailConfirmation,
	onEmailConfirmationChange,
	onOpenChange,
	onConfirm,
	open,
	user,
}: BanUserDialogProps) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Ban User</AlertDialogTitle>
				</AlertDialogHeader>
				<div className="py-4">
					<p className="text-muted-foreground text-sm">
						Are you sure you want to ban{" "}
						<strong>
							{user?.firstName} {user?.lastName}
						</strong>{" "}
						({user?.email})?
					</p>
					<p className="mt-2 text-muted-foreground text-sm">
						This action is <strong>irreversible</strong> and will permanently
						block the user from accessing the platform.
					</p>
					<p className="mt-2 text-muted-foreground text-sm">
						To confirm, please type the user's email address:
					</p>
					<Input
						className="mt-2"
						placeholder="User email address"
						value={emailConfirmation}
						onChange={(event) => onEmailConfirmationChange(event.target.value)}
					/>
				</div>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						className="bg-red-600 hover:bg-red-700"
						disabled={emailConfirmation !== user?.email}
						onClick={onConfirm}
					>
						Ban User
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
