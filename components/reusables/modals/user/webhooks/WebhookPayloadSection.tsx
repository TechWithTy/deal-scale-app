import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/_utils";
import { ClipboardCopy } from "lucide-react";
import type React from "react";

interface WebhookPayloadSectionProps {
	className?: string;
	description?: string;
	label?: string;
	onCopy: () => void;
	webhookPayload: string;
}

const WebhookPayloadSection: React.FC<WebhookPayloadSectionProps> = ({
	className,
	description,
	label = "Webhook Payload",
	onCopy,
	webhookPayload,
}) => (
	<div className={cn("relative mt-4", className)}>
		<label htmlFor="webhookPayload" className="mb-1 block font-medium text-sm">
			{label}
		</label>
		{description ? (
			<p className="mb-2 text-muted-foreground text-xs">{description}</p>
		) : null}
		<div className="relative">
			<Textarea
				id="webhookPayload"
				rows={8}
				value={webhookPayload}
				readOnly
				className="max-w-full overflow-x-auto font-mono text-xs"
			/>
			<Button
				onClick={onCopy}
				variant="ghost"
				className="absolute top-2 right-2"
				size="icon"
				type="button"
			>
				<ClipboardCopy className="h-5 w-5 text-gray-500 dark:text-gray-300" />
			</Button>
		</div>
	</div>
);

export default WebhookPayloadSection;
