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
import { useEffect, useState } from "react";
import type { AdminUser } from "@/components/tables/super-users/types";

interface SuspendUserModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user: AdminUser | null;
	onConfirm: (userId: string, unsuspendDate?: string) => void;
}

export default function SuspendUserModal({
	open,
	onOpenChange,
	user,
	onConfirm,
}: SuspendUserModalProps) {
	const [unsuspendDate, setUnsuspendDate] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!open) setUnsuspendDate("");
	}, [open]);

	const handleConfirm = async () => {
		if (!user) return;
		setLoading(true);
		try {
			await new Promise((r) => setTimeout(r, 300));
			onConfirm(user.id, unsuspendDate || undefined);
			onOpenChange(false);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Suspend User</DialogTitle>
				</DialogHeader>
				<div className="space-y-4">
					<div>
						<p className="text-muted-foreground text-sm">
							Suspend{" "}
							<strong>
								{user?.firstName} {user?.lastName}
							</strong>{" "}
							({user?.email})
						</p>
						<p className="mt-2 text-muted-foreground text-sm">
							Suspended users cannot log in until the unsuspend date.
						</p>
					</div>
					<div className="space-y-2">
						<Label htmlFor="unsuspendDate">Unsuspend Date (optional)</Label>
						<Input
							id="unsuspendDate"
							type="date"
							value={unsuspendDate}
							onChange={(e) => setUnsuspendDate(e.target.value)}
						/>
						<p className="text-muted-foreground text-xs">
							Leave blank for indefinite suspension
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
						<Button onClick={handleConfirm} disabled={loading}>
							{loading ? "Suspending..." : "Confirm Suspend"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
