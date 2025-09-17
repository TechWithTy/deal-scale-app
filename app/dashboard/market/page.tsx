import { Breadcrumbs } from "@/components/breadcrumbs";
import PageContainer from "@/components/layout/page-container";
import dynamic from "next/dynamic";

const OnOffMarketLeadsClient = dynamic(
	() => import("@/components/leadsMarket/OnOffMarketLeadsClient"),
	{ ssr: false },
);

const breadcrumbItems = [
	{ title: "Dashboard", link: "/dashboard" },
	{ title: "Market Leads", link: "/dashboard/market" },
];

export default function Page() {
	return (
		<PageContainer>
			<div className="space-y-2">
				<Breadcrumbs items={breadcrumbItems} />
				<OnOffMarketLeadsClient />
			</div>
		</PageContainer>
	);
}
