import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import type { WebhookStage } from "@/lib/stores/dashboard";
import { FileSearch, SplitSquareHorizontal } from "lucide-react";
import type React from "react";

export interface WebhookEntryType {
	id: string;
	date: string;
	event: string;
	payload: Record<string, unknown>;
	status?: "delivered" | "failed" | "pending";
	responseCode?: number;
}

type WebhookDirections = Extract<WebhookStage, "incoming" | "outgoing">;

interface WebhookHistoryProps {
	activeStage: WebhookStage;
	historyByStage: Record<WebhookDirections, WebhookEntryType[]>;
}

const stageLabels: Record<WebhookDirections, string> = {
	incoming: "Incoming webhook history",
	outgoing: "Outgoing webhook history",
};

const WebhookHistory: React.FC<WebhookHistoryProps> = ({
	activeStage,
	historyByStage,
}) => {
	if (activeStage === "feeds") {
		return (
			<div className="mt-6 rounded-md border border-dashed bg-muted/40 p-4 text-sm text-muted-foreground">
				<div className="flex items-start gap-3">
					<SplitSquareHorizontal className="mt-1 h-5 w-5 text-muted-foreground/80" />
					<div>
						<p className="font-medium text-foreground">
							Webhook history unavailable in feed view
						</p>
						<p>
							Switch to the incoming or outgoing tabs to review recent webhook
							deliveries. The feeds tab now includes its own expandable RSS
							preview.
						</p>
					</div>
				</div>
			</div>
		);
	}

	const entries = historyByStage[activeStage];
	const title = stageLabels[activeStage];

	return (
		<div className="mt-6">
			<h3 className="text-lg font-medium text-foreground">{title}</h3>
			<Separator className="my-2" />
			{entries.length === 0 ? (
				<div className="flex h-32 flex-col items-center justify-center text-muted-foreground">
					<FileSearch className="h-10 w-10" />
					<p className="mt-2">No webhook attempts recorded yet.</p>
				</div>
			) : (
				<Accordion
					type="multiple"
					className="max-h-64 space-y-2 overflow-y-auto pr-1"
				>
					{entries.map((entry, index) => {
						const payloadPreview = Object.keys(entry.payload || {})
							.slice(0, 4)
							.join(", ");

						return (
							<AccordionItem
								key={entry.id}
								value={`${activeStage}-entry-${index}`}
								className="overflow-hidden rounded-lg border bg-card text-card-foreground"
							>
								<AccordionTrigger className="px-4 text-left">
									<div className="flex flex-col text-left">
										<span className="text-sm font-medium">{entry.event}</span>
										<span className="text-xs text-muted-foreground">
											{entry.date}
											{entry.status ? ` • ${entry.status}` : ""}
											{typeof entry.responseCode === "number"
												? ` • HTTP ${entry.responseCode}`
												: ""}
										</span>
										{payloadPreview ? (
											<span className="text-xs text-muted-foreground">
												Payload keys: {payloadPreview}
												{Object.keys(entry.payload || {}).length > 4 ? "…" : ""}
											</span>
										) : null}
									</div>
								</AccordionTrigger>
								<AccordionContent className="px-4">
									<pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">
										{JSON.stringify(entry.payload, null, 2)}
									</pre>
								</AccordionContent>
							</AccordionItem>
						);
					})}
				</Accordion>
			)}
		</div>
	);
};

export default WebhookHistory;
