import { Input } from "@/components/ui/input";
import type React from "react";

interface WebhookUrlInputProps {
	className?: string;
	placeholder?: string;
	setWebhookUrl: (url: string) => void;
	webhookUrl: string | undefined;
}

const WebhookUrlInput: React.FC<WebhookUrlInputProps> = ({
	className,
	placeholder,
	setWebhookUrl,
	webhookUrl,
}) => (
	<div className={`mt-4 ${className}`}>
		<label htmlFor="webhookUrl" className="mb-1 block font-medium text-sm">
			Webhook URL
		</label>
		<Input
			id="webhookUrl"
			type="url"
			placeholder={placeholder}
			value={webhookUrl}
			onChange={(e) => setWebhookUrl(e.target.value)}
			className={className}
		/>
	</div>
);

export default WebhookUrlInput;
