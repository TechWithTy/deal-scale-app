"use client";

import { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpandableAISummary } from "external/ai-summary-expandable/components";
import type { LeadSummariesResult, SummaryPayload } from "@/lib/analysis/types";

interface LeadAnalysisModalProps {
	isOpen: boolean;
	onClose: () => void;
	result: LeadSummariesResult;
}

interface TabDefinition {
	value: string;
	label: string;
	payload: SummaryPayload;
}

const copySummary = async (text: string) => {
	try {
		await navigator.clipboard.writeText(text);
		toast.success("Summary copied to clipboard");
	} catch (error) {
		console.error(error);
		toast.error("Unable to copy summary");
	}
};

const SummaryTab = ({ payload }: { payload: SummaryPayload }) => (
	<div className="space-y-4">
		<ExpandableAISummary section={payload.section} />
		<div className="rounded-lg border border-border bg-muted/40 p-4">
			<div className="mb-2 flex items-center justify-between gap-2">
				<span className="text-sm font-medium text-foreground">Template</span>
				<Button
					type="button"
					size="sm"
					variant="secondary"
					className="gap-2"
					onClick={() => copySummary(payload.copy)}
				>
					<Copy className="h-4 w-4" /> Copy summary
				</Button>
			</div>
			<pre className="max-h-64 overflow-auto whitespace-pre-wrap text-left text-sm text-muted-foreground">
				{payload.copy}
			</pre>
		</div>
	</div>
);

const LeadAnalysisModal = ({
	isOpen,
	onClose,
	result,
}: LeadAnalysisModalProps) => {
	const [tabValue, setTabValue] = useState("investor");

	useEffect(() => {
		if (isOpen) {
			setTabValue("investor");
		}
	}, [isOpen]);

	const tabs: TabDefinition[] = [
		{ value: "investor", label: "Investor", payload: result.investor },
		{ value: "wholesaler", label: "Wholesaler", payload: result.wholesaler },
		{ value: "buyer", label: "Buyer / Agent", payload: result.buyer },
	];

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => (!open ? onClose() : undefined)}
		>
			<DialogContent className="max-w-5xl overflow-hidden">
				<DialogHeader>
					<DialogTitle>AI Market Sentiment for {result.location}</DialogTitle>
					<DialogDescription>
						Actionable investor, wholesaler, and buyer/agent summaries for your
						selected market.
					</DialogDescription>
				</DialogHeader>
				<Tabs
					value={tabValue}
					onValueChange={setTabValue}
					className="mt-4 space-y-4"
				>
					<TabsList className="grid w-full grid-cols-3 gap-2 bg-transparent">
						{tabs.map((tab) => (
							<TabsTrigger
								key={tab.value}
								value={tab.value}
								className="text-sm"
							>
								{tab.label}
							</TabsTrigger>
						))}
					</TabsList>
					{tabs.map((tab) => (
						<TabsContent
							key={tab.value}
							value={tab.value}
							className="focus-visible:outline-none"
						>
							<SummaryTab payload={tab.payload} />
						</TabsContent>
					))}
				</Tabs>
			</DialogContent>
		</Dialog>
	);
};

export default LeadAnalysisModal;
