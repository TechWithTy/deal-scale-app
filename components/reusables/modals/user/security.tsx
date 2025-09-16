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
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
			<div className="relative w-full max-w-lg rounded-lg bg-card p-6 text-card-foreground shadow-lg">
				<h2 className="mb-4 font-semibold text-foreground text-xl">
					Security Settings
				</h2>

				{/* Password Change Section */}
				<div className="mt-4">
					<h3 className="font-medium text-foreground text-lg">Password</h3>
					<p className="text-muted-foreground text-sm">
						Please enter your current password to change your password.
					</p>
					<div className="mt-4 space-y-4">
						<div className="relative">
							<label
								htmlFor="currentPassword"
								className="block font-medium text-foreground text-sm"
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
								<Eye className="h-5 w-5 text-muted-foreground" />
							</button>
						</div>

						<div className="relative">
							<label
								htmlFor="newPassword"
								className="block font-medium text-foreground text-sm"
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
								<Eye className="h-5 w-5 text-muted-foreground" />
							</button>
						</div>

						<div className="relative">
							<label
								htmlFor="confirmPassword"
								className="block font-medium text-foreground text-sm"
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
								<Eye className="h-5 w-5 text-muted-foreground" />
							</button>
						</div>
					</div>

					<div className="mt-4 flex justify-end gap-4">
						<Button variant="outline" onClick={closeSecurityModal}>
							Cancel
						</Button>
						<Button className="bg-primary text-primary-foreground">
							Update Password
						</Button>
					</div>
				</div>

				<hr className="my-6 border-border" />

				{/* Two-Factor Authentication Section */}
				<div>
					<h3 className="font-medium text-foreground text-lg">
						Two-Factor Authentication
					</h3>
					<p className="text-muted-foreground text-sm">
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
					className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
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
