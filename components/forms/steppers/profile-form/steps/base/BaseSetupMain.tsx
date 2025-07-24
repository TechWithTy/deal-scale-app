"use client";
import type { ProfileFormValues } from "@/types/zod/userSetup/profile-form-schema";
import type React from "react";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import type { InitialBaseSetupData } from "../../../utils/const/getBasetProfile";
import { BaseSetupAssets } from "./BaseSetupAssets";
import { BaseSetupFields } from "./BaseSetupFields";
import { v4 as uuidv4 } from "uuid";

export interface BaseSetupMainProps {
	loading: boolean;
	initialData?: InitialBaseSetupData;
}

export const BaseSetupMain: React.FC<BaseSetupMainProps> = ({
	loading,
	initialData,
}) => {
	const form = useFormContext<ProfileFormValues>();

	useEffect(() => {
		if (initialData) {
			form.setValue("companyName", initialData.companyName || "");
			form.setValue(
				"companyLogo",
				typeof initialData.companyLogo === "string"
					? undefined
					: initialData.companyLogo,
			);
			// form.setValue(
			// 	"outreachEmailAddress",
			// 	initialData.outreachEmailAddress || "",
			// );
			form.setValue(
				"leadForwardingNumber",
				initialData.leadForwardingNumber || "",
			);
			form.setValue(
				"companyExplainerVideoUrl",
				initialData.companyExplainerVideoUrl || "",
			);
			// Convert initial assets to AssetItem[]
			form.setValue(
				"companyAssets",
				Array.isArray(initialData.companyAssets)
					? initialData.companyAssets
							.filter((asset) => asset instanceof File)
							.map((file) => ({ id: uuidv4(), file }))
					: [],
			);
		}
	}, [initialData, form]);

	return (
		<form className="space-y-10">
			<section className="space-y-4">
				<h2 className="mb-2 font-bold text-xl">Company Information</h2>
				<p className="mb-4 text-gray-500 text-sm">
					Enter your company details to get started.
				</p>
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					<BaseSetupFields loading={loading} />
				</div>
			</section>

			<div className="my-8 border-gray-200 border-t dark:border-gray-700" />

			<section className="space-y-4">
				<h2 className="mb-2 font-bold text-xl">Branding Assets</h2>
				<p className="mb-4 text-gray-500 text-sm">
					Upload your logo and company assets. Images should be clear and
					professional.
				</p>
				<BaseSetupAssets loading={loading} />
			</section>

			<div className="my-8 border-gray-200 border-t dark:border-gray-700" />
		</form>
	);
};
