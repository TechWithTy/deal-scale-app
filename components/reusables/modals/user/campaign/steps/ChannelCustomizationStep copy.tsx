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
interface ChannelCustomizationStepProps {
	onNext: () => void;
	onBack: () => void;
}

const FormSchema = z
	.object({
		primaryPhoneNumber: z.string().refine((val) => val.length === 12, {
			message: "Phone number must be 10 digits after +1.",
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
}) => {
	const {
		primaryChannel,
		areaMode,
		setAreaMode,
		selectedLeadListId,
		setSelectedLeadListId,
		setLeadCount,
	} = useCampaignCreationStore();

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			primaryPhoneNumber: mockUserProfile?.personalNum ?? "",
			areaMode: areaMode || "leadList",
			selectedLeadListId: selectedLeadListId || "",
		},
	});

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

	const onSubmit = (data: z.infer<typeof FormSchema>) => {
		console.log("ChannelCustomizationStep valid:", data);
		// * We call onNext here to advance to the next step in the modal flow.
		onNext();
	};

	if (!primaryChannel) {
		return <div className="text-red-500">Please select a channel first.</div>;
	}

	return (
		<Form form={form}>
			<form
				onSubmit={(e: React.FormEvent) => {
					e.preventDefault();
					form.handleSubmit(onSubmit)(e);
				}}
				className="space-y-6"
			>
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
											field.onChange(selectedValue);
											setSelectedLeadListId(selectedValue);
											setLeadCount(recordCount);
										}}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				)}

				<CampaignNavigation onNext={onNext} onBack={onBack} />
			</form>
		</Form>
	);
};

export default ChannelCustomizationStep;
