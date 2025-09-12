"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import type { AdminUser } from "@/components/tables/super-users/types";

interface ResetPasswordModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user: AdminUser | null;
	onReset: (userId: string) => void;
}

export default function ResetPasswordModal({
	open,
	onOpenChange,
	user,
	onReset,
}: ResetPasswordModalProps) {
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	const handleReset = async () => {
		if (!user) return;

		setLoading(true);
		try {
			// Mock API call
			await new Promise((resolve) => setTimeout(resolve, 500));

			// In a real implementation, you would call:
			// await fetch(`/api/v1/admin/users/${user.id}/reset-password`, { method: 'POST' });

			onReset(user.id);
			setSuccess(true);

			// Close the modal after 1.5 seconds
			setTimeout(() => {
				onOpenChange(false);
				setSuccess(false);
			}, 1500);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Reset Password</DialogTitle>
				</DialogHeader>

				{success ? (
					<div className="py-6 text-center">
						<div className="font-medium text-green-600">
							Password reset email sent successfully!
						</div>
						<div className="mt-2 text-sm text-muted-foreground">
							An email with instructions to reset the password has been sent to{" "}
							{user?.email}.
						</div>
					</div>
				) : (
					<>
						<div className="py-2">
							<p className="text-muted-foreground text-sm">
								Are you sure you want to reset the password for{" "}
								<strong>
									{user?.firstName} {user?.lastName}
								</strong>{" "}
								({user?.email})?
							</p>
							<p className="mt-2 text-muted-foreground text-sm">
								This will send an email with password reset instructions to the
								user.
							</p>
						</div>
						<div className="flex justify-end gap-2 pt-4">
							<Button
								type="button"
								variant="ghost"
								onClick={() => onOpenChange(false)}
								disabled={loading}
							>
								Cancel
							</Button>
							<Button onClick={handleReset} disabled={loading}>
								{loading ? "Sending..." : "Send Reset Email"}
							</Button>
						</div>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
