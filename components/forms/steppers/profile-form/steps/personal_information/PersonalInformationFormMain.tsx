import type { ProfileFormValues } from "@/types/zod/userSetup/profile-form-schema";
import type React from "react";
import type { UseFormReturn } from "react-hook-form";
import { useFormContext } from "react-hook-form";
import { NotificationsSection } from "./NotificationsSection";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { TwoFactorAuthSection } from "./TwoFactorAuthSection";

export interface PersonalInformationFormMainProps {
	loading: boolean;
}

const PersonalInformationFormMain: React.FC<
	PersonalInformationFormMainProps
> = ({ loading }: PersonalInformationFormMainProps) => {
	const form = useFormContext<ProfileFormValues>();

	return (
		<>
			<PersonalInfoFields loading={loading} />
			<NotificationsSection loading={loading} />
			<TwoFactorAuthSection loading={loading} />
		</>
	);
};

export { PersonalInformationFormMain };
export default PersonalInformationFormMain;
