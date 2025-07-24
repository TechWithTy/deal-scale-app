import type React from "react";
import { useRef, useEffect } from "react";
import Teleprompter, {
	type TeleprompterProps,
	type TeleprompterHandle,
} from "./Teleprompter";

interface TeleprompterFullScreenProps extends TeleprompterProps {
	open: boolean;
	onClose: () => void;
	teleprompterRef: React.RefObject<TeleprompterHandle>;
}

const TeleprompterFullScreen: React.FC<TeleprompterFullScreenProps> = ({
	open,
	onClose,
	teleprompterRef,
	...props
}) => {
	const overlayRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", handleKey);
		return () => window.removeEventListener("keydown", handleKey);
	}, [open, onClose]);

	// Click outside to close
	const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.target === overlayRef.current) onClose();
	};

	if (!open) return null;
	return (
		<div
			ref={overlayRef}
			className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80"
			onClick={handleOverlayClick}
			onKeyDown={(e) => {
				if (e.key === "Escape") onClose();
			}}
			aria-modal="true"
		>
			<div className="relative flex h-[90vh] w-full max-w-3xl flex-col rounded-lg bg-white shadow-lg dark:bg-gray-900">
				<button
					onClick={onClose}
					type="button"
					className="absolute top-4 right-4 z-10 rounded-full bg-gray-200 p-2 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
					aria-label="Close Full Screen Teleprompter"
				>
					<span className="text-xl">×</span>
				</button>
				<div className="flex-1 overflow-y-auto p-8">
					{/* Render the Teleprompter in full screen mode, passing ref and props */}
					<Teleprompter ref={teleprompterRef} {...props} />
				</div>
			</div>
		</div>
	);
};

export default TeleprompterFullScreen;
