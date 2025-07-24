import React, { type FC } from "react";
import Joyride, { type Step } from "react-joyride";
// * Joyride is used for guided tours. Step[] defines the steps for the tour.
// ! If you see a type error about 'steps', check the parent/consumer component. This file expects Step[] as required by Joyride.

interface WalkThroughModalProps {
	isOpen: boolean; // To control the modal's visibility
	onClose: () => void; // Function to close the modal
	videoUrl: string; // URL for the embedded video
	title: string; // Title of the modal
	subtitle: string; // Subtitle for additional context
	termsUrl?: string; // Optional link to the Terms of Use
	steps: Step[]; // Steps for the tour (Joyride uses Step[] type)
	isTourOpen: boolean; // Control if the tour is open or not
	onStartTour: () => void; // Function to start the tour
	onCloseTour: () => void; // Function to close the tour
}

// Utility to convert YouTube URLs to embed URLs
const getEmbedUrl = (url: string) => {
	// Extract video ID and query params
	const ytMatch = url.match(
		/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})([\?&][^#]*)?/,
	);
	if (ytMatch?.[1]) {
		// Preserve query string (like ?si=...)
		const query = ytMatch[2] || "";
		return `https://www.youtube.com/embed/${ytMatch[1]}${query}`;
	}
	return url;
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
}) => {
	const [videoLoading, setVideoLoading] = React.useState(true);
	if (!isOpen) return null; // Do not render the modal if isOpen is false

	// Function to close the modal when clicking outside
	const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	return (
		<>
			{/* Modal */}
			<div
				className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
				onMouseDown={handleOutsideClick?.bind?.(null)} // Close the modal when clicking outside
			>
				<div className="w-96 rounded-lg bg-white p-6 text-center shadow-lg dark:bg-gray-800">
					{/* X Button for closing the modal */}
					<button
						onClick={onClose}
						type="button"
						className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
					>
						&#x2715; {/* This is the "X" character */}
					</button>

					{/* Video Section */}
					<div
						className="relative mb-4 aspect-video w-full"
						aria-busy={videoLoading}
					>
						{videoLoading && (
							<div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-70">
								<span className="sr-only">Loading video...</span>
								<div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500" />
							</div>
						)}
						<iframe
							width="560"
							height="315"
							className="h-full w-full rounded"
							src={getEmbedUrl(videoUrl)}
							title="YouTube video player"
							frameBorder="0"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
							referrerPolicy="strict-origin-when-cross-origin"
							allowFullScreen
							onLoad={() => setVideoLoading(false)}
						/>
					</div>

					{/* Title */}
					<h2 className="mb-2 font-bold text-gray-900 text-xl dark:text-white">
						{title}
					</h2>

					{/* Subtitle */}
					<p className="mb-4 text-gray-600 dark:text-gray-300">{subtitle}</p>

					{/* "Got it" Button */}
					<button
						type="button"
						className="w-full rounded-lg bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600"
						onClick={onClose}
					>
						Got it
					</button>

					{/* Conditionally render the Terms of Use clause */}
					{termsUrl && (
						<p className="mt-4 text-gray-400 text-sm dark:text-gray-400">
							The use of the Deal Scale Property Search is subject to our{" "}
							<a
								href={termsUrl}
								className="text-blue-500 underline dark:text-blue-400"
							>
								Terms of Use
							</a>
							.
						</p>
					)}

					{/* Help Button for starting the tour */}
					<button
						type="button"
						className="mt-4 text-gray-700 text-sm hover:underline dark:text-gray-300"
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
