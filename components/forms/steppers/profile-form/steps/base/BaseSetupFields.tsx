import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { ProfileFormValues } from "@/types/zod/userSetup/profile-form-schema";
import type React from "react";
import { useFormContext } from "react-hook-form";

// * Props only include loading; form state is managed via useFormContext
interface BaseSetupFieldsProps {
	loading: boolean;
}

export const BaseSetupFields: React.FC<BaseSetupFieldsProps> = ({
	loading,
}) => {
	const { control, handleSubmit, register, formState } =
		useFormContext<ProfileFormValues>();
	return (
		<>
			<FormField
				control={control}
				name="companyName"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Company name</FormLabel>
						<FormControl>
							<Input disabled={loading} placeholder="Apex Company" {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			{/* <div className="relative">
				<div className="pointer-events-auto absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/70 dark:bg-black/60">
					<span className="font-medium text-gray-500 text-sm">Coming soon</span>
				</div>
				<FormField
					control={control}
					name="outreachEmailAddress"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="cursor-not-allowed opacity-50">
								Outreach Email
							</FormLabel>
							<FormControl>
								<Input disabled placeholder="johndoe@gmail.com" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div> */}
			<FormField
				control={control}
				name="leadForwardingNumber"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Forwarding Phone Number</FormLabel>
						<FormControl>
							<Input
								type="number"
								placeholder="Enter your phone number"
								disabled={loading}
								{...field}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={control}
				name="companyExplainerVideoUrl"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Company Explainer Video URL</FormLabel>
						<FormControl>
							<Input
								type="url"
								disabled={loading}
								placeholder="https://example.com/video"
								{...field}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
};
