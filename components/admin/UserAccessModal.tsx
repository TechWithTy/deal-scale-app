"use client";

import type { AdminUser } from "@/components/tables/super-users/types";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

interface UserAccessModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user: AdminUser | null;
	onSuspend: (userId: string, unsuspendDate?: string) => void;
	onUnsuspend: (userId: string) => void;
	onBan: (userId: string) => void;
}

export default function UserAccessModal({
	open,
	onOpenChange,
	user,
	onSuspend,
	onUnsuspend,
	onBan,
}: UserAccessModalProps) {
	const [unsuspendDate, setUnsuspendDate] = useState("");
	const [loading, setLoading] = useState(false);
	const [action, setAction] = useState<"suspend" | "unsuspend" | "ban" | null>(
		null,
	);

	useEffect(() => {
		if (!open) {
			setUnsuspendDate("");
			setAction(null);
		}
	}, [open]);

	const handleSuspend = async () => {
		if (!user) return;

		setLoading(true);
		try {
			// Mock API call
			await new Promise((resolve) => setTimeout(resolve, 500));

			onSuspend(user.id, unsuspendDate || undefined);
			onOpenChange(false);
		} finally {
			setLoading(false);
		}
	};

	const handleUnsuspend = async () => {
		if (!user) return;

		setLoading(true);
		try {
			// Mock API call
			await new Promise((resolve) => setTimeout(resolve, 500));

			onUnsuspend(user.id);
			onOpenChange(false);
		} finally {
			setLoading(false);
		}
	};

	const handleBan = async () => {
		if (!user) return;

		setLoading(true);
		try {
			// Mock API call
			await new Promise((resolve) => setTimeout(resolve, 500));

			onBan(user.id);
			onOpenChange(false);
		} finally {
			setLoading(false);
		}
	};

	const renderSuspendForm = () => (
		<div className="space-y-4">
			<div>
				<p className="text-muted-foreground text-sm">
					Suspend user{" "}
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
					onClick={() => setAction(null)}
					disabled={loading}
				>
					Back
				</Button>
				<Button onClick={handleSuspend} disabled={loading}>
					{loading ? "Suspending..." : "Suspend User"}
				</Button>
			</div>
		</div>
	);

	const renderUnsuspendForm = () => (
		<div className="space-y-4">
			<div>
				<p className="text-muted-foreground text-sm">
					Unsuspend user{" "}
					<strong>
						{user?.firstName} {user?.lastName}
					</strong>{" "}
					({user?.email}) immediately?
				</p>
				<p className="mt-2 text-muted-foreground text-sm">
					This will restore the user's access to the platform.
				</p>
			</div>

			<div className="flex justify-end gap-2 pt-4">
				<Button
					type="button"
					variant="ghost"
					onClick={() => setAction(null)}
					disabled={loading}
				>
					Back
				</Button>
				<Button onClick={handleUnsuspend} disabled={loading}>
					{loading ? "Unsuspending..." : "Unsuspend Now"}
				</Button>
			</div>
		</div>
	);

	const renderBanForm = () => (
		<div className="space-y-4">
			<div>
				<p className="text-muted-foreground text-sm">
					Ban user{" "}
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
					All user data will be retained for compliance purposes.
				</p>
			</div>

			<div className="flex justify-end gap-2 pt-4">
				<Button
					type="button"
					variant="ghost"
					onClick={() => setAction(null)}
					disabled={loading}
				>
					Back
				</Button>
				<Button variant="destructive" onClick={handleBan} disabled={loading}>
					{loading ? "Banning..." : "Ban User"}
				</Button>
			</div>
		</div>
	);

	const renderMainActions = () => (
		<div className="space-y-4">
			<div>
				<p className="text-muted-foreground text-sm">
					Manage access for{" "}
					<strong>
						{user?.firstName} {user?.lastName}
					</strong>{" "}
					({user?.email})
				</p>
			</div>

			<div className="space-y-2">
				{user?.status === "suspended" ? (
					<Button
						className="w-full justify-start"
						variant="outline"
						onClick={() => setAction("unsuspend")}
					>
						Unsuspend Now
					</Button>
				) : (
					<Button
						className="w-full justify-start"
						variant="outline"
						onClick={() => setAction("suspend")}
					>
						Suspend User
					</Button>
				)}

				<Button
					className="w-full justify-start"
					variant="outline"
					onClick={() => setAction("ban")}
				>
					Ban User
				</Button>
			</div>
		</div>
	);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>User Access</DialogTitle>
				</DialogHeader>

				{action === "suspend" && renderSuspendForm()}
				{action === "unsuspend" && renderUnsuspendForm()}
				{action === "ban" && renderBanForm()}
				{!action && renderMainActions()}
			</DialogContent>
		</Dialog>
	);
}
