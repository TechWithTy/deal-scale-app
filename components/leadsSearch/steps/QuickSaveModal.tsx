import type React from "react";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";

interface QuickSaveModalProps {
	open: boolean;
	onClose: () => void;
	onSave: (name: string) => void;
}

const QuickSaveModal: React.FC<QuickSaveModalProps> = ({
	open,
	onClose,
	onSave,
}) => {
	const [name, setName] = useState("");

	const handleSave = () => {
		if (name.trim()) {
			onSave(name.trim());
			setName("");
			onClose();
		}
	};

	const handleCancel = () => {
		setName("");
		onClose();
	};

	return (
		<Modal
			title="Quick Save Search"
			description="Name this search to save it for later."
			isOpen={open}
			onClose={handleCancel}
		>
			<div className="flex flex-col items-center gap-4 py-2">
				<input
					type="text"
					className="w-full rounded border border-orange-400 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:bg-gray-900"
					placeholder="Enter search name..."
					value={name}
					onChange={(e) => setName(e.target.value)}
				/>
				<div className="flex justify-center gap-3">
					<button
						className="rounded bg-orange-600 px-4 py-2 font-medium text-white hover:bg-orange-700"
						onClick={handleSave}
						type="button"
					>
						Save
					</button>
					<button
						className="rounded bg-gray-200 px-4 py-2 font-medium text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
						onClick={handleCancel}
						type="button"
					>
						Cancel
					</button>
				</div>
			</div>
		</Modal>
	);
};

export default QuickSaveModal;
