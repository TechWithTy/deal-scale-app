import { Input } from "@/components/ui/input";
import { cn } from "@/lib/_utils";
import type React from "react";

interface WebhookUrlInputProps {
	className?: string;
	description?: string;
	inputClassName?: string;
	label?: string;
	placeholder?: string;
	readOnly?: boolean;
	setWebhookUrl?: (url: string) => void;
	webhookUrl: string | undefined;
}

const WebhookUrlInput: React.FC<WebhookUrlInputProps> = ({
	className,
	description,
	inputClassName,
	label = "Webhook URL",
	placeholder,
	readOnly = false,
	setWebhookUrl,
	webhookUrl,
}) => (
	<div className={cn("mt-4", className)}>
		<label htmlFor="webhookUrl" className="mb-1 block text-sm font-medium">
			{label}
		</label>
		{description ? (
			<p className="mb-2 text-xs text-muted-foreground">{description}</p>
		) : null}
		<Input
			id="webhookUrl"
			type="url"
			placeholder={placeholder}
			value={webhookUrl}
			readOnly={readOnly}
			onChange={(event) => setWebhookUrl?.(event.target.value)}
			className={cn("font-mono", inputClassName)}
		/>
	</div>
);

export default WebhookUrlInput;
