"use client";

import * as React from "react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import CallCampaignsDemoTable from "../../../../external/shadcn-table/src/examples/call-campaigns-demo-table";
import TextCampaignsDemoTable from "../../../../external/shadcn-table/src/examples/text-campaigns-demo-table";
import SocialCampaignsDemoTable from "../../../../external/shadcn-table/src/examples/social-campaigns-demo-table";
import DirectMailCampaignsDemoTable from "../../../../external/shadcn-table/src/examples/direct-mail-campaigns-demo-table";
import { Button } from "@/components/ui/button";
import LeadMainModal from "@/components/reusables/modals/user/lead/LeadModalMain";
import SkipTraceModalMain from "@/components/reusables/modals/user/skipTrace/SkipTraceModalMain";

export default function CampaignCallTablePage() {
	type ParentTab = "calls" | "text" | "social" | "directMail";
	const [tab, setTab] = React.useState<ParentTab>("calls");
	const [isLeadModalOpen, setIsLeadModalOpen] = React.useState(false);
	const [isSkipTraceOpen, setIsSkipTraceOpen] = React.useState(false);
	const [skipTraceInit, setSkipTraceInit] = React.useState<
		{ type: "list"; file?: File } | { type: "single" } | undefined
	>(undefined);
	return (
		<NuqsAdapter>
			<div className="container mx-auto max-w-7xl p-4">
				<div className="mb-2 text-xs text-muted-foreground">Active: {tab}</div>
				<div className="mb-3 flex items-center justify-between gap-3">
					<h2 className="text-xl font-semibold">
						{tab === "calls" && "Page: Calls Demo"}
						{tab === "text" && "Page: Text Demo"}
						{tab === "social" && "Page: Social Demo"}
						{tab === "directMail" && "Page: Direct Mail Demo"}
					</h2>
					<div className="flex items-center gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								setSkipTraceInit({ type: "list" });
								setIsSkipTraceOpen(true);
							}}
						>
							Add Lead List
						</Button>
						<Button type="button" onClick={() => setIsLeadModalOpen(true)}>
							Add Lead
						</Button>
						<Button
							type="button"
							variant="secondary"
							onClick={() => {
								setSkipTraceInit(undefined); // open chooser
								setIsSkipTraceOpen(true);
							}}
						>
							Skip Trace
						</Button>
					</div>
				</div>
				{tab === "calls" && (
					<CallCampaignsDemoTable
						key="calls"
						onNavigate={(next: ParentTab) => setTab(next)}
					/>
				)}
				{tab === "text" && (
					<TextCampaignsDemoTable
						key="text"
						onNavigate={(next: ParentTab) => setTab(next)}
					/>
				)}
				{tab === "social" && (
					<SocialCampaignsDemoTable
						key="social"
						onNavigate={(next: ParentTab) => setTab(next)}
					/>
				)}
				{tab === "directMail" && (
					<DirectMailCampaignsDemoTable
						key="directMail"
						onNavigate={(next: ParentTab) => setTab(next)}
					/>
				)}
				{/* Modals */}
				<LeadMainModal
					isOpen={isLeadModalOpen}
					onClose={() => setIsLeadModalOpen(false)}
				/>
				<SkipTraceModalMain
					isOpen={isSkipTraceOpen}
					onClose={() => setIsSkipTraceOpen(false)}
					initialData={skipTraceInit}
				/>
			</div>
		</NuqsAdapter>
	);
}
