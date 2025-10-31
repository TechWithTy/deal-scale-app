import React, { type FC } from "react";

// WalkthroughModal component for displaying video content and interactive demos

interface WalkThroughModalProps {
	isOpen: boolean; // To control the modal's visibility
	onClose: () => void; // Function to close the modal
	videoUrl: string; // URL for the embedded video (YouTube, Supademo, etc.)
	title: string; // Title of the modal
	subtitle: string; // Subtitle for additional context
	termsUrl?: string; // Optional link to the Terms of Use
}

// Utility to detect embed type and convert URLs
const getEmbedInfo = (url: string) => {
	// YouTube detection
	const ytMatch = url.match(
		/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})([\?&][^#]*)?/,
	);

	// Supademo detection
	const supademoMatch = url.match(
		/https:\/\/app\.supademo\.com\/embed\/([^/?]+)/,
	);

	if (ytMatch?.[1]) {
		return {
			type: "youtube",
			videoId: ytMatch[1],
			embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}${ytMatch[2] || ""}`,
		};
	}

	if (supademoMatch?.[1]) {
		return {
			type: "supademo",
			demoId: supademoMatch[1],
			embedUrl: `https://app.supademo.com/embed/${supademoMatch[1]}`,
		};
	}

	// Default fallback
	return {
		type: "unknown",
		embedUrl: url,
	};
};

const WalkThroughModal: FC<WalkThroughModalProps> = ({
	isOpen,
	onClose,
	videoUrl,
	title,
	subtitle,
	termsUrl, // Optional terms URL
}) => {
	const [videoLoading, setVideoLoading] = React.useState(true);
	const embedInfo = getEmbedInfo(videoUrl);

	// Handle body scroll lock - only lock if modal is open
	React.useEffect(() => {
		if (isOpen) {
			// Count existing modals with body scroll lock
			const existingModals = document.body.style.overflow === "hidden" ? 1 : 0;
			// Only add another lock if this is the topmost modal
			if (existingModals === 0) {
				document.body.style.overflow = "hidden";
			}
		}
		return () => {
			// Only unlock if we're the one that locked it
			// Other modals may still be open
			if (isOpen) {
				// Check if there are other modals before unlocking
				const hasOtherModals =
					document.querySelectorAll('[role="dialog"][aria-modal="true"]')
						.length > 1;
				if (!hasOtherModals) {
					document.body.style.overflow = "";
				}
			}
		};
	}, [isOpen]);

	if (!isOpen) return null; // Do not render the modal if isOpen is false

	// Function to close the modal when clicking outside
	// Stop propagation to prevent closing underlying modals
	const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.target === e.currentTarget) {
			e.stopPropagation(); // Prevent event from bubbling to underlying modal
			onClose();
		}
	};

	// Function to handle keyboard events for accessibility
	// Only close this modal, not underlying ones
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Escape") {
			e.stopPropagation(); // Prevent Escape from closing underlying modals
			onClose();
		}
	};

	return (
		<>
			{/* Modal - Higher z-index for stacking on top of other modals */}
			<div
				className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm"
				onClick={handleOutsideClick}
				onKeyDown={handleKeyDown}
				tabIndex={-1}
				// biome-ignore lint/a11y/useSemanticElements: <explanation>
				role="dialog"
				aria-modal="true"
			>
				<div className="w-96 rounded-lg bg-card p-6 text-center shadow-lg">
					{/* X Button for closing the modal */}
					<button
						onClick={onClose}
						type="button"
						className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
					>
						&#x2715; {/* This is the "X" character */}
					</button>

					{/* Video/Content Section */}
					<div
						className="relative mb-4 aspect-video w-full"
						aria-busy={videoLoading}
					>
						{videoLoading && (
							<div className="absolute inset-0 z-10 flex items-center justify-center bg-card/70">
								<span className="sr-only">Loading content...</span>
								<div className="h-12 w-12 animate-spin rounded-full border-4 border-border border-t-primary" />
							</div>
						)}

						{embedInfo.type === "supademo" ? (
							<div
								style={{
									position: "relative",
									boxSizing: "content-box",
									maxHeight: "80svh",
									width: "100%",
									aspectRatio: "2.028985507246377",
									padding: "40px 0 40px 0",
								}}
							>
								<iframe
									src={`https://app.supademo.com/embed/${embedInfo.demoId}?embed_v=2&utm_source=embed`}
									loading="lazy"
									title="Supademo Demo"
									allow="clipboard-write"
									frameBorder="0"
									allowFullScreen
									style={{
										position: "absolute",
										top: 0,
										left: 0,
										width: "100%",
										height: "100%",
									}}
									onLoad={() => setVideoLoading(false)}
								/>
							</div>
						) : (
							<iframe
								width="560"
								height="315"
								className="h-full w-full rounded"
								src={embedInfo.embedUrl}
								title={`${embedInfo.type} player`}
								frameBorder="0"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
								referrerPolicy="strict-origin-when-cross-origin"
								allowFullScreen
								onLoad={() => setVideoLoading(false)}
							/>
						)}
					</div>

					{/* Title */}
					<h2 className="mb-2 font-bold text-foreground text-xl">{title}</h2>

					{/* Subtitle */}
					<p className="mb-4 text-muted-foreground">{subtitle}</p>

					{/* "Got it" Button */}
					<button
						type="button"
						className="w-full rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground hover:bg-primary/90"
						onClick={(e) => {
							e.stopPropagation();
							onClose();
						}}
					>
						Got it
					</button>

					{/* Conditionally render the Terms of Use clause */}
					{termsUrl && (
						<p className="mt-4 text-muted-foreground text-sm">
							The use of the Deal Scale Property Search is subject to our{" "}
							<a href={termsUrl} className="text-primary underline">
								Terms of Use
							</a>
							.
						</p>
					)}

					{/* Help Button for closing modal */}
					<button
						type="button"
						className="mt-4 text-muted-foreground text-sm hover:underline"
						onClick={(e) => {
							e.stopPropagation();
							onClose();
						}}
					>
						Close Demo
					</button>
				</div>
			</div>
		</>
	);
};

export default WalkThroughModal;
