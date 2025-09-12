"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { AdminUser } from "./types";
import {
	MoreHorizontal,
	Eye,
	Sparkles,
	UserCheck,
	Edit,
	Key,
	Shield,
} from "lucide-react";
import { useState } from "react";

interface CellActionProps {
	user: AdminUser;
	onView?: (user: AdminUser) => void;
	onAdjustCredits?: (user: AdminUser) => void;
	onEditProfile?: (user: AdminUser) => void;
	onResetPassword?: (user: AdminUser) => void;
	onSuspendUser?: (user: AdminUser) => void;
	onUnsuspendUser?: (user: AdminUser) => void;
	onBanUser?: (user: AdminUser) => void;
}

export function CellAction({
	user,
	onView,
	onAdjustCredits,
	onEditProfile,
	onResetPassword,
	onSuspendUser,
	onUnsuspendUser,
	onBanUser,
}: CellActionProps) {
	const [confirmRetry, setConfirmRetry] = useState(false);

	return (
		<>
			<AlertDialog open={confirmRetry} onOpenChange={setConfirmRetry}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Retry Provisioning?</AlertDialogTitle>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								// TODO: call /api/v1/admin/users/{userId}/retry-provisioning
								setConfirmRetry(false);
							}}
						>
							Retry
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<DropdownMenu modal={false}>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						className="h-8 w-8 p-0"
						onClick={(e) => e.stopPropagation()}
						onPointerDown={(e) => e.stopPropagation()}
					>
						<span className="sr-only">Open menu</span>
						<MoreHorizontal className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="end"
					onClick={(e) => e.stopPropagation()}
					onPointerDown={(e) => e.stopPropagation()}
				>
					<DropdownMenuLabel>Actions</DropdownMenuLabel>
					<DropdownMenuItem
						onClick={(e) => {
							e.stopPropagation();
							if (onView) return onView(user);
						}}
					>
						<Eye className="mr-2 h-4 w-4" /> View
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={(e) => {
							e.stopPropagation();
							if (onAdjustCredits) return onAdjustCredits(user);
						}}
					>
						<Sparkles className="mr-2 h-4 w-4" /> Adjust Credits
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={(e) => {
							e.stopPropagation();
							setConfirmRetry(true);
						}}
					>
						<UserCheck className="mr-2 h-4 w-4" /> Retry Provisioning
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={(e) => {
							e.stopPropagation();
							if (onEditProfile) return onEditProfile(user);
						}}
					>
						<Edit className="mr-2 h-4 w-4" /> Edit Profile
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={(e) => {
							e.stopPropagation();
							if (onResetPassword) return onResetPassword(user);
						}}
					>
						<Key className="mr-2 h-4 w-4" /> Reset Password
					</DropdownMenuItem>
					<DropdownMenuSub>
						<DropdownMenuSubTrigger>
							<Shield className="mr-2 h-4 w-4" /> User Access
						</DropdownMenuSubTrigger>
						<DropdownMenuSubContent>
							{user.status === "suspended" ? (
								<DropdownMenuItem
									onClick={(e) => {
										e.stopPropagation();
										if (onUnsuspendUser) return onUnsuspendUser(user);
									}}
								>
									Unsuspend Now
								</DropdownMenuItem>
							) : (
								<DropdownMenuItem
									onClick={(e) => {
										e.stopPropagation();
										if (onSuspendUser) return onSuspendUser(user);
									}}
								>
									Suspend User
								</DropdownMenuItem>
							)}
							<DropdownMenuItem
								onClick={(e) => {
									e.stopPropagation();
									if (onBanUser) return onBanUser(user);
								}}
								className="focus:bg-red-50 focus:text-red-600 text-red-600"
							>
								Ban User
							</DropdownMenuItem>
						</DropdownMenuSubContent>
					</DropdownMenuSub>
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
}
