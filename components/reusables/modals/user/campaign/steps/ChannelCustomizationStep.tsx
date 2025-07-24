import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLeadListStore } from "@/lib/stores/leadList";
import { mockUserProfile } from "@/constants/_faker/profile/userProfile"; // * Using mock user profile for phone number
import type { FC } from "react";
import { useState } from "react";
import {
	Select,
	SelectTrigger,
	SelectContent,
	SelectItem,
	SelectValue,
	SelectGroup,
} from "@/components/ui/select";

// * Step 2: Channel Customization
interface ChannelCustomizationStepProps {
	onNext: () => void;
	onBack: () => void;
}

import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";

const ChannelCustomizationStep: FC<ChannelCustomizationStepProps> = ({
	onNext,
	onBack,
}) => {
	const { primaryChannel } = useCampaignCreationStore();

	if (!primaryChannel) {
		return <div className="text-red-500">Please select a channel first.</div>;
	}
	const {
		areaMode,
		setAreaMode,
		selectedLeadListId,
		setSelectedLeadListId,
		campaignArea,
		setCampaignArea,
		setLeadCount, // ! Add leadCount setter from Zustand
	} = useCampaignCreationStore();
	// Local state for zip input to prevent saving invalid zip
	const [localZip, setLocalZip] = useState<string>(campaignArea);

	// * Default to mock user's phone number for 'call' channel
	const hasMockPhone = Boolean(mockUserProfile.personalNum);
	const [inputPhoneNumber, setInputPhoneNumber] = useState<string>(
		hasMockPhone ? mockUserProfile.personalNum : "",
	);
	const [phoneError, setPhoneError] = useState<string>("");
	const [areaError, setAreaError] = useState<string>("");
	const [leadListError, setLeadListError] = useState<string>("");
	const leadLists = useLeadListStore((state) => state.leadLists);

	// ! Helper to update leadCount in Zustand when a lead list is selected
	const handleLeadListSelect = (leadListId: string) => {
		setSelectedLeadListId(leadListId);
		if (!leadListId) {
			setLeadListError("Please select a lead list.");
			setLeadCount(0);
			return;
		}
		const selected = leadLists.find(
			(list) => String(list.id) === String(leadListId),
		);
		if (selected) {
			setLeadCount(selected.records || 0);
		} else {
			setLeadCount(0);
		}
		setLeadListError("");
	};
	const [textMessage, setTextMessage] = useState<string>("");
	const [textMessageError, setTextMessageError] = useState<string>("");

	// Only allow +1 and 10 digits after
	const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let value = e.target.value;
		if (!value.startsWith("+1")) {
			value = `+1${value.replace(/[^\d]/g, "")}`;
		} else {
			value = value.replace(/[^\d]/g, "");
			// biome-ignore lint/style/useTemplate: <explanation>
			value = "+1" + value.slice(1);
		}
		if (value.length > 12) value = value.slice(0, 12);
		setInputPhoneNumber(value);

		if (value.length !== 12) {
			setPhoneError("Phone number must be 10 digits after +1.");
		} else {
			setPhoneError("");
		}
	};

	const handleTextMessageChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const value = e.target.value;
		setTextMessage(value);
		if (value.trim().length === 0) {
			setTextMessageError("Message cannot be empty.");
		} else if (value.length > 300) {
			setTextMessageError("Message cannot exceed 300 characters.");
		} else {
			setTextMessageError("");
		}
	};

	const handleAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let value = e.target.value.replace(/[^0-9]/g, ""); // Only numbers
		if (value.length > 5) value = value.slice(0, 5); // Max 5 chars
		setLocalZip(value);
		if (!value.trim()) {
			setAreaError("Campaign area is required.");
			setCampaignArea(""); // Clear parent state if empty
			return;
		}
		// Only allow exactly 5 digits
		const zipRegex = /^\d{5}$/;
		if (zipRegex.test(value)) {
			setAreaError("");
			setCampaignArea(value); // Only save if valid
		} else {
			setAreaError("Enter a valid 5-digit US zip code.");
			setCampaignArea(""); // Clear parent state if invalid
		}
	};

	const handleLeadListChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		handleLeadListSelect(e.target.value);
	}; // ! Use shared logic for native select

	// If phone is from profile (disabled), always valid; otherwise, validate
	const isPhoneValid = hasMockPhone || /^\d{10,12}$/.test(inputPhoneNumber);
	const isZipValid = campaignArea.trim().length > 0 && areaError === "";
	const isLeadListValid = selectedLeadListId !== "";
	const isAreaSelectionValid =
		areaMode === "zip" ? isZipValid : isLeadListValid;
	const isTextValid =
		isPhoneValid && textMessage.trim().length > 0 && textMessage.length <= 300;

	return (
		<div>
			<h2 className="mb-4 font-semibold text-lg">
				Customize Channel:{" "}
				{primaryChannel.charAt(0).toUpperCase() + primaryChannel.slice(1)}
			</h2>
			{primaryChannel === "call" && (
				<div className="mb-4">
					<label htmlFor="callPhone" className="mb-1 block text-sm">
						Primary Phone Number
					</label>
					<Input
						id="callPhone"
						value={inputPhoneNumber}
						onChange={handlePhoneNumberChange}
						placeholder="Enter phone number"
						className="mb-2 w-full"
						type="text"
						maxLength={12}
						disabled={hasMockPhone}
					/>
					{!hasMockPhone && (
						<p className="mt-1 text-gray-500 text-xs">
							Update your phone number on your profile.
						</p>
					)}
					{phoneError && <p className="text-red-500 text-xs">{phoneError}</p>}
				</div>
			)}

			{/* Area Type Selection */}
			<div className="mb-4">
				{/* <label htmlFor="areaMode" className="mb-1 block font-medium text-sm">
					Choose Area Type
				</label> */}
				<div className="mb-2 flex gap-4">
					<label className="flex items-center gap-2">
						<input
							type="radio"
							checked={areaMode === "leadList"}
							onChange={() => {
								setAreaMode("leadList");
								setCampaignArea("");
								setAreaError("");
							}}
							className="mr-2"
						/>
						<span>Lead List</span>
					</label>
					{/* <label className="flex items-center gap-2">
						<input
							type="radio"
							checked={areaMode === "zip"}
							onChange={() => {
								setAreaMode("zip");
								setSelectedLeadListId("");
							}}
							className="mr-2"
						/>
						<span>US Zip Code</span>
					</label> */}
				</div>

				{/* Lead List Dropdown */}
				{areaMode === "leadList" && (
					<div>
						<label htmlFor="leadListSelect" className="mb-1 block text-sm">
							Select Lead List
						</label>
						<Select
							value={selectedLeadListId}
							onValueChange={handleLeadListSelect}
							defaultValue=""
						>
							<SelectTrigger className="w-full truncate">
								<SelectValue placeholder="-- Select a lead list --" />
							</SelectTrigger>
							<SelectContent
								className="z-50 max-h-64 w-full overflow-y-auto rounded-md border bg-white py-1 shadow-lg focus:outline-none"
								style={{ pointerEvents: "auto" }} // * Ensures scrollbar is draggable (Radix Select/modal bug workaround)
							>
								<SelectGroup>
									<SelectItem
										value=""
										disabled
										className="px-3 py-2 text-gray-400"
									>
										-- Select a lead list --
									</SelectItem>
									{leadLists && leadLists.length > 0 ? (
										leadLists.map((list) => (
											<SelectItem key={list.id} value={String(list.id)}>
												<span className="block w-full overflow-hidden truncate text-ellipsis whitespace-nowrap">
													{list.listName}
												</span>
											</SelectItem>
										))
									) : (
										<SelectItem value="None">
											No Lead Lists Available
										</SelectItem>
									)}
								</SelectGroup>
							</SelectContent>
						</Select>
						{leadListError && (
							<p className="text-red-500 text-xs">{leadListError}</p>
						)}
					</div>
				)}

				{/* Zip Code Input */}
				{/* {areaMode === "zip" && (
					<div>
						<label htmlFor="campaignAreaCall" className="mb-1 block text-sm">
							Campaign Area (US Zip Code)
						</label>
						<Input
							id="campaignAreaCall"
							value={localZip}
							onChange={handleAreaChange}
							placeholder="Enter 5-digit zip code"
							className="mb-2 w-full"
							type="text"
							maxLength={5}
							inputMode="numeric"
							pattern="[0-9]{5}"
						/>
						{areaError && <p className="text-red-500 text-xs">{areaError}</p>}
					</div>
				)} */}
			</div>

			{/* Navigation */}
			<div className="mt-8 flex justify-between gap-2">
				<Button onClick={onBack} variant="ghost" type="button">
					Back
				</Button>
				<Button
					onClick={onNext}
					type="button"
					disabled={!isPhoneValid || !isAreaSelectionValid}
				>
					Next
				</Button>
			</div>
		</div>
	);
};

export default ChannelCustomizationStep;
