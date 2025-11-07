/**
 * TwoFactorSection: Two-Factor Authentication management
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	AlertTriangle,
	CheckCircle2,
	Copy,
	Key,
	Mail,
	Shield,
	Smartphone,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const TwoFactorSection: React.FC = () => {
	const [twoFAEnabled, setTwoFAEnabled] = useState(false);
	const [showSetup, setShowSetup] = useState(false);
	const [setupMethod, setSetupMethod] = useState<"sms" | "app" | null>(null);
	const [verificationCode, setVerificationCode] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [backupCodes, setBackupCodes] = useState<string[]>([]);

	// Mock QR code for authenticator app
	const qrCodeUrl =
		"https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/DealScale:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=DealScale";

	const handleEnable2FA = (method: "sms" | "app") => {
		setSetupMethod(method);
		setShowSetup(true);
	};

	const handleVerify = () => {
		if (!verificationCode || verificationCode.length !== 6) {
			toast.error("Please enter a valid 6-digit code");
			return;
		}

		// TODO: Implement actual 2FA verification
		setTwoFAEnabled(true);
		setShowSetup(false);

		// Generate backup codes
		const codes = Array.from({ length: 10 }, () =>
			Math.random().toString(36).substring(2, 10).toUpperCase(),
		);
		setBackupCodes(codes);

		toast.success("Two-factor authentication enabled successfully");
	};

	const handleDisable2FA = () => {
		// TODO: Implement actual 2FA disable logic
		setTwoFAEnabled(false);
		setBackupCodes([]);
		toast.success("Two-factor authentication disabled");
	};

	const copyBackupCodes = () => {
		navigator.clipboard.writeText(backupCodes.join("\n"));
		toast.success("Backup codes copied to clipboard");
	};

	if (showSetup && setupMethod) {
		return (
			<div className="space-y-6">
				{/* Setup Header */}
				<div>
					<h3 className="font-semibold text-gray-900 text-lg dark:text-white">
						{setupMethod === "sms"
							? "Setup SMS Authentication"
							: "Setup Authenticator App"}
					</h3>
					<p className="mt-1 text-gray-600 text-sm dark:text-gray-400">
						{setupMethod === "sms"
							? "Enter your phone number to receive verification codes"
							: "Scan the QR code with your authenticator app"}
					</p>
				</div>

				{setupMethod === "app" ? (
					<>
						{/* QR Code */}
						<div className="flex flex-col items-center space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
							<img
								src={qrCodeUrl}
								alt="QR Code"
								className="h-48 w-48 rounded-lg"
							/>
							<div className="text-center">
								<p className="font-medium text-gray-700 text-sm dark:text-gray-300">
									Secret Key (Manual Entry)
								</p>
								<code className="mt-2 inline-block rounded bg-gray-200 px-3 py-1 font-mono text-sm dark:bg-gray-700">
									JBSWY3DPEHPK3PXP
								</code>
							</div>
						</div>

						{/* Instructions */}
						<div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
							<p className="font-medium text-blue-900 text-sm dark:text-blue-100">
								Setup Instructions:
							</p>
							<ol className="list-inside list-decimal space-y-1 text-blue-800 text-sm dark:text-blue-200">
								<li>
									Install an authenticator app (Google Authenticator, Authy,
									etc.)
								</li>
								<li>Scan the QR code or enter the secret key manually</li>
								<li>Enter the 6-digit code from your app below</li>
							</ol>
						</div>
					</>
				) : (
					<>
						{/* Phone Number Input */}
						<div className="space-y-2">
							<label className="block font-medium text-gray-700 text-sm dark:text-gray-300">
								Phone Number
							</label>
							<Input
								type="tel"
								placeholder="+1 (555) 123-4567"
								value={phoneNumber}
								onChange={(e) => setPhoneNumber(e.target.value)}
							/>
						</div>

						<Button
							className="w-full"
							onClick={() =>
								toast.success("Verification code sent to your phone")
							}
						>
							<Mail className="mr-2 h-4 w-4" />
							Send Verification Code
						</Button>
					</>
				)}

				{/* Verification Code */}
				<div className="space-y-2">
					<label className="block font-medium text-gray-700 text-sm dark:text-gray-300">
						Verification Code
					</label>
					<Input
						type="text"
						placeholder="Enter 6-digit code"
						value={verificationCode}
						onChange={(e) =>
							setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))
						}
						maxLength={6}
					/>
				</div>

				{/* Actions */}
				<div className="flex gap-3">
					<Button
						variant="outline"
						className="flex-1"
						onClick={() => {
							setShowSetup(false);
							setSetupMethod(null);
							setVerificationCode("");
							setPhoneNumber("");
						}}
					>
						Cancel
					</Button>
					<Button className="flex-1" onClick={handleVerify}>
						Verify & Enable
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<div className="flex items-center gap-2">
					<h3 className="font-semibold text-gray-900 text-lg dark:text-white">
						Two-Factor Authentication
					</h3>
					{twoFAEnabled && (
						<Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
							<CheckCircle2 className="mr-1 h-3 w-3" />
							Enabled
						</Badge>
					)}
				</div>
				<p className="mt-1 text-gray-600 text-sm dark:text-gray-400">
					Add an extra layer of security to your account
				</p>
			</div>

			{!twoFAEnabled ? (
				<>
					{/* Warning Banner */}
					<div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
						<div className="flex gap-3">
							<AlertTriangle className="h-5 w-5 flex-shrink-0 text-orange-600 dark:text-orange-400" />
							<div>
								<p className="font-medium text-orange-900 text-sm dark:text-orange-100">
									Two-factor authentication is not enabled
								</p>
								<p className="mt-1 text-orange-800 text-sm dark:text-orange-200">
									Enable 2FA to significantly improve your account security
								</p>
							</div>
						</div>
					</div>

					{/* Method Options */}
					<div className="grid gap-4 md:grid-cols-2">
						{/* SMS Method */}
						<div className="rounded-lg border border-gray-200 bg-white p-6 transition-colors hover:border-blue-300 dark:border-gray-700 dark:bg-gray-800">
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
								<Smartphone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
							</div>
							<h4 className="font-semibold text-gray-900 dark:text-white">
								SMS Authentication
							</h4>
							<p className="mt-2 text-gray-600 text-sm dark:text-gray-400">
								Receive verification codes via SMS to your phone number
							</p>
							<Button
								className="mt-4 w-full"
								variant="outline"
								onClick={() => handleEnable2FA("sms")}
							>
								Setup SMS
							</Button>
						</div>

						{/* Authenticator App Method */}
						<div className="rounded-lg border border-gray-200 bg-white p-6 transition-colors hover:border-blue-300 dark:border-gray-700 dark:bg-gray-800">
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
								<Key className="h-6 w-6 text-purple-600 dark:text-purple-400" />
							</div>
							<h4 className="font-semibold text-gray-900 dark:text-white">
								Authenticator App
							</h4>
							<p className="mt-2 text-gray-600 text-sm dark:text-gray-400">
								Use an authenticator app for more secure time-based codes
							</p>
							<Button
								className="mt-4 w-full"
								onClick={() => handleEnable2FA("app")}
							>
								Setup App
							</Button>
						</div>
					</div>
				</>
			) : (
				<>
					{/* Status Info */}
					<div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
						<div className="flex gap-3">
							<Shield className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
							<div>
								<p className="font-medium text-green-900 text-sm dark:text-green-100">
									Two-factor authentication is active
								</p>
								<p className="mt-1 text-green-800 text-sm dark:text-green-200">
									Your account is protected with{" "}
									{setupMethod === "sms" ? "SMS" : "authenticator app"}{" "}
									verification
								</p>
							</div>
						</div>
					</div>

					{/* Backup Codes */}
					{backupCodes.length > 0 && (
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<h4 className="font-semibold text-gray-900 dark:text-white">
									Backup Codes
								</h4>
								<Button variant="outline" size="sm" onClick={copyBackupCodes}>
									<Copy className="mr-2 h-4 w-4" />
									Copy All
								</Button>
							</div>
							<p className="text-gray-600 text-sm dark:text-gray-400">
								Save these codes in a secure place. Each code can only be used
								once.
							</p>
							<div className="grid grid-cols-2 gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
								{backupCodes.map((code, index) => (
									<code
										key={index}
										className="rounded bg-white px-3 py-2 text-center font-mono text-sm dark:bg-gray-700"
									>
										{code}
									</code>
								))}
							</div>
						</div>
					)}

					{/* Disable Button */}
					<div className="border-gray-200 border-t pt-4 dark:border-gray-700">
						<Button variant="destructive" onClick={handleDisable2FA}>
							Disable Two-Factor Authentication
						</Button>
					</div>
				</>
			)}
		</div>
	);
};

export default TwoFactorSection;
