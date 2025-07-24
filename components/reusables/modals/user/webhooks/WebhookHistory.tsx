import { Separator } from "@/components/ui/separator";
import { FileSearch } from "lucide-react";
import type React from "react";

export interface WebhookEntryType {
	date: string;
	payload: Record<string, unknown>;
}

interface WebhookHistoryProps {
	webhookHistory: WebhookEntryType[];
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
			<div className="max-h-64 space-y-4 overflow-y-auto">
				{webhookHistory.map((entry) => (
					<div
						key={entry.date + JSON.stringify(entry.payload)}
						className="rounded-lg border p-4 dark:border-gray-600"
					>
						<p className="text-sm dark:text-gray-200">
							Webhook sent on {entry.date} with payload:
						</p>
						<pre className="overflow-x-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-700">
							{JSON.stringify(entry.payload, null, 2)}
						</pre>
					</div>
				))}
			</div>
		)}
	</div>
);

export default WebhookHistory;
