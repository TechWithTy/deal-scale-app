"use client";
import React from "react";
import CampaignHeader from "./utils/campaignHeader";
import CampaignsMainContent from "./utils/campaignTable";

interface CampaignPageProps {
	urlParams?: {
		type?: string | null;
		campaignId?: string | null;
	};
}

const CampaignPage: React.FC<CampaignPageProps> = ({ urlParams }) => {
	return (
		<div className="w-full dark:bg-gray-900">
			{/* ! Ensure the content area doesn't force the layout wider than the sidebar container */}
			<div className="w-full min-w-0">
				{/* Campaign Header with help button */}
				<CampaignHeader />

				{/* Campaign Tables */}
				<div className="w-full min-w-0">
					<CampaignsMainContent urlParams={urlParams} />
				</div>
			</div>
		</div>
	);
};

export default CampaignPage;
