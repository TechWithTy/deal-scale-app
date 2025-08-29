"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import LeadsDemoTable from "../../../../external/shadcn-table/src/examples/leads-demo-table";

export default function TestExternalPage() {
	return (
		<NuqsAdapter>
			<LeadsDemoTable />
		</NuqsAdapter>
	);
}
