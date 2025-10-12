import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { FileText } from "lucide-react";
import type React from "react";

export interface FeedItemType {
	id: string;
	title: string;
	link: string;
	publishedAt: string;
	summary: string;
	author?: string;
}

interface WebhookFeedPreviewProps {
	feedItems: FeedItemType[];
}

const WebhookFeedPreview: React.FC<WebhookFeedPreviewProps> = ({
	feedItems,
}) => (
	<div className="mt-6">
		<h4 className="text-lg font-medium text-foreground">Current RSS feed</h4>
		<Separator className="my-2" />
		{feedItems.length === 0 ? (
			<div className="flex items-center gap-3 rounded-md border border-dashed bg-muted/40 p-4 text-sm text-muted-foreground">
				<FileText className="h-5 w-5" />
				<span>
					No feed entries published yet. Configure feed mirroring to populate
					this list.
				</span>
			</div>
		) : (
			<Accordion
				type="multiple"
				className="max-h-64 space-y-2 overflow-y-auto pr-1"
			>
				{feedItems.map((item) => (
					<AccordionItem
						key={item.id}
						value={`feed-${item.id}`}
						className="overflow-hidden rounded-lg border bg-card text-card-foreground"
					>
						<AccordionTrigger className="px-4 text-left">
							<div className="flex flex-col text-left">
								<span className="text-sm font-medium">{item.title}</span>
								<span className="text-xs text-muted-foreground">
									{item.author ? `${item.author} • ` : ""}
									{item.publishedAt}
								</span>
							</div>
						</AccordionTrigger>
						<AccordionContent className="px-4">
							<p className="text-xs text-muted-foreground">{item.summary}</p>
							<a
								className="mt-3 inline-flex items-center text-xs font-medium text-primary hover:underline"
								href={item.link}
								rel="noreferrer"
								target="_blank"
							>
								Open feed item
							</a>
						</AccordionContent>
					</AccordionItem>
				))}
			</Accordion>
		)}
	</div>
);

export default WebhookFeedPreview;
