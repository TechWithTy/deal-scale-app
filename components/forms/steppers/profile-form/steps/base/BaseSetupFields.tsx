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
			<FormField
				control={control}
				name="companyWebsite"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Company Website</FormLabel>
						<FormControl>
							<Input
								type="url"
								disabled={loading}
								placeholder="https://www.example.com"
								{...field}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			{/* <div className="relative">
				<div className="pointer-events-auto absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/70">
					<span className="text-sm font-medium text-muted-foreground">Coming soon</span>
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
