import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { LockIcon, CheckCircle2 } from "lucide-react";

interface UpdatePasswordSectionProps {
	userId: string;
}

export const UpdatePasswordSection: React.FC<UpdatePasswordSectionProps> = ({
	userId,
}) => {
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState<{
		newPassword?: string;
		confirmPassword?: string;
	}>({});

	const validate = () => {
		const errs: typeof errors = {};
		if (!newPassword || newPassword.length < 8) {
			errs.newPassword = "Password must be at least 8 characters.";
		}
		if (newPassword !== confirmPassword) {
			errs.confirmPassword = "Passwords do not match.";
		}
		setErrors(errs);
		return Object.keys(errs).length === 0;
	};

	const handleUpdate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validate()) return;
		setLoading(true);
		try {
			// TODO: Replace with your API call
			// await api.updateUserPassword(userId, newPassword);
			await new Promise((res) => setTimeout(res, 1000)); // mock
			toast({
				title: "Password updated!",
				description: "The team member's password has been changed.",
				variant: "default",
			});
			setNewPassword("");
			setConfirmPassword("");
			setErrors({});
		} catch (e) {
			toast({
				title: "Error",
				description: "Failed to update password. Please try again.",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const [success, setSuccess] = useState(false);

	return (
		<Card className="mt-8 border bg-card p-8 shadow-sm">
			<form onSubmit={handleUpdate} autoComplete="off">
				<div className="flex items-center justify-between gap-6">
					<div className="flex items-center gap-3">
						<LockIcon className="h-6 w-6 text-primary" aria-hidden />
						<div>
							<h3 className="font-semibold text-lg">Update Password</h3>
							<p className="text-muted-foreground text-sm">
								Set a new password for this team member.
								<br />
								They will be required to use it on next login.
							</p>
						</div>
					</div>
					<Button
						type="submit"
						disabled={loading || success}
						variant="default"
						aria-label="Update password"
					>
						{loading ? (
							<span className="flex items-center gap-2">
								<span className="animate-spin">⏳</span> Updating...
							</span>
						) : success ? (
							<span className="flex items-center gap-2 text-green-600">
								<CheckCircle2 className="h-4 w-4" /> Updated!
							</span>
						) : (
							"Update Password"
						)}
					</Button>
				</div>
				<Separator className="my-4" />
				<div className="flex max-w-md flex-col gap-4">
					<div>
						<label
							htmlFor="new-password"
							className="mb-1 block font-medium text-sm"
						>
							New Password
						</label>
						<Input
							id="new-password"
							type="password"
							autoComplete="new-password"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							disabled={loading}
							minLength={8}
							required
						/>
						{errors.newPassword && (
							<span className="text-destructive text-xs">
								{errors.newPassword}
							</span>
						)}
					</div>
					<div>
						<label
							htmlFor="confirm-password"
							className="mb-1 block font-medium text-sm"
						>
							Confirm Password
						</label>
						<Input
							id="confirm-password"
							type="password"
							autoComplete="new-password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							disabled={loading}
							minLength={8}
							required
						/>
						{errors.confirmPassword && (
							<span className="text-destructive text-xs">
								{errors.confirmPassword}
							</span>
						)}
					</div>
				</div>
			</form>
		</Card>
	);
};
