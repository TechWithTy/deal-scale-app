"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import LeadListTableWithModals from "@/components/tables/LeadListTableWithModals";

export default function TestExternalPage() {
	return (
		<NuqsAdapter>
			<LeadListTableWithModals />
		</NuqsAdapter>
	);
}
