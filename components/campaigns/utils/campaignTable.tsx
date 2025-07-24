import CampaignModalMain from "@/components/reusables/modals/user/campaign/CampaignModalMain";
import { CallCampaignTable } from "@/components/tables/calls-table/call-campaign-table";
import { callCampaignColumns } from "@/components/tables/calls-table/columns";
import { emailCampaignColumns } from "@/components/tables/emails-table/columns";
import { EmailCampaignTable } from "@/components/tables/emails-table/email-campaign-table";
import { socialColumns } from "@/components/tables/socials-table/SocialColumns";
import { SocialMediaCampaignTable } from "@/components/tables/socials-table/SocialMediaCampaignTable";
import { textMessageCampaignColumns } from "@/components/tables/text-table/columns";
import { TextMessageCampaignTable } from "@/components/tables/text-table/text-campaign-table";
import { exportMultipleCampaignsToZip } from "@/lib/_utils/files/arrayTableData";
import { useCampaignStore } from "@/lib/stores/campaigns";
import * as OutReachAnimation from "@/public/lottie/CampaignPing.json";
import type {
	CallCampaign,
	SocialMediaCampaign,
} from "@/types/_dashboard/campaign";
import type { EmailCampaign } from "@/types/goHighLevel/email";
import type { GHLTextMessageCampaign } from "@/types/goHighLevel/text";
import Lottie from "lottie-react";
import { RefreshCw } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const CampaignsMainContent: React.FC = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [lastUpdated, setLastUpdated] = useState(new Date()); // Tracks the last updated time
	const [minutesAgo, setMinutesAgo] = useState(0); // Tracks how many minutes ago the update happened

	const calculateMinutesAgo = () => {
		const now = new Date();
		const diff = Math.floor(
			(now.getTime() - lastUpdated.getTime()) / (1000 * 60),
		); // Difference in minutes
		setMinutesAgo(diff);
	};

	// Zustand store state selectors
	const currentCampaignType = useCampaignStore(
		(state) => state.currentCampaignType,
	);
	const filteredCampaigns = useCampaignStore(
		(state) => state.filteredCampaigns,
	);
	const getNumberOfCampaigns = useCampaignStore(
		(state) => state.getNumberOfCampaigns,
	);

	const openModal = () => setIsModalOpen(true);
	const closeModal = () => setIsModalOpen(false);

	const totalCampaigns = getNumberOfCampaigns(); // Get the total number of filtered campaigns

	// Function to handle export based on the current campaign type and filtered data
	const handleExport = async () => {
		if (!filteredCampaigns || filteredCampaigns.length === 0) {
			toast("No campaigns available for export");
			return;
		}

		let filename = "";
		// Get today's date in dd/mm/yyyy format
		const today = new Date();
		const dd = String(today.getDate()).padStart(2, "0");
		const mm = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
		const yyyy = today.getFullYear();
		const formattedDate = `${dd}_${mm}_${yyyy}`; // Format the date with underscores

		// Update filename based on the campaign type and append the formatted date
		switch (currentCampaignType) {
			case "email":
				filename = `${filteredCampaigns[0].name}_Email_Campaigns_${formattedDate}.xlsx`; // Append the formatted date
				break;
			case "text":
				filename = `${filteredCampaigns[0].name}_Text_Campaigns_${formattedDate}.xlsx`; // Append the formatted date
				break;
			case "social":
				filename = `${filteredCampaigns[0].name}_Social_Campaigns_${formattedDate}.xlsx`; // Append the formatted date
				break;
			case "call":
				filename = `${filteredCampaigns[0].name}_Call_Campaigns_${formattedDate}.xlsx`; // Append the formatted date
				break;
			default:
				toast("Unsupported campaign type");
				return;
		}

		// Call the export function for the current campaign type
		await exportMultipleCampaignsToZip(
			currentCampaignType,
			filteredCampaigns,
			filename,
		);
	};

	const handleRefresh = () => {
		setLastUpdated(new Date()); // Set last updated time to now
		calculateMinutesAgo(); // Immediately calculate how many minutes ago
	};
	// Set up an interval to update the "minutes ago" every minute
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const interval = setInterval(() => {
			calculateMinutesAgo();
		}, 60000); // Every 60 seconds

		// Run the calculation immediately when the component mounts
		calculateMinutesAgo();

		// Clear the interval when the component unmounts
		return () => clearInterval(interval);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [lastUpdated]);

	const renderCampaignTable = () => {
		switch (currentCampaignType) {
			case "email":
				return (
					<EmailCampaignTable
						columns={emailCampaignColumns}
						data={filteredCampaigns as EmailCampaign[]} // Type assertion for EmailCampaign data
						searchKey="name"
						pageCount={Math.ceil(filteredCampaigns.length / 10)}
					/>
				);
			case "call":
				return (
					<CallCampaignTable
						columns={callCampaignColumns}
						data={filteredCampaigns as CallCampaign[]} // Type assertion for CallCampaign data
						searchKey="name"
						pageCount={Math.ceil(filteredCampaigns.length / 10)}
					/>
				);
			case "text":
				return (
					<TextMessageCampaignTable
						columns={textMessageCampaignColumns}
						data={filteredCampaigns as GHLTextMessageCampaign[]} // Type assertion for TextMessageCampaign data
						searchKey="name"
						pageCount={Math.ceil(filteredCampaigns.length / 10)}
					/>
				);
			case "social":
				return (
					<SocialMediaCampaignTable
						columns={socialColumns}
						data={filteredCampaigns as SocialMediaCampaign[]} // Type assertion for SocialMediaCampaign data
						searchKey="name"
						pageCount={Math.ceil(filteredCampaigns.length / 10)}
					/>
				);
			default:
				return null;
		}
	};

	return (
		<div className="h-full w-full rounded-md bg-white dark:bg-gray-900 ">
			{/* Header with Create Campaign button, Last updated, and Export to CSV */}
			<div className="flex flex-col space-y-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
				<button
					type="button"
					onClick={openModal}
					className="w-full rounded-md bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 sm:w-auto"
				>
					<i className="fas fa-rocket mr-2" />
					Create Campaign
				</button>

				<div className="flex flex-col text-gray-500 sm:flex-row sm:items-center sm:space-x-4 dark:text-gray-400">
					<div className="flex items-center justify-between space-x-2">
						<span>
							Updated {minutesAgo} {minutesAgo === 1 ? "minute" : "minutes"} ago
						</span>
						<button
							type="button"
							title="Fetch Updated Campaigns"
							className="rounded-md p-2 hover:bg-gray-100 focus:outline-none dark:hover:bg-gray-700"
							onClick={handleRefresh} // Trigger manual refresh
						>
							<RefreshCw
								size={18}
								className="text-gray-600 dark:text-gray-300"
							/>
						</button>
					</div>

					<button
						type="button"
						onClick={handleExport} // Attach the export handler to the button
						className="mt-4 flex w-full items-center justify-center rounded-md bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-3 font-semibold text-white transition-all duration-300 ease-in-out hover:from-purple-600 hover:to-indigo-600 focus:outline-none focus:ring-4 focus:ring-purple-300 sm:mt-0 dark:from-purple-700 dark:to-indigo-700 dark:focus:ring-indigo-600 dark:hover:from-purple-800 dark:hover:to-indigo-800 "
					>
						<i className="fas fa-file-export mr-2" />
						Export Excel
					</button>
				</div>
			</div>

			{/* Content Area */}
			<div className="flex h-full w-full flex-col items-center justify-center text-center">
				{totalCampaigns === 0 ? (
					<div className="flex h-full w-full flex-col items-center justify-center">
						<div className="mb-4 h-48 w-48">
							<Lottie animationData={OutReachAnimation} loop autoplay />
						</div>

						<h2 className="font-semibold text-gray-700 text-lg dark:text-white">
							Start your first campaign
						</h2>
						<p className="mb-4 text-gray-500 dark:text-gray-400">
							Click the button below to get started with your first campaign.
						</p>

						<button
							onClick={openModal}
							type="button"
							className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
						>
							<i className="fas fa-rocket mr-2" />
							Create Campaign
						</button>
					</div>
				) : (
					renderCampaignTable() // Render the table based on the filtered campaigns
				)}
			</div>

			{/* Modal for multi-step campaign */}
			{isModalOpen && <CampaignModalMain />}
		</div>
	);
};

export default CampaignsMainContent;
export function exportSingleCampaignTypeToZip(
	currentCampaignType: string,
	filteredCampaigns: (
		| CallCampaign
		| EmailCampaign
		| GHLTextMessageCampaign
		| SocialMediaCampaign
	)[],
	filename: string,
) {
	throw new Error("Function not implemented.");
}
