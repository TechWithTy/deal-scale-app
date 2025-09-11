import { Breadcrumbs } from "@/components/breadcrumbs";
import PageContainer from "@/components/layout/page-container";
import LeadListTableWithModals from "@/src/components/tables/LeadListTableWithModals";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const breadcrumbItems = [
	{ title: "Dashboard", link: "/dashboard" },
	{ title: "Lead Lists", link: "/dashboard/leadList" },
];
export default function page() {
	return (
		<PageContainer>
			<NuqsAdapter>
				<div className="space-y-2">
					<Breadcrumbs items={breadcrumbItems} />
					<LeadListTableWithModals />
				</div>
			</NuqsAdapter>
		</PageContainer>
	);
}
