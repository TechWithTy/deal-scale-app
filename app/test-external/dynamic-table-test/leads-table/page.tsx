"use client";

import LeadListTableWithModals from "@/components/tables/LeadListTableWithModals";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export default function TestExternalPage() {
	return (
		<NuqsAdapter>
			<LeadListTableWithModals />
		</NuqsAdapter>
	);
}
