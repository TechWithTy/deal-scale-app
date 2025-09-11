"use client";
import type React from "react";
import CampaignsMainContent from "./utils/campaignTable";

const CampaignPage: React.FC = () => {
	return (
		<div className="w-full dark:bg-gray-900">
			{/* ! Ensure the content area doesn't force the layout wider than the sidebar container */}
			<div className="w-full min-w-0 p-4 sm:p-6 lg:p-8">
				{/* ! Content itself manages overflow; avoid creating a scroll ancestor that breaks sticky */}
				<div className="w-full min-w-0">
					<CampaignsMainContent />
				</div>
			</div>
		</div>
	);
};

export default CampaignPage;
