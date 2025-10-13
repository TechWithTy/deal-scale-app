import React, { type FC } from "react";
import Joyride, { type Step } from "react-joyride";
import { useSupademo } from "@/components/ui/supademo-trigger";

// * Joyride is used for guided tours. Step[] defines the steps for the tour.
// ! If you see a type error about 'steps', check the parent/consumer component. This file expects Step[] as required by Joyride.

interface WalkThroughModalProps {
	isOpen: boolean; // To control the modal's visibility
	onClose: () => void; // Function to close the modal
	videoUrl: string; // URL for the embedded video (YouTube, Supademo, etc.)
	title: string; // Title of the modal
	subtitle: string; // Subtitle for additional context
	termsUrl?: string; // Optional link to the Terms of Use
	steps: Step[]; // Steps for the tour (Joyride uses Step[] type)
	isTourOpen: boolean; // Control if the tour is running or not
	onStartTour: () => void; // Function to start the tour
	onCloseTour: () => void; // Function to close the tour
	supademoDemoId?: string; // Optional Supademo demo ID
	supademoShowcaseId?: string; // Optional Supademo showcase ID
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
	steps, // Tour steps array passed as prop
	isTourOpen, // Tour visibility state
	onStartTour, // Function to start the tour
	onCloseTour, // Function to close the tour
	supademoDemoId,
	supademoShowcaseId,
}) => {
	const { loadDemo, loadShowcase } = useSupademo();
	const [videoLoading, setVideoLoading] = React.useState(true);
	const embedInfo = getEmbedInfo(videoUrl);

	if (!isOpen) return null; // Do not render the modal if isOpen is false

	// Function to close the modal when clicking outside
	const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	// Function to handle keyboard events for accessibility
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Escape") {
			onClose();
		}
	};

	// Handle Supademo triggers
	const handleSupademoClick = () => {
		if (supademoDemoId) {
			loadDemo(supademoDemoId);
		} else if (supademoShowcaseId) {
			loadShowcase(supademoShowcaseId);
		}
	};

	return (
		<>
			{/* Modal */}
			<div
				className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
				onClick={handleOutsideClick}
				onKeyDown={handleKeyDown}
				tabIndex={-1}
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
							<div className="flex h-full w-full items-center justify-center rounded bg-muted">
								<div className="text-center">
									<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
										<button
											type="button"
											onClick={handleSupademoClick}
											className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
										>
											▶
										</button>
									</div>
									<p className="mb-2 text-muted-foreground">Interactive Demo</p>
									<p className="text-muted-foreground text-sm">
										Click to start the Supademo interactive guide
									</p>
								</div>
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
						onClick={onClose}
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

					{/* Help Button for starting the tour */}
					<button
						type="button"
						className="mt-4 text-muted-foreground text-sm hover:underline"
						onClick={onStartTour} // Trigger the tour when clicked
					>
						Still need help? Get a tour
					</button>
				</div>
			</div>

			{/* Joyride Tour Component */}
			<Joyride
				steps={steps} // The steps for the guided tour
				run={isTourOpen} // Control if the tour is running
				continuous={true} // Set true if you want the user to continue through steps automatically
				scrollToFirstStep // Scroll to the first step
				showProgress // Show progress bar
				showSkipButton // Allow skipping the tour
				// * Joyride callback provides tour status and step info
				callback={(data: { status?: string }) => {
					const { status } = data;
					// ! Only close the tour if finished or skipped
					if (status === "finished" || status === "skipped") {
						onCloseTour();
					}
				}}
			/>
		</>
	);
};

export default WalkThroughModal;
