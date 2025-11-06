import type React from "react";
import { useFormContext } from "react-hook-form";
import { OAuthSetup } from "./OAuthSetup";
import type { ProfileFormValues } from "@/types/zod/userSetup/profile-form-schema";
import type { InitialOauthSetupData } from "../../../utils/const/connectedAccounts";

interface OAuthMainProps {
	loading: boolean;
	initialData?: InitialOauthSetupData;
}

export const OAuthMain: React.FC<OAuthMainProps> = ({
	loading,
	initialData,
}) => {
	const form = useFormContext<ProfileFormValues>();

	return (
		<div className="w-full">
			<OAuthSetup form={form} loading={loading} initialData={initialData} />
		</div>
	);
};
