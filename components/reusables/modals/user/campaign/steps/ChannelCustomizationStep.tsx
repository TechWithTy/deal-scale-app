import { mockUserProfile } from "@/constants/_faker/profile/userProfile"; // * Using mock user profile for phone number
import { zodResolver } from "@hookform/resolvers/zod";
import type { FC } from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";
import AreaModeSelector from "./channelCustomization/AreaModeSelector";
import CampaignNavigation from "./channelCustomization/CampaignNavigation";
import LeadListSelector from "./channelCustomization/LeadListSelector";
import PhoneNumberInput from "./channelCustomization/PhoneNumberInput";

// * Step 2: Channel Customization
import type { UseFormReturn } from "react-hook-form";

interface ChannelCustomizationStepProps {
	onNext: () => void;
	onBack: () => void;
	form: UseFormReturn<z.infer<typeof FormSchema>>;
}

export const FormSchema = z
	.object({
		primaryPhoneNumber: z
			.string()
			.transform((val) => {
				let digits = val.replace(/\D/g, "");
				if (digits.startsWith("1")) {
					digits = digits.substring(1);
				}
				return `+1${digits}`;
			})
			.refine((val) => /^\+1\d{10}$/.test(val), {
				message: "Phone number must be 10 digits after the +1 country code.",
			}),
		areaMode: z.enum(["zip", "leadList"], {
			required_error: "You must select an area mode.",
		}),
		selectedLeadListId: z.string().optional(),
	})
	.refine(
		(data) => {
			if (data.areaMode === "leadList") {
				return !!data.selectedLeadListId;
			}
			return true;
		},
		{ message: "Please select a lead list.", path: ["selectedLeadListId"] },
	);

const ChannelCustomizationStep: FC<ChannelCustomizationStepProps> = ({
	onNext,
	onBack,
	form,
}) => {
	const {
		primaryChannel,
		areaMode,
		setAreaMode,
		selectedLeadListId,
		setSelectedLeadListId,
		setLeadCount,
	} = useCampaignCreationStore();

	const watchedAreaMode = form.watch("areaMode");

	useEffect(() => {
		setAreaMode(watchedAreaMode);
	}, [watchedAreaMode, setAreaMode]);

	useEffect(() => {
		if (watchedAreaMode !== "leadList") {
			setLeadCount(0);
			setSelectedLeadListId("");
			// * Reset the form field as well to avoid lingering values
			form.setValue("selectedLeadListId", "");
		}
	}, [watchedAreaMode, setLeadCount, setSelectedLeadListId, form]);

	if (!primaryChannel) {
		return <div className="text-red-500">Please select a channel first.</div>;
	}

	return (
		<Form form={form}>
			<div className="space-y-6">
				<h2 className="font-semibold text-lg">Channel Customization</h2>
				<p className="text-gray-500 text-sm">
					Customize settings for your {primaryChannel} campaign.
				</p>

				<FormField
					control={form.control}
					name="primaryPhoneNumber"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<PhoneNumberInput {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="areaMode"
					render={({ field }) => (
						<FormItem className="space-y-3">
							<FormControl>
								<AreaModeSelector
									onValueChange={field.onChange}
									value={field.value}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{watchedAreaMode === "leadList" && (
					<FormField
						control={form.control}
						name="selectedLeadListId"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<LeadListSelector
										value={field.value || ""}
										onChange={(selectedValue, recordCount) => {
											console.log(
												"Lead list selected:",
												selectedValue,
												"count:",
												recordCount,
											);
											// Update form field first
											field.onChange(selectedValue);
											// Then update store state
											setSelectedLeadListId(selectedValue);
											setLeadCount(recordCount);
											// Trigger validation after a brief delay to ensure state is updated
											setTimeout(() => {
												try {
													form.trigger("selectedLeadListId");
												} catch (error) {
													console.error("Form validation error:", error);
													// Don't let validation errors break the selection
												}
											}, 10);
										}}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				)}

				<CampaignNavigation onBack={onBack} onNext={onNext} />
			</div>
		</Form>
	);
};

export default ChannelCustomizationStep;
export { ChannelCustomizationStep };
