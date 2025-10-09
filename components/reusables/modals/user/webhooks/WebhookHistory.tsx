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

const WebhookHistory: React.FC<WebhookHistoryProps> = ({ webhookHistory }) => (
	<div className="mt-6">
		<h3 className="font-medium text-lg dark:text-gray-200">Webhook History</h3>
		<Separator className="my-2 dark:border-gray-600" />
		{webhookHistory.length === 0 ? (
			<div className="flex h-32 flex-col items-center justify-center">
				<FileSearch className="h-10 w-10 text-gray-400 dark:text-gray-500" />
				<p className="mt-2 text-gray-500 dark:text-gray-400">
					No webhook history available
				</p>
			</div>
		) : (
			<Accordion
				type="multiple"
				className="max-h-64 space-y-2 overflow-y-auto pr-1"
			>
				{webhookHistory.map((entry, index) => {
					const payloadPreview = Object.keys(entry.payload || {})
						.slice(0, 4)
						.join(", ");

					return (
						<AccordionItem
							key={entry.date + JSON.stringify(entry.payload)}
							value={`entry-${index}`}
							className="overflow-hidden rounded-lg border bg-card text-card-foreground dark:border-gray-600"
						>
							<AccordionTrigger className="px-4 text-left">
								<div className="flex flex-col text-left">
									<span className="text-sm font-medium">
										Webhook sent on {entry.date}
									</span>
									{payloadPreview ? (
										<span className="text-xs text-muted-foreground">
											Fields: {payloadPreview}
											{Object.keys(entry.payload || {}).length > 4 ? "…" : ""}
										</span>
									) : null}
								</div>
							</AccordionTrigger>
							<AccordionContent className="px-4">
								<pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs dark:bg-gray-700">
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

export default WebhookHistory;
