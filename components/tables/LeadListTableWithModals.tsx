/*
 * LeadListTableWithModals (app wrapper)
 * Bridges external/shadcn-table LeadsDemoTable with app modals (Lead, Skip Trace)
 */
"use client";

import * as React from "react";
import LeadsDemoTable, {
	type LeadsDemoTableProps,
} from "@/external/shadcn-table/src/examples/Lead/LeadsDemoTable";
import LeadMainModal from "@/components/reusables/modals/user/lead/LeadModalMain";
import SkipTraceModalMain from "@/components/reusables/modals/user/skipTrace/SkipTraceModalMain";
import SkipTraceDialog from "@/components/maps/properties/utils/createListModal";
import { useModalStore } from "@/lib/stores/leadSearch/leadListStore";

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
	const [isLeadOpen, setIsLeadOpen] = React.useState(false);
	const [leadInitialMode, setLeadInitialMode] = React.useState<
		"select" | "create"
	>("create");
	const [isSkipTraceOpen, setIsSkipTraceOpen] = React.useState(false);
	const [skipTraceInit, setSkipTraceInit] =
		React.useState<SkipTraceInit>(undefined);

	const handleOpenLead = React.useCallback(
		(opts?: { initialListMode?: "select" | "create" }) => {
			setLeadInitialMode(opts?.initialListMode ?? "create");
			setIsLeadOpen(true);
		},
		[],
	);
	const handleOpenSkipTrace = React.useCallback((init?: SkipTraceInit) => {
		setSkipTraceInit(init);
		setIsSkipTraceOpen(true);
	}, []);

	// Open the app's Create List modal that lives on the global modal store
	const handleOpenCreateList = React.useCallback(() => {
		// Provide minimal props; real data can be injected by the page/store
		useModalStore.getState().openModal?.("skipTrace", {
			properties: [],
			availableListNames: [],
			costPerRecord: 0,
		});
	}, []);

	return (
		<LeadsDemoTable
			{...props}
			onOpenLeadModal={handleOpenLead}
			onOpenSkipTrace={handleOpenSkipTrace}
			onOpenCreateList={handleOpenCreateList}
			renderModals={
				<>
					<LeadMainModal
						isOpen={isLeadOpen}
						onClose={() => setIsLeadOpen(false)}
						initialListMode={leadInitialMode}
					/>
					<SkipTraceModalMain
						isOpen={isSkipTraceOpen}
						onClose={() => setIsSkipTraceOpen(false)}
						initialData={skipTraceInit}
					/>
					{/* Always mounted; opens via useModalStore */}
					<SkipTraceDialog />
				</>
			}
		/>
	);
}
