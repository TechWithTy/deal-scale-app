import { useEffect } from "react";
import { X } from "lucide-react";
import { Lens } from "@/components/magicui/lens";

interface ImageModalProps {
	isOpen: boolean;
	onClose: () => void;
	imageUrl: string;
	alt: string;
}

export function ImageModal({
	isOpen,
	onClose,
	imageUrl,
	alt,
}: ImageModalProps) {
	// Close modal on Escape key
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			}
		};

		if (isOpen) {
			document.body.style.overflow = "hidden";
			document.addEventListener("keydown", handleKeyDown);
		} else {
			document.body.style.overflow = "auto";
		}

		return () => {
			document.body.style.overflow = "auto";
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<dialog
			open
			className="fixed inset-0 z-50 m-0 flex items-center justify-center border-none bg-black/90 p-0 backdrop-blur-sm"
			onClose={onClose}
			onClick={onClose}
			onKeyDown={(e) => e.key === "Escape" && onClose()}
			aria-label="Image modal"
		>
			<div
				className="relative max-h-[90vh] max-w-[90vw]"
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
			>
				<Lens
					zoomFactor={2}
					lensSize={250}
					isStatic={false}
					ariaLabel="Zoom in on image"
				>
					<img
						src={imageUrl}
						alt={alt}
						className="max-h-[90vh] max-w-[90vw] cursor-zoom-out object-contain"
						style={{
							borderRadius: "0.5rem",
						}}
					/>
				</Lens>
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						onClose();
					}}
					className="-right-4 -top-4 absolute z-[100] rounded-full bg-white p-2 text-black shadow-lg transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
					aria-label="Close image modal"
				>
					<X className="h-5 w-5" />
				</button>
			</div>
		</dialog>
	);
}
