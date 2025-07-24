import { Breadcrumbs } from "@/components/breadcrumbs";
import PageContainer from "@/components/layout/page-container";
import LeadListClient from "@/components/tables/lead-list-tables/client";

const breadcrumbItems = [
	{ title: "Dashboard", link: "/dashboard" },
	{ title: "Lead Lists", link: "/dashboard/leadList" },
];
export default function page() {
	return (
		<PageContainer>
			<div className="space-y-2">
				<Breadcrumbs items={breadcrumbItems} />
				<LeadListClient />
			</div>
		</PageContainer>
	);
}
