import type { ProfileFormValues } from "@/types/zod/userSetup/profile-form-schema";
import type React from "react";
import type { UseFormReturn } from "react-hook-form";
import { NotificationsSection } from "./NotificationsSection";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { TwoFactorAuthSection } from "./TwoFactorAuthSection";

export interface PersonalInformationFormMainProps {
	form: UseFormReturn<ProfileFormValues>;
	loading: boolean;
}

const PersonalInformationFormMain: React.FC<
	PersonalInformationFormMainProps
> = ({ form, loading }: PersonalInformationFormMainProps) => (
	<>
		<PersonalInfoFields form={form} loading={loading} />
		<NotificationsSection form={form} loading={loading} />
		<TwoFactorAuthSection form={form} loading={loading} />
	</>
);

export { PersonalInformationFormMain };
export default PersonalInformationFormMain;
