// ! UsageModalActions: Modal action buttons (close/upgrade)
import type React from "react";

interface UsageModalActionsProps {
	onClose: () => void;
	onUpgrade: () => void;
	onBuyNow?: () => void;
}

const UsageModalActions: React.FC<UsageModalActionsProps> = ({
	onClose,
	onUpgrade,
	onBuyNow,
}) => {
	return (
		<div className="mt-4 flex justify-center gap-2">
			<button
				type="button"
				onClick={onClose}
				className="rounded border px-4 py-2"
			>
				Close
			</button>
			<button
				type="button"
				onClick={onUpgrade}
				className="rounded border px-4 py-2"
			>
				Upgrade
			</button>
		</div>
	);
};

export default UsageModalActions;
