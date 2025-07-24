"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useModalStore, useSecurityStore } from "@/lib/stores/dashboard";
import { Eye } from "lucide-react";
import { useEffect } from "react";

export const SecurityModal: React.FC = () => {
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

	const { isSecurityModalOpen, closeSecurityModal } = useModalStore(); // Zustand Modal state

	// Handle scroll lock when modal is open/closed
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const body = document.body;
		if (isSecurityModalOpen) {
			body.style.overflow = "hidden"; // Lock scrolling when modal is open
		} else {
			body.style.overflow = ""; // Restore scrolling when modal is closed
		}

		return () => {
			body.style.overflow = ""; // Cleanup on unmount
		};
	}, [isSecurityModalOpen]);

	if (!isSecurityModalOpen) return null; // Don't render the modal if it's not open

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
			<div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
				<h2 className="mb-4 font-semibold text-xl dark:text-gray-200">
					Security Settings
				</h2>

				{/* Password Change Section */}
				<div className="mt-4">
					<h3 className="font-medium text-lg dark:text-gray-200">Password</h3>
					<p className="text-muted-foreground text-sm dark:text-gray-400">
						Please enter your current password to change your password.
					</p>
					<div className="mt-4 space-y-4">
						<div className="relative">
							<label
								htmlFor="currentPassword"
								className="block font-medium text-sm dark:text-gray-200"
							>
								Current Password*
							</label>
							<Input
								type={showCurrentPassword ? "text" : "password"}
								placeholder="Current Password"
								value={currentPassword}
								onChange={(e) => setCurrentPassword(e.target.value)}
							/>
							<button
								type="button"
								className="absolute top-8 right-2"
								onClick={toggleShowCurrentPassword}
							>
								<Eye className="h-5 w-5 text-gray-500 dark:text-gray-400" />
							</button>
						</div>

						<div className="relative">
							<label
								htmlFor="newPassword"
								className="block font-medium text-sm dark:text-gray-200"
							>
								New Password*
							</label>
							<Input
								type={showNewPassword ? "text" : "password"}
								placeholder="New Password"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
							/>
							<button
								type="button"
								className="absolute top-8 right-2"
								onClick={toggleShowNewPassword}
							>
								<Eye className="h-5 w-5 text-gray-500 dark:text-gray-400" />
							</button>
						</div>

						<div className="relative">
							<label
								htmlFor="confirmPassword"
								className="block font-medium text-sm dark:text-gray-200"
							>
								Confirm New Password*
							</label>
							<Input
								type={showConfirmPassword ? "text" : "password"}
								placeholder="Confirm New Password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
							/>
							<button
								type="button"
								className="absolute top-8 right-2"
								onClick={toggleShowConfirmPassword}
							>
								<Eye className="h-5 w-5 text-gray-500 dark:text-gray-400" />
							</button>
						</div>
					</div>

					<div className="mt-4 flex justify-end gap-4">
						<Button variant="outline" onClick={closeSecurityModal}>
							Cancel
						</Button>
						<Button className="bg-blue-600 text-white">Update Password</Button>
					</div>
				</div>

				<hr className="my-6 dark:border-gray-600" />

				{/* Two-Factor Authentication Section */}
				<div>
					<h3 className="font-medium text-lg dark:text-gray-200">
						Two-Factor Authentication
					</h3>
					<p className="text-muted-foreground text-sm dark:text-gray-400">
						Secure your account by enabling 2FA using SMS or an Authenticator
						app.
					</p>
					<div className="mt-4 space-y-4">
						<Button variant="secondary" className="w-full">
							Enable via SMS
						</Button>
						<Button variant="secondary" className="w-full">
							Enable via Authenticator App
						</Button>
					</div>
				</div>

				{/* Close button */}
				<button
					onClick={() => useModalStore.getState().closeSecurityModal()}
					type="button"
					className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						aria-hidden="true"
						strokeWidth="2"
						stroke="currentColor"
						className="h-6 w-6"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>
		</div>
	);
};
