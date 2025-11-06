"use client";

import { Breadcrumbs } from "@/components/breadcrumbs";
import CampaignPage from "@/components/campaigns/campaignPage";
import PageContainer from "@/components/layout/page-container";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

const breadcrumbItems = [
	{ title: "Dashboard", link: "/dashboard" },
	{ title: "Campaigns", link: "/dashboard/campaigns" },
];

export default function page() {
	const searchParams = useSearchParams();

	// Handle URL parameters for direct navigation to specific campaign type
	const typeParam = searchParams.get("type");
	const campaignIdParam = searchParams.get("campaignId");

	return (
		<PageContainer>
			<div className="w-full min-w-0 space-y-2">
				<Breadcrumbs items={breadcrumbItems} />
				{/* ! Keep inner content from forcing layout width */}
				<div className="w-full min-w-0">
					<CampaignPage
						urlParams={{
							type: typeParam,
							campaignId: campaignIdParam,
						}}
					/>
				</div>
			</div>
		</PageContainer>
	);
}
