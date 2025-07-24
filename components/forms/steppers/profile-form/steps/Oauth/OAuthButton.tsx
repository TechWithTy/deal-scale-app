import {
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import type { ProfileFormValues } from "@/types/zod/userSetup/profile-form-schema";
import type React from "react";
import type { Control } from "react-hook-form";

interface OAuthButtonProps {
	serviceData: unknown;
	serviceName: string;
	buttonComponent: JSX.Element;
	onRefresh: () => void;
	control: unknown;
}

export const OAuthButton: React.FC<OAuthButtonProps> = ({
	serviceData,
	serviceName,
	buttonComponent,
	onRefresh,
	control,
}) => (
	<FormField
		control={control as Control<ProfileFormValues>}
		// @ts-expect-error serviceName is dynamic and not a ProfileFormValues key
		name={serviceName}
		render={({ field, fieldState: { error } }) => (
			<FormItem>
				<FormLabel>{`${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)} Login`}</FormLabel>
				{serviceData ? (
					<div className="flex flex-col items-center justify-center">
						<p className="text-gray-600 text-sm dark:text-gray-300">
							You are logged in.
						</p>
						<button
							onClick={onRefresh}
							type="button"
							className="mt-2 rounded-lg bg-blue-500 px-4 py-2 font-semibold text-white shadow-md transition-colors duration-300 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 dark:bg-blue-400 dark:focus:ring-blue-300 dark:hover:bg-blue-500"
						>
							Refresh Login
						</button>
					</div>
				) : (
					buttonComponent
				)}
				<FormMessage>{error?.message}</FormMessage>
			</FormItem>
		)}
	/>
);
