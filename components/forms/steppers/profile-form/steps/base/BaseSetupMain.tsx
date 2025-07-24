"use client";
import type { ProfileFormValues } from "@/types/zod/userSetup/profile-form-schema";
import type React from "react";
import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { InitialBaseSetupData } from "../../../utils/const/getBasetProfile";
import { BaseSetupAssets } from "./BaseSetupAssets";
import { BaseSetupFields } from "./BaseSetupFields";
import { BaseSetupLogo } from "./BaseSetupLogo";

export interface BaseSetupMainProps {
	form: UseFormReturn<ProfileFormValues>;
	loading: boolean;
	initialData?: InitialBaseSetupData;
}

export const BaseSetupMain: React.FC<BaseSetupMainProps> = ({
	form,
	loading,
	initialData,
}) => {
	useEffect(() => {
		if (initialData) {
			form.setValue("companyName", initialData.companyName || "");
			form.setValue(
				"companyLogo",
				typeof initialData.companyLogo === "string"
					? undefined
					: initialData.companyLogo,
			);
			form.setValue(
				"outreachEmailAddress",
				initialData.outreachEmailAddress || "",
			);
			form.setValue(
				"leadForwardingNumber",
				initialData.leadForwardingNumber || "",
			);
			form.setValue(
				"companyExplainerVideoUrl",
				initialData.companyExplainerVideoUrl || "",
			);
			form.setValue(
				"companyAssets",
				Array.isArray(initialData.companyAssets)
					? initialData.companyAssets.filter((asset) => asset instanceof File)
					: [],
			);
		}
	}, [initialData, form]);

	return (
		<>
			<BaseSetupFields form={form} loading={loading} />
			<BaseSetupLogo form={form} loading={loading} />
			<BaseSetupAssets form={form} loading={loading} />
		</>
	);
};
