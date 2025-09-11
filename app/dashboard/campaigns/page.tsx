import { Breadcrumbs } from "@/components/breadcrumbs";
import CampaignPage from "@/components/campaigns/campaignPage";
import PageContainer from "@/components/layout/page-container";

const breadcrumbItems = [
	{ title: "Dashboard", link: "/dashboard" },
	{ title: "Campaigns", link: "/dashboard/campaigns" },
];
export default function page() {
	return (
		<PageContainer>
			<div className="w-full min-w-0 space-y-2">
				<Breadcrumbs items={breadcrumbItems} />
				{/* ! Keep inner content from forcing layout width */}
				<div className="w-full min-w-0">
					<CampaignPage />
				</div>
			</div>
		</PageContainer>
	);
}
