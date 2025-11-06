"use client";

import { Button } from "@/components/ui/button";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useModalStore } from "@/lib/stores/dashboard";
// import { useTheme } from 'next-themes';
import type { UserPermissions } from "@/types/userProfile";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Settings } from "lucide-react";

// Define the form schema with Zod
const formSchema = z.object({
	email: z.string().email({ message: "Please enter a valid email address" }),
	permissions: z
		.object({
			canGenerateLeads: z.boolean(),
			canStartCampaigns: z.boolean(),
			canViewReports: z.boolean(),
			canManageTeam: z.boolean(),
			canManageSubscription: z.boolean(),
			canAccessAI: z.boolean(),
			canMoveCompanyTasks: z.boolean(),
			canEditCompanyProfile: z.boolean(),
		})
		.refine((permissions) => Object.values(permissions).some(Boolean), {
			message: "At least one permission must be enabled",
		}),
});

type FormValues = z.infer<typeof formSchema>;

const defaultPermissions: UserPermissions = {
	canGenerateLeads: false,
	canStartCampaigns: false,
	canViewReports: false,
	canManageTeam: false,
	canManageSubscription: false,
	canAccessAI: false,
	canMoveCompanyTasks: false,
	canEditCompanyProfile: false,
};

// Custom Modal Component
const Modal: React.FC<{
	isOpen: boolean;
	onClose: () => void;
	children: React.ReactNode;
}> = ({ isOpen, onClose, children }) => {
	// Lock scroll when the modal is open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}

		return () => {
			document.body.style.overflow = ""; // Cleanup on unmount or modal close
		};
	}, [isOpen]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
			<div className="relative w-full max-w-lg rounded-lg bg-card p-6 shadow-lg">
				<button
					type="button"
					onClick={onClose}
					className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={2}
						stroke="currentColor"
						className="h-6 w-6"
						aria-labelledby="close-modal-title"
						role="img"
					>
						<title id="close-modal-title">Close modal</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
				{children}
			</div>
		</div>
	);
};

// Custom Switch Component for non ShadCN switch
const CustomSwitch: React.FC<{
	checked: boolean;
	onCheckedChange: (value: boolean) => void;
}> = ({ checked, onCheckedChange }) => {
	return (
		<label className="inline-flex cursor-pointer items-center">
			<input
				type="checkbox"
				checked={checked}
				onChange={(e) => onCheckedChange(e.target.checked)}
				className="peer sr-only"
			/>
			<div className="peer relative h-6 w-11 rounded-full bg-muted peer-checked:bg-primary peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring">
				<div
					className={`absolute top-0.5 left-0.5 h-5 w-5 transform rounded-full bg-background shadow-lg transition-transform duration-300 ease-in-out ${checked ? "translate-x-5" : ""}`}
				/>
			</div>
		</label>
	);
};

// Invite Employee Modal Component
export const InviteEmployeeModal = () => {
	// const { theme } = useTheme();
	const { isEmployeeModalOpen, closeEmployeeModal } = useModalStore();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const router = useRouter();

	// Use react-hook-form for form management
	const methods = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			permissions: defaultPermissions,
		},
	});

	const {
		handleSubmit,
		control,
		formState: { errors },
		reset,
	} = methods;

	const onSubmit = async (data: FormValues) => {
		setIsSubmitting(true);
		try {
			// Simulate API request
			setTimeout(() => {
				toast.success(`Employee invited: ${data.email}`);
				setIsSubmitting(false);
				reset();
				closeEmployeeModal(); // Close the modal after submission
			}, 2000);
		} catch (error) {
			toast.error("An error occurred. Please try again.");
			setIsSubmitting(false);
		}
	};

	/** Navigate to employee dashboard page for advanced settings */
	const handleAdvanced = () => {
		closeEmployeeModal();
		router.push("/dashboard/employee");
	};

	useEffect(() => {
		if (errors.email) {
			toast.error(errors.email.message || "Invalid email");
		}

		if (errors.permissions) {
			toast.error(
				errors.permissions.message || "At least one permission must be enabled",
			);
		}
	}, [errors]);

	return (
		<>
			{/* Modal Implementation */}
			<Modal isOpen={isEmployeeModalOpen} onClose={closeEmployeeModal}>
				<div className="rounded-lg">
					<h2 className="font-semibold text-foreground text-xl">
						Invite New Employee
					</h2>

					<FormProvider {...methods}>
						<form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
							{/* Input for Email */}
							<div>
								<FormLabel className="block font-medium text-sm">
									Email
								</FormLabel>
								<Controller
									name="email"
									control={control}
									render={({ field }) => (
										<Input
											type="email"
											{...field}
											placeholder="Enter employee email"
											className="mt-1 w-full"
											required
										/>
									)}
								/>
								{errors.email && (
									<p className="text-destructive text-sm">
										{errors.email.message}
									</p>
								)}
							</div>

							{/* Permissions */}
							<div className="space-y-2">
								<div className="font-semibold text-foreground text-sm">
									Permissions
								</div>
								<div className="grid grid-cols-2 gap-4">
									{(
										Object.keys(defaultPermissions) as Array<
											keyof UserPermissions
										>
									).map((permissionKey) => (
										<FormField
											key={permissionKey}
											control={control}
											name={
												`permissions.${permissionKey}` as `permissions.${keyof UserPermissions}`
											}
											render={({ field }) => (
												<FormItem>
													<div className="flex items-center justify-between">
														{/* Align label and switch on the same line */}
														<FormLabel className="text-foreground text-sm">
															{permissionKey
																.replace(/can/, "Can ")
																.replace(/([A-Z])/g, " $1")}
														</FormLabel>
														<FormControl>
															<CustomSwitch
																checked={field.value as boolean}
																onCheckedChange={field.onChange}
															/>
														</FormControl>
													</div>
													<FormMessage />
												</FormItem>
											)}
										/>
									))}
								</div>
							</div>

							{/* Footer with action buttons */}
							<div className="mt-6 flex items-center justify-between gap-4">
								<Button
									type="button"
									variant="outline"
									onClick={handleAdvanced}
									disabled={isSubmitting}
									className="gap-2"
								>
									<Settings className="h-4 w-4" />
									Advanced
								</Button>
								<div className="flex gap-4">
									<Button
										variant="secondary"
										onClick={() => {
											reset();
											closeEmployeeModal();
										}}
										disabled={isSubmitting}
									>
										Cancel
									</Button>
									<Button type="submit" disabled={isSubmitting}>
										{isSubmitting ? "Inviting..." : "Invite"}
									</Button>
								</div>
							</div>
						</form>
					</FormProvider>
				</div>
			</Modal>
		</>
	);
};
