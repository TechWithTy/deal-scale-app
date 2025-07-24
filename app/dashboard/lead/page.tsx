import { Breadcrumbs } from "@/components/breadcrumbs";
import PageContainer from "@/components/layout/page-container";
import { LeadClient } from "@/components/tables/lead-tables/client";

const breadcrumbItems = [
	{ title: "Dashboard", link: "/dashboard" },
	{ title: "Leads", link: "/dashboard/lead" },
];
export default function page() {
	return (
		<PageContainer>
			<div className="space-y-2">
				<Breadcrumbs items={breadcrumbItems} />
				<LeadClient />
			</div>
		</PageContainer>
	);
}
