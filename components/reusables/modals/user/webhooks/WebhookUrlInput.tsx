import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/_utils";
import { Copy } from "lucide-react";
import type React from "react";
import { toast } from "sonner";

interface WebhookUrlInputProps {
	className?: string;
	description?: string;
	inputClassName?: string;
	label?: string;
	placeholder?: string;
	readOnly?: boolean;
	setWebhookUrl?: (url: string) => void;
	webhookUrl: string | undefined;
	showCopyButton?: boolean;
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
	showCopyButton,
}) => {
	const handleCopy = async () => {
		if (!webhookUrl) return;
		try {
			if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(webhookUrl);
				toast("URL copied to clipboard!");
			} else {
				throw new Error("clipboard unavailable");
			}
		} catch (error) {
			toast.error("Unable to copy URL. Please copy manually.");
		}
	};

	const shouldShowCopy = showCopyButton ?? readOnly;

	return (
		<div className={cn("mt-4", className)}>
			<label htmlFor="webhookUrl" className="mb-1 block font-medium text-sm">
				{label}
			</label>
			{description ? (
				<p className="mb-2 text-muted-foreground text-xs">{description}</p>
			) : null}
			<div className="relative flex items-center gap-2">
				<Input
					id="webhookUrl"
					type="url"
					placeholder={placeholder}
					value={webhookUrl}
					readOnly={readOnly}
					onChange={(event) => setWebhookUrl?.(event.target.value)}
					className={cn("pr-10 font-mono", inputClassName)}
				/>
				{shouldShowCopy && webhookUrl && (
					<Button
						variant="ghost"
						size="sm"
						onClick={handleCopy}
						type="button"
						className="absolute right-1 h-7 w-7 p-0"
						aria-label="Copy URL"
					>
						<Copy className="h-4 w-4" />
					</Button>
				)}
			</div>
		</div>
	);
};

export default WebhookUrlInput;
