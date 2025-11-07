/**
 * PasswordSection: Password management and requirements
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSecurityStore } from "@/lib/stores/dashboard";
import { AlertCircle, Check, Eye, EyeOff, X } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";

const PasswordSection: React.FC = () => {
	const {
		showCurrentPassword,
		showNewPassword,
		showConfirmPassword,
		currentPassword,
		newPassword,
		confirmPassword,
		setNewPassword,
		setConfirmPassword,
		toggleShowCurrentPassword,
		toggleShowNewPassword,
		toggleShowConfirmPassword,
		setCurrentPassword,
	} = useSecurityStore();

	// Password strength validation
	const passwordStrength = useMemo(() => {
		const checks = {
			length: newPassword.length >= 8,
			uppercase: /[A-Z]/.test(newPassword),
			lowercase: /[a-z]/.test(newPassword),
			number: /[0-9]/.test(newPassword),
			special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
		};

		const passed = Object.values(checks).filter(Boolean).length;
		return { checks, strength: passed, total: 5 };
	}, [newPassword]);

	const passwordsMatch =
		newPassword && confirmPassword && newPassword === confirmPassword;

	const handleUpdatePassword = async () => {
		if (!currentPassword) {
			toast.error("Please enter your current password");
			return;
		}

		if (passwordStrength.strength < 4) {
			toast.error("Password does not meet security requirements");
			return;
		}

		if (!passwordsMatch) {
			toast.error("Passwords do not match");
			return;
		}

		// TODO: Implement actual password update logic
		toast.success("Password updated successfully");
		setCurrentPassword("");
		setNewPassword("");
		setConfirmPassword("");
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h3 className="font-semibold text-gray-900 text-lg dark:text-white">
					Change Password
				</h3>
				<p className="mt-1 text-gray-600 text-sm dark:text-gray-400">
					Update your password regularly to keep your account secure
				</p>
			</div>

			{/* Current Password */}
			<div className="space-y-2">
				<label
					htmlFor="currentPassword"
					className="block font-medium text-gray-700 text-sm dark:text-gray-300"
				>
					Current Password <span className="text-red-500">*</span>
				</label>
				<div className="relative">
					<Input
						id="currentPassword"
						type={showCurrentPassword ? "text" : "password"}
						placeholder="Enter current password"
						value={currentPassword}
						onChange={(e) => setCurrentPassword(e.target.value)}
						className="pr-10"
					/>
					<button
						type="button"
						className="absolute inset-y-0 right-0 flex items-center pr-3"
						onClick={toggleShowCurrentPassword}
					>
						{showCurrentPassword ? (
							<EyeOff className="h-4 w-4 text-gray-400" />
						) : (
							<Eye className="h-4 w-4 text-gray-400" />
						)}
					</button>
				</div>
			</div>

			{/* New Password */}
			<div className="space-y-2">
				<label
					htmlFor="newPassword"
					className="block font-medium text-gray-700 text-sm dark:text-gray-300"
				>
					New Password <span className="text-red-500">*</span>
				</label>
				<div className="relative">
					<Input
						id="newPassword"
						type={showNewPassword ? "text" : "password"}
						placeholder="Enter new password"
						value={newPassword}
						onChange={(e) => setNewPassword(e.target.value)}
						className="pr-10"
					/>
					<button
						type="button"
						className="absolute inset-y-0 right-0 flex items-center pr-3"
						onClick={toggleShowNewPassword}
					>
						{showNewPassword ? (
							<EyeOff className="h-4 w-4 text-gray-400" />
						) : (
							<Eye className="h-4 w-4 text-gray-400" />
						)}
					</button>
				</div>

				{/* Password Requirements */}
				{newPassword && (
					<div className="mt-3 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
						<p className="font-medium text-gray-700 text-sm dark:text-gray-300">
							Password Requirements:
						</p>
						<div className="space-y-1">
							<RequirementItem
								met={passwordStrength.checks.length}
								text="At least 8 characters"
							/>
							<RequirementItem
								met={passwordStrength.checks.uppercase}
								text="One uppercase letter"
							/>
							<RequirementItem
								met={passwordStrength.checks.lowercase}
								text="One lowercase letter"
							/>
							<RequirementItem
								met={passwordStrength.checks.number}
								text="One number"
							/>
							<RequirementItem
								met={passwordStrength.checks.special}
								text="One special character"
							/>
						</div>
					</div>
				)}
			</div>

			{/* Confirm Password */}
			<div className="space-y-2">
				<label
					htmlFor="confirmPassword"
					className="block font-medium text-gray-700 text-sm dark:text-gray-300"
				>
					Confirm New Password <span className="text-red-500">*</span>
				</label>
				<div className="relative">
					<Input
						id="confirmPassword"
						type={showConfirmPassword ? "text" : "password"}
						placeholder="Confirm new password"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						className="pr-10"
					/>
					<button
						type="button"
						className="absolute inset-y-0 right-0 flex items-center pr-3"
						onClick={toggleShowConfirmPassword}
					>
						{showConfirmPassword ? (
							<EyeOff className="h-4 w-4 text-gray-400" />
						) : (
							<Eye className="h-4 w-4 text-gray-400" />
						)}
					</button>
				</div>

				{confirmPassword && (
					<div className="mt-2">
						{passwordsMatch ? (
							<div className="flex items-center gap-2 text-green-600 text-sm dark:text-green-400">
								<Check className="h-4 w-4" />
								<span>Passwords match</span>
							</div>
						) : (
							<div className="flex items-center gap-2 text-red-600 text-sm dark:text-red-400">
								<X className="h-4 w-4" />
								<span>Passwords do not match</span>
							</div>
						)}
					</div>
				)}
			</div>

			{/* Security Tips */}
			<div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
				<div className="flex gap-3">
					<AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
					<div className="space-y-1">
						<p className="font-medium text-blue-900 text-sm dark:text-blue-100">
							Password Security Tips
						</p>
						<ul className="list-inside list-disc space-y-1 text-blue-800 text-sm dark:text-blue-200">
							<li>Use a unique password you don't use elsewhere</li>
							<li>Consider using a password manager</li>
							<li>Enable two-factor authentication for extra security</li>
						</ul>
					</div>
				</div>
			</div>

			{/* Actions */}
			<div className="flex justify-end gap-3 border-gray-200 border-t pt-4 dark:border-gray-700">
				<Button
					variant="outline"
					onClick={() => {
						setCurrentPassword("");
						setNewPassword("");
						setConfirmPassword("");
					}}
				>
					Cancel
				</Button>
				<Button
					onClick={handleUpdatePassword}
					disabled={
						!currentPassword || passwordStrength.strength < 4 || !passwordsMatch
					}
				>
					Update Password
				</Button>
			</div>
		</div>
	);
};

/**
 * RequirementItem: Visual indicator for password requirements
 */
interface RequirementItemProps {
	met: boolean;
	text: string;
}

const RequirementItem: React.FC<RequirementItemProps> = ({ met, text }) => (
	<div className="flex items-center gap-2">
		{met ? (
			<Check className="h-4 w-4 text-green-600 dark:text-green-400" />
		) : (
			<X className="h-4 w-4 text-gray-400 dark:text-gray-600" />
		)}
		<span
			className={`text-sm ${met ? "text-green-700 dark:text-green-300" : "text-gray-600 dark:text-gray-400"}`}
		>
			{text}
		</span>
	</div>
);

export default PasswordSection;
