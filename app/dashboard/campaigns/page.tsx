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
			<div className="space-y-2">
				<Breadcrumbs items={breadcrumbItems} />
				<CampaignPage />
			</div>
		</PageContainer>
	);
}
