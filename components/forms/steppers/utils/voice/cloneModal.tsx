import VoiceClone from "@/public/lottie/RecordingButton.json"; // Path to the Lottie animation
import Lottie, { type LottieRefCurrentProps } from "lottie-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface VoiceCloningModalProps {
	onClose: () => void;
}

const MIN_RECORDING_LENGTH = 60; // Minimum recording length in seconds

const VoiceCloningModal: React.FC<VoiceCloningModalProps> = ({ onClose }) => {
	const [isRecording, setIsRecording] = useState(false);
	const [recordingError, setRecordingError] = useState<string | null>(null); // To display recording errors
	const [recordingDuration, setRecordingDuration] = useState<number>(0); // To track recording length
	const [showFinishButton, setShowFinishButton] = useState(false); // Show Finish button after recording

	const scriptContainerRef = useRef<HTMLDivElement>(null); // Reference to the script container
	const lottieRef = useRef<LottieRefCurrentProps | null>(null); // Lottie reference
	const mediaRecorderRef = useRef<MediaRecorder | null>(null); // MediaRecorder reference
	const audioChunksRef = useRef<Blob[]>([]); // Store audio chunks
	const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null); // To track recording time

	const scriptText = [
		"This is the first line of the script.",
		"Here is the second line.",
		"You are reading the third line.",
		"Keep going, you're almost done!",
		"This is the final line. Great job!",
	];

	// Handle recording start or stop toggle
	const handleRecordingToggle = async () => {
		if (isRecording) {
			stopRecording();
		} else {
			try {
				// Request microphone access
				const stream = await navigator.mediaDevices.getUserMedia({
					audio: true,
				});

				// Handle recording logic
				startRecording(stream);

				// Play Lottie animation and scroll the script
				lottieRef.current?.play();
				startAutoScroll();
			} catch (error) {
				// Handle errors and permissions
				setRecordingError("Microphone access denied or unavailable.");
			}
		}
	};

	// Start recording using MediaRecorder
	const startRecording = (stream: MediaStream) => {
		setIsRecording(true);
		setRecordingDuration(0); // Reset recording duration
		setRecordingError(null); // Clear any previous error
		audioChunksRef.current = []; // Reset audio chunks

		const mediaRecorder = new MediaRecorder(stream);
		mediaRecorderRef.current = mediaRecorder;

		mediaRecorder.ondataavailable = (event) => {
			audioChunksRef.current.push(event.data); // Collect audio data
		};

		mediaRecorder.start();

		// Start tracking recording time
		recordingIntervalRef.current = setInterval(() => {
			setRecordingDuration((prev) => prev + 1);
		}, 1000); // Increase duration by 1 second every 1000ms
	};

	// Stop recording and handle audio processing
	const stopRecording = () => {
		const mediaRecorder = mediaRecorderRef.current;
		if (mediaRecorder && mediaRecorder.state === "recording") {
			mediaRecorder.stop();
			setIsRecording(false);

			// Stop tracking the recording duration
			if (recordingIntervalRef.current) {
				clearInterval(recordingIntervalRef.current);
				recordingIntervalRef.current = null;
			}

			// Pause Lottie animation when recording stops
			lottieRef.current?.pause();

			mediaRecorder.onstop = () => {
				const audioBlob = new Blob(audioChunksRef.current, {
					type: "audio/wav",
				});
				console.warn("Recording stopped. Audio file created:", audioBlob);
				// Handle the audio file, e.g., upload or play it

				// Show the "Finish Recording" button if recording length is valid
				if (recordingDuration >= MIN_RECORDING_LENGTH) {
					setShowFinishButton(true);
				} else {
					setRecordingError("Recording too short. Please record again.");
				}
			};
		}
	};

	// Scroll the transcript automatically
	const startAutoScroll = () => {
		let index = 0;
		const interval = setInterval(() => {
			const container = scriptContainerRef.current;
			if (container && index < scriptText.length) {
				container.scrollTop += 20; // Scroll 20px every 2 seconds
				index++;
			} else {
				clearInterval(interval); // Stop scrolling after the script is done
			}
		}, 2000);
	};

	// Ensure that the Lottie animation is paused initially
	useEffect(() => {
		if (lottieRef.current) {
			lottieRef.current.goToAndStop(0, true); // Pause animation at the start
		}
	}, []);

	// Handle the "Finish Recording" button click
	const handleFinishRecording = () => {
		console.warn("Recording finished, processing...");
		// Here you can handle the final steps (e.g., upload the audio or navigate away)
		setShowFinishButton(false);
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
			<div className="relative w-full max-w-lg rounded-lg bg-card p-6 shadow-lg">
				{/* Close Button (X) */}
				<button
					type="button"
					onClick={onClose}
					className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth="2"
						stroke="currentColor"
						className="h-6 w-6"
					>
						<title>Close</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>

				<h2 className="mb-4 text-center text-lg font-semibold text-foreground">
					Clone Your Voice
				</h2>

				<div className="mb-4 flex justify-center">
					{/* Lottie button */}
					<button
						type="button"
						onClick={handleRecordingToggle}
						className="focus:outline-none"
					>
						<Lottie
							lottieRef={lottieRef} // Reference to Lottie instance
							animationData={VoiceClone}
							loop={true} // Animation will loop if necessary
							autoplay={false} // Start animation manually
						/>
					</button>
				</div>

				{/* Scrollable Transcript */}
				<div
					ref={scriptContainerRef}
					className="h-32 max-h-32 w-full overflow-y-auto border border-border bg-background p-2"
				>
					{scriptText.map((line, index) => (
						<p key={line} className="text-muted-foreground">
							{line}
						</p>
					))}
				</div>

				<button
					type="button"
					onClick={handleRecordingToggle}
					className={`mt-4 w-full rounded px-4 py-2 text-white ${
						isRecording
							? "bg-destructive hover:bg-destructive/90"
							: "bg-primary hover:bg-primary/90"
					}`}
				>
					{isRecording ? "Stop Recording" : "Start Recording"}
				</button>

				{/* Finish Recording Button */}
				{showFinishButton && (
					<button
						type="button"
						onClick={handleFinishRecording}
						className="mt-4 w-full rounded bg-green-600 px-4 py-2 text-primary-foreground hover:bg-green-700"
					>
						Finish Recording
					</button>
				)}

				{/* Error message for microphone access or short recording */}
				{recordingError && (
					<p className="mt-2 text-center text-sm text-destructive">
						{recordingError}
					</p>
				)}
			</div>
		</div>
	);
};

export default VoiceCloningModal;
