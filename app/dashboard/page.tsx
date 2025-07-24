"use client";

import PageContainer from "@/components/layout/page-container";
import PropertySearch from "@/components/leadsSearch/PropertySearch";
export default function Page() {
	return (
		<PageContainer scrollable={true}>
			<PropertySearch />
		</PageContainer>
	);
}
