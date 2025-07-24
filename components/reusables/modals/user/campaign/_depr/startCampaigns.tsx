import { Button } from "@/components/ui/button"; // ShadCN Button
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input"; // ShadCN Input
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"; // ShadCN Select
import { Textarea } from "@/components/ui/textarea";
import {
	Dialog,
	DialogContent,
	DialogOverlay,
	DialogPortal,
} from "@radix-ui/react-dialog"; // Radix UI Dialog components
import { format } from "date-fns";
import { X } from "lucide-react"; // Close Icon
import type React from "react";
import { useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
const socialMediaPlatforms = ["twitter", "instagram", "linkedin"];
const allChannels = ["phone", "email", "twitter", "instagram", "linkedin"];

interface ChannelSelectionModalProps {
	closeModal: () => void;
	handleNext: () => void;
	primaryChannel: string;
	setPrimaryChannel: (channel: string) => void;
}

// Step 1 Modal: Channel Selection
const ChannelSelectionModal: React.FC<ChannelSelectionModalProps> = ({
	closeModal,
	handleNext,
	primaryChannel,
	setPrimaryChannel,
}) => {
	// const isSocialMedia = (channel: string) =>
	//   socialMediaPlatforms.includes(channel);

	// Validate that a primary channel is selected
	const validateChannel = () => {
		if (!primaryChannel) {
			return false; // Ensure a primary channel is selected
		}
		return true;
	};

	const handleNextStep = () => {
		if (validateChannel()) {
			handleNext();
		} else {
			toast("Please select a primary channel.");
		}
	};

	return (
		<div>
			<h2 className="mb-4 text-center font-semibold text-lg dark:text-white">
				Select Communication Channel
			</h2>
			<p className="mb-4 text-center text-gray-500 dark:text-gray-400">
				Choose a primary communication channel
			</p>

			{/* Primary Channel Select */}
			<label className="mb-2 block font-semibold text-sm dark:text-gray-200">
				Primary Channel
			</label>
			<Select onValueChange={setPrimaryChannel}>
				<SelectTrigger className="mb-4 w-full rounded-md bg-white p-2 text-black dark:bg-gray-800 dark:text-white">
					<SelectValue placeholder="Choose a primary channel" />
				</SelectTrigger>
				<SelectContent>
					{allChannels.map((channel) => (
						<SelectItem
							className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
							key={channel}
							value={channel}
						>
							{channel.charAt(0).toUpperCase() + channel.slice(1)}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			{/* Button to proceed to the next step */}
			<Button
				onClick={handleNextStep}
				disabled={!primaryChannel}
				className={`mt-4 w-full ${
					!primaryChannel
						? "cursor-not-allowed bg-gray-600"
						: "bg-blue-600 text-white hover:bg-blue-700"
				}`}
			>
				Next
			</Button>
		</div>
	);
};
interface ChannelCustomizationModalProps {
	primaryChannel: string;
	handleNext: () => void;
	handleBack: () => void;
	phoneNumber?: string | null; // Optional prop for phone number
	email?: string | null; // Optional prop for email
	socialAccounts?: string[]; // List of connected social media accounts
	onConnectAccount?: (platform: string) => void; // Function to connect a new account
}

// Mapping of actions based on the platform type
const platformActions: { [key: string]: string[] } = {
	instagram: ["Comment", "Like", "👁️ Story", "Follow"],
	linkedin: [
		"📩 Connections",
		"Comment",
		"Follow",
		"Like",
		"📩 Groups",
		"Invite to follow",
	],
	twitter: ["📩 Followers", "Follow", "Like"],
};

const ChannelCustomizationModal: React.FC<ChannelCustomizationModalProps> = ({
	primaryChannel,
	handleNext,
	handleBack,
	phoneNumber = null,
	email = null,
	socialAccounts = [],
	onConnectAccount,
}) => {
	const [inputPhoneNumber, setInputPhoneNumber] = useState<string>(
		phoneNumber || "",
	);
	const [inputEmail, setInputEmail] = useState<string>(email || "");
	const [selectedPrimaryAccount, setSelectedPrimaryAccount] =
		useState<string>("");
	const [selectedActions, setSelectedActions] = useState<string[]>([]);
	const [isNextEnabled, setIsNextEnabled] = useState<boolean>(false);
	const [connectedAccounts, setConnectedAccounts] =
		useState<string[]>(socialAccounts); // Manage connected accounts

	// Phone number input restriction to exactly 11 characters (with '+1' country code)
	const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let value = e.target.value;

		if (!value.startsWith("+1")) {
			value = "+1" + value.replace(/[^\d]/g, ""); // Remove non-digits and prepend '+1'
		} else {
			value = value.replace(/[^\d]/g, ""); // Remove non-digit characters
			value = "+1" + value.slice(1); // Ensure it keeps the '+1' prefix and allows digits after it
		}

		if (value.length > 12) {
			value = value.slice(0, 12);
		}

		setInputPhoneNumber(value);
	};

	// Email validation
	const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setInputEmail(value);
	};

	// Basic email validation
	const isEmailValid = (email: string) => {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	};

	// Handle checkbox change for social media actions
	const handleActionChange = (action: string) => {
		setSelectedActions((prev) =>
			prev.includes(action)
				? prev.filter((a) => a !== action)
				: [...prev, action],
		);
	};

	// Enable or disable the "Next" button based on fields
	useEffect(() => {
		const isPrimaryValid =
			primaryChannel === "phone"
				? inputPhoneNumber.length === 12
				: primaryChannel === "email"
					? isEmailValid(inputEmail)
					: selectedPrimaryAccount.length > 0 && selectedActions.length > 0;

		setIsNextEnabled(isPrimaryValid);
	}, [
		primaryChannel,
		inputPhoneNumber,
		inputEmail,
		selectedPrimaryAccount,
		selectedActions,
	]);

	// Detect when a new account is connected and update the state
	useEffect(() => {
		if (connectedAccounts.length > 0) {
			setIsNextEnabled(true); // Enable "Next" button if any account is connected
		}
	}, [connectedAccounts]);

	// Render customization options based on the channel type
	const renderCustomization = (channel: string) => {
		const actions = platformActions[channel.toLowerCase()] || [];

		if (channel === "phone") {
			return (
				<>
					<label className="mb-1 block text-sm dark:text-white">
						Primary Phone Number
					</label>
					<Input
						value={inputPhoneNumber}
						onChange={handlePhoneNumberChange}
						placeholder="Enter phone number"
						className="mb-4 w-full"
						type="text"
						maxLength={12} // Ensure maximum length of 12 characters
					/>
				</>
			);
		}

		if (channel === "email") {
			return (
				<>
					<label className="mb-1 block text-sm dark:text-white">
						Primary Email Address
					</label>
					<Input
						value={inputEmail}
						onChange={handleEmailChange}
						placeholder="Enter your email"
						className="mb-4 w-full"
						type="email"
					/>
					{!isEmailValid(inputEmail) && inputEmail && (
						<p className="text-red-500">Please enter a valid email address.</p>
					)}
				</>
			);
		}

		return (
			<>
				<label className="mb-1 block text-sm dark:text-white">
					Primary {channel.charAt(0).toUpperCase() + channel.slice(1)} Account
				</label>
				{connectedAccounts.length > 0 ? (
					<div>
						{/* Automatically display the connected account without requiring selection */}
						<Input
							value={selectedPrimaryAccount}
							readOnly
							className="mb-4 w-full rounded-md bg-gray-800 p-2 text-white"
						/>
					</div>
				) : (
					<Button
						onClick={() => {
							// const mockAccount = 'connected-account';
							const shown_account = channel.toUpperCase();

							if (onConnectAccount) {
								onConnectAccount(channel);
								setConnectedAccounts((prev) => [...prev, shown_account]);
								setSelectedPrimaryAccount(shown_account);
							} else {
								setConnectedAccounts((prev) => [...prev, shown_account]);
								setSelectedPrimaryAccount(shown_account);
							}
						}}
						className="mb-4 w-full bg-blue-600 text-white hover:bg-blue-700"
					>
						Connect {channel.charAt(0).toUpperCase() + channel.slice(1)} Account
					</Button>
				)}

				{/* Show actions only when an account is connected */}
				{connectedAccounts.length > 0 && actions.length > 0 && (
					<div className="mt-4 flex justify-between space-x-2">
						{actions.map((action) => (
							<label key={action} className="flex items-center space-x-1">
								<input
									type="checkbox"
									checked={selectedActions.includes(action)}
									onChange={() => handleActionChange(action)}
									className="form-checkbox"
								/>
								<span className="text-white">{action}</span>
							</label>
						))}
					</div>
				)}
			</>
		);
	};

	return (
		<div>
			<h2 className="mb-4 font-semibold text-lg dark:text-white">
				Customize your Channel
			</h2>

			{/* Primary Channel Customization */}
			<div className="mb-6">
				<h3 className="font-semibold text-md dark:text-white">
					Primary Channel
				</h3>
				{renderCustomization(primaryChannel)}
			</div>

			{/* Next and Back Buttons */}
			<Button
				onClick={handleNext}
				className="mt-4 w-full"
				disabled={!isNextEnabled}
			>
				Next
			</Button>
			<Button onClick={handleBack} className="mt-2 w-full">
				Back
			</Button>
		</div>
	);
};

// Define types for the props

// Step 3 Modal: Finalize Campaign
interface FinalizeCampaignModalProps {
	campaignName: string;
	setCampaignName: (name: string) => void;
	startDate: string;
	setStartDate: (date: string) => void;
	endDate: string;
	setEndDate: (date: string) => void;
	handleLaunch: () => void;
	handleBack: () => void;
	estimatedCredits: number; // Estimated credits for the campaign
}

const FinalizeCampaignModal: React.FC<FinalizeCampaignModalProps> = ({
	campaignName,
	setCampaignName,
	startDate,
	setStartDate,
	endDate,
	setEndDate,
	handleLaunch,
	handleBack,
	estimatedCredits,
}) => {
	const [campaignGoal, setCampaignGoal] = useState(""); // State for campaign goal
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [goalError, setGoalError] = useState<string | null>(null); // Error for campaign goal
	const [dateError, setDateError] = useState<string | null>(null); // Error for date validation

	const [dateRange, setDateRange] = useState<DateRange | undefined>({
		from: startDate ? new Date(startDate) : undefined,
		to: endDate ? new Date(endDate) : undefined,
	});

	// Handle input change for the campaign name
	const handleCampaignNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const name = e.target.value;
		setCampaignName(name);

		if (name.length > 0) {
			if (
				name.length < 5 ||
				name.length > 30 ||
				!/^[A-Za-z0-9. ]+$/.test(name)
			) {
				setErrorMessage(
					"Campaign name must be between 5-30 characters and can only contain letters, numbers, spaces, and dots.",
				);
			} else {
				setErrorMessage(null);
			}
		} else {
			setErrorMessage(null); // Reset error if input is cleared
		}
	};

	// Validate campaign goal: 1 sentence minimum (10 characters with at least one period) and max 300 characters
	const handleCampaignGoalChange = (
		e: React.ChangeEvent<HTMLTextAreaElement>,
	) => {
		const goal = e.target.value;
		setCampaignGoal(goal);

		if (goal.length < 10 || !goal.includes(".")) {
			setGoalError("Campaign goal must be at least one sentence.");
		} else if (goal.length > 300) {
			setGoalError(
				"Campaign goal cannot exceed two paragraphs (~300 characters).",
			);
		} else {
			setGoalError(null); // Clear error if valid
		}
	};

	// Handle the date selection from the calendar
	const handleDateSelection = (range: DateRange | undefined) => {
		setDateRange(range);

		if (range?.from) {
			setStartDate(format(range.from, "yyyy-MM-dd"));
		}
		if (range?.to) {
			setEndDate(format(range.to, "yyyy-MM-dd"));
		} else {
			setEndDate(""); // Clear end date if not selected
		}

		if (range?.from && range?.to && range.from > range.to) {
			setDateError("The end date cannot be before the start date.");
		} else {
			setDateError(null);
		}
	};

	// Check if both campaign name, goal, and valid date range are selected to enable the button
	const isNextEnabled =
		campaignName.length >= 5 &&
		!errorMessage &&
		!goalError &&
		!dateError &&
		startDate &&
		endDate &&
		campaignGoal.length > 0;

	return (
		<div className="mx-auto max-w-lg">
			{" "}
			{/* Ensure content does not overflow */}
			<h2 className="mb-4 font-semibold text-lg dark:text-white">
				Finalize your campaign
			</h2>
			{/* Campaign Name Input */}
			<label className="mb-1 block text-sm dark:text-white">
				Campaign Name
			</label>
			<Input
				value={campaignName}
				onChange={handleCampaignNameChange}
				placeholder="Enter campaign name"
				className="mb-4 w-full"
				maxLength={30}
			/>
			{errorMessage && <p className="text-red-500">{errorMessage}</p>}
			{/* Campaign Goal Textarea */}
			<label className="mb-1 block text-sm dark:text-white">
				Campaign Goal
			</label>
			<Textarea
				value={campaignGoal}
				onChange={handleCampaignGoalChange}
				placeholder="Enter your campaign goal (1 sentence min, 1-2 paragraphs max)"
				className="mb-4 w-full"
				rows={4}
				maxLength={300} // Limit to 300 characters
			/>
			{goalError && <p className="text-red-500">{goalError}</p>}
			{/* Inline Calendar for Date Range Selection */}
			<label className="mb-1 block text-center font-bold text-sm dark:text-white">
				Select Start Date And End Date
			</label>
			<div className="mb-4 w-full max-w-lg overflow-auto">
				<Calendar
					mode="range"
					selected={dateRange}
					onSelect={handleDateSelection}
					numberOfMonths={2} // Keep 2 months visible
				/>
			</div>
			{dateError && <p className="text-red-500">{dateError}</p>}
			<p className="mb-4 text-gray-500 text-sm dark:text-gray-400">
				This campaign will cost {estimatedCredits} credits.
			</p>
			{/* Only show Launch button if campaign name, goal, and date range are valid */}
			<Button
				onClick={handleLaunch}
				className="w-full"
				type="button"
				disabled={!isNextEnabled}
			>
				Launch Campaign
			</Button>
			<Button onClick={handleBack} className="mt-2 w-full" type="button">
				Back
			</Button>
		</div>
	);
};

// Main Component
const MultiStepCampaign: React.FC<{ closeModal: () => void }> = ({
	closeModal,
}) => {
	const [step, setStep] = useState(1);
	const [primaryChannel, setPrimaryChannel] = useState<string>("");
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [secondaryChannel, setSecondaryChannel] = useState<string>("");
	const [campaignName, setCampaignName] = useState<string>("");
	const [startDate, setStartDate] = useState<string>("");
	const [endDate, setEndDate] = useState<string>("");

	const estimatedCredits = 500;
	const isSocialMedia = (channel: string) =>
		socialMediaPlatforms.includes(channel);

	const handleNext = () => {
		if (isSocialMedia(primaryChannel) && isSocialMedia(secondaryChannel)) {
			toast(
				"Primary and secondary channels cannot both be social media platforms.",
			);
			return;
		}
		setStep(step + 1);
	};

	const handleBack = () => setStep(step - 1);
	const handleLaunch = () => {
		toast(`Campaign "${campaignName}" launched!`);
		closeModal();
	};

	return (
		<Dialog open onOpenChange={closeModal}>
			<DialogPortal>
				<DialogOverlay className="fixed inset-0 z-40 bg-black bg-opacity-50" />
				<DialogContent className="fixed inset-0 z-50 flex items-center justify-center">
					<div className="relative w-full max-w-md rounded-md bg-white p-6 shadow-lg dark:bg-gray-900">
						<button onClick={closeModal} className="absolute top-4 right-4">
							<X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
						</button>

						{step === 1 && (
							<ChannelSelectionModal
								closeModal={closeModal}
								handleNext={handleNext}
								primaryChannel={primaryChannel}
								setPrimaryChannel={setPrimaryChannel}
							/>
						)}

						{step === 2 && (
							<ChannelCustomizationModal
								primaryChannel={primaryChannel || ""} // Default to empty string if null
								handleNext={handleNext}
								handleBack={handleBack}
							/>
						)}

						{step === 3 && (
							<FinalizeCampaignModal
								campaignName={campaignName}
								setCampaignName={setCampaignName}
								startDate={startDate}
								setStartDate={setStartDate}
								endDate={endDate} // Add this missing prop
								setEndDate={setEndDate} // Add this missing prop
								handleLaunch={handleLaunch}
								handleBack={handleBack}
								estimatedCredits={estimatedCredits} // Add this missing prop
							/>
						)}
					</div>
				</DialogContent>
			</DialogPortal>
		</Dialog>
	);
};

export default MultiStepCampaign;
