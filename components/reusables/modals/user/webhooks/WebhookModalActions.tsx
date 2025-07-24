import { Button } from "@/components/ui/button";
import type React from "react";

interface WebhookModalActionsProps {
	onCancel: () => void;
	onTest: () => void;
	onSave: () => void;
}

const WebhookModalActions: React.FC<WebhookModalActionsProps> = ({
	onCancel,
	onTest,
	onSave,
}) => (
	<div className="mt-6 flex justify-end gap-4">
		<Button variant="outline" onClick={onCancel} type="button">
			Cancel
		</Button>
		<Button variant="secondary" onClick={onTest} type="button">
			Test
		</Button>
		<Button className="bg-blue-600 text-white" onClick={onSave} type="button">
			Save
		</Button>
	</div>
);

export default WebhookModalActions;
