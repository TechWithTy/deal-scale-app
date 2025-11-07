"use client";

import LeadMainModal from "@/components/reusables/modals/user/lead/LeadModalMain";
import SkipTraceModalMain from "@/components/reusables/modals/user/skipTrace/SkipTraceModalMain";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import * as React from "react";
import CallCampaignsDemoTable from "../../../../external/shadcn-table/src/examples/call-campaigns-demo-table";
import DirectMailCampaignsDemoTable from "../../../../external/shadcn-table/src/examples/direct-mail-campaigns-demo-table";
import SocialCampaignsDemoTable from "../../../../external/shadcn-table/src/examples/social-campaigns-demo-table";
import TextCampaignsDemoTable from "../../../../external/shadcn-table/src/examples/text-campaigns-demo-table";

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
				<div className="mb-2 text-muted-foreground text-xs">Active: {tab}</div>
				<div className="mb-3 flex items-center justify-between gap-3">
					<h2 className="font-semibold text-xl">
						{tab === "calls" && "Page: Calls Demo"}
						{tab === "text" && "Page: Text Demo"}
						{tab === "social" && "Page: Social Demo"}
						{tab === "directMail" && "Page: Direct Mail Demo"}
					</h2>
					{/* Create Campaign button is rendered inside each example header to keep placement consistent */}
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
