/*
 * LeadListTableWithModals
 * Bridges external/shadcn-table LeadsDemoTable with app modals (Lead, Skip Trace)
 */
"use client";

import LeadMainModal from "@/components/reusables/modals/user/lead/LeadModalMain";
import SkipTraceModalMain from "@/components/reusables/modals/user/skipTrace/SkipTraceModalMain";
import { usePublicApiLeadLists } from "@/hooks/usePublicApiLeadLists";
import { useSession } from "next-auth/react";
import LeadsDemoTable, {
	type LeadsDemoTableProps,
} from "external/shadcn-table/src/examples/Lead/LeadsDemoTable";
import * as React from "react";

/** Minimal init payload kept local so external module stays decoupled */
type SkipTraceInit =
	| { type: "list"; file?: File }
	| { type: "single" }
	| undefined;

export default function LeadListTableWithModals(
	props: Omit<
		LeadsDemoTableProps,
		"onOpenLeadModal" | "onOpenSkipTrace" | "renderModals"
	>,
) {
	const { data: session } = useSession();
	const publicApiLeadLists = usePublicApiLeadLists(
		session?.publicApi?.accessToken,
	);
	const [isLeadOpen, setIsLeadOpen] = React.useState(false);
	const [isSkipTraceOpen, setIsSkipTraceOpen] = React.useState(false);
	const [skipTraceInit, setSkipTraceInit] =
		React.useState<SkipTraceInit>(undefined);

	const handleOpenLead = React.useCallback(() => setIsLeadOpen(true), []);
	const handleOpenSkipTrace = React.useCallback((init?: SkipTraceInit) => {
		setSkipTraceInit(init);
		setIsSkipTraceOpen(true);
	}, []);

	return (
		<LeadsDemoTable
			{...props}
			apiRows={publicApiLeadLists.rows}
			apiStatus={publicApiLeadLists.status}
			onOpenLeadModal={handleOpenLead}
			onOpenSkipTrace={handleOpenSkipTrace}
			renderModals={
				<>
					<LeadMainModal
						isOpen={isLeadOpen}
						onClose={() => setIsLeadOpen(false)}
					/>
					<SkipTraceModalMain
						isOpen={isSkipTraceOpen}
						onClose={() => setIsSkipTraceOpen(false)}
						initialData={skipTraceInit}
					/>
				</>
			}
		/>
	);
}
