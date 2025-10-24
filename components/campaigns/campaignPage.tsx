"use client";
import React from "react";
import CampaignsMainContent from "./utils/campaignTable";

interface CampaignPageProps {
	urlParams?: {
		type?: string | null;
		campaignId?: string | null;
	};
}

const CampaignPage: React.FC<CampaignPageProps> = ({ urlParams }) => {
	// Debug URL parameters
	React.useEffect(() => {
		if (urlParams?.type || urlParams?.campaignId) {
			console.log("🎯 CAMPAIGN PAGE URL PARAMS:", urlParams);
		}
	}, [urlParams]);

	return (
		<div className="w-full dark:bg-gray-900">
			{/* ! Ensure the content area doesn't force the layout wider than the sidebar container */}
			<div className="w-full min-w-0 p-4 sm:p-6 lg:p-8">
				{/* ! Content itself manages overflow; avoid creating a scroll ancestor that breaks sticky */}
				<div className="w-full min-w-0">
					<CampaignsMainContent urlParams={urlParams} />
				</div>
			</div>
		</div>
	);
};

export default CampaignPage;
