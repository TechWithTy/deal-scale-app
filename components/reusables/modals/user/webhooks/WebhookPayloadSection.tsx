import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ClipboardCopy } from "lucide-react";
import type React from "react";

interface WebhookPayloadSectionProps {
	webhookPayload: string;
	onCopy: () => void;
	className?: string;
}

const WebhookPayloadSection: React.FC<WebhookPayloadSectionProps> = ({
	webhookPayload,
	onCopy,
	className,
}) => (
	<div className={`relative mt-4 ${className ?? ""}`}>
		<label htmlFor="webhookPayload" className="mb-1 block font-medium text-sm">
			Webhook Payload
		</label>
		<div className="relative">
			<Textarea
				id="webhookPayload"
				rows={8}
				value={webhookPayload}
				readOnly
				className="max-w-full overflow-x-auto dark:bg-gray-800 dark:text-gray-200"
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
