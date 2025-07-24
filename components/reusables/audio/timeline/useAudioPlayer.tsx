import type { LottieRefCurrentProps } from "lottie-react";
import playAnimation from "@/public/lottie/playButton.json"; // Ensure this path is correct
import {
	useEffect,
	useRef,
	useState,
	useImperativeHandle,
	useCallback,
	forwardRef,
} from "react";
import { useFormContext } from "react-hook-form";
import type { ForwardedRef } from "react";
import Lottie from "lottie-react";
import type { PlayButtonTimeLineHandle } from "./types";

interface PlayButtonTimeLineProps {
	audioSrc: string;
	startTime?: number; // Optional start time in seconds
	endTime?: number; // Optional end time in seconds
	// For React Hook Form integration
	name?: string;
	onChange?: (value: { currentTime: number; isPlaying: boolean }) => void;
	value?: { currentTime: number; isPlaying: boolean };
}

/**
 * Audio player component with timeline controls and React Hook Form integration
 */
const PlayButtonTimeLine = forwardRef<
	PlayButtonTimeLineHandle,
	PlayButtonTimeLineProps
>(
	(
		{
			audioSrc,
			startTime = 0, // Default startTime to 0 if not provided
			endTime,
			name,
			onChange,
			value,
		},
		ref: ForwardedRef<PlayButtonTimeLineHandle>,
	) => {
		const formContext = useFormContext();
		const { setValue: setFormValue } = formContext || {};

		// Initialize state: prioritize `value` prop, then `startTime`, then default
		const [isPlaying, setIsPlaying] = useState(value?.isPlaying ?? false);
		const [currentTime, setCurrentTime] = useState(
			value?.currentTime ?? startTime,
		);
		const [duration, setDuration] = useState(0);
		const [progress, setProgress] = useState(0); // Progress percentage (0 - 100)

		const audioRef = useRef<HTMLAudioElement | null>(null);
		const lottieRef = useRef<LottieRefCurrentProps | null>(null);

		// Notify parent/context of state changes
		const notifyChange = useCallback(
			(updates: Partial<{ currentTime: number; isPlaying: boolean }>) => {
				// Use the latest state values for constructing the new state
				// This ensures that if only one part of the state is updated, the other part uses its current value
				const newCurrentTime =
					updates.currentTime !== undefined ? updates.currentTime : currentTime;
				const newIsPlaying =
					updates.isPlaying !== undefined ? updates.isPlaying : isPlaying;

				const newState = {
					currentTime: newCurrentTime,
					isPlaying: newIsPlaying,
				};

				if (onChange) {
					onChange(newState);
				}

				if (name && setFormValue) {
					setFormValue(name, newState, {
						shouldValidate: true,
						shouldDirty: true,
					});
				}
			},
			// Dependencies: if these change, the notifyChange function itself needs to be recreated
			// We read currentTime and isPlaying to form the newState if not provided in `updates`
			[currentTime, isPlaying, name, onChange, setFormValue],
		);

		// Effect to synchronize with `value` prop for controlled component behavior
		useEffect(() => {
			if (value === undefined) return; // Not operating as a controlled component for these props

			let audioActionTaken = false;

			// Sync `currentTime`
			if (
				value.currentTime !== undefined &&
				Math.abs(value.currentTime - currentTime) > 0.1
			) {
				setCurrentTime(value.currentTime);
				if (
					audioRef.current &&
					Math.abs(audioRef.current.currentTime - value.currentTime) > 0.1
				) {
					audioRef.current.currentTime = value.currentTime;
					// `onTimeUpdate` will handle updating progress based on audio element's time
					// No need to call notifyChange here as onTimeUpdate will do it or it's an external change
				}
			}

			// Sync `isPlaying`
			if (value.isPlaying !== undefined && value.isPlaying !== isPlaying) {
				setIsPlaying(value.isPlaying); // Update local React state
				if (audioRef.current) {
					audioActionTaken = true;
					if (value.isPlaying) {
						// If current time is outside bounds when instructed to play by prop, reset to startTime
						if (
							audioRef.current.currentTime < startTime ||
							(endTime && audioRef.current.currentTime >= endTime)
						) {
							audioRef.current.currentTime = startTime;
							// Update React state for currentTime as we just changed the audio element's time
							setCurrentTime(startTime);
						}
						audioRef.current
							.play()
							.catch((e) =>
								console.error(
									"[PlayButtonTimeLine] Audio play error from controlled prop:",
									e,
								),
							);
						lottieRef.current?.play?.();
					} else {
						audioRef.current.pause();
						lottieRef.current?.pause?.();
					}
					// When controlled, the `value` prop is the source of truth.
					// `notifyChange` is primarily for uncontrolled changes or user interactions.
					// However, if form integration relies on `notifyChange` even for controlled updates, consider calling it.
					// For now, assuming `onChange` prop is enough for parent to know about controlled changes.
				}
			}
			// If `value` prop changes `isPlaying` or `currentTime` but audio element hasn't taken action
			// (e.g., only `currentTime` changed but `isPlaying` remained true),
			// and `value.isPlaying` is true, ensure audio is playing.
			if (
				value.isPlaying &&
				audioRef.current &&
				!audioRef.current.paused !== value.isPlaying &&
				!audioActionTaken
			) {
				audioRef.current
					.play()
					.catch((e) =>
						console.error("[PlayButtonTimeLine] Audio play ensure error:", e),
					);
				lottieRef.current?.play?.();
			}
		}, [value, startTime, endTime, currentTime, isPlaying]); // Add all relevant states and props read inside

		// Toggle play/pause via user interaction
		const togglePlay = useCallback(() => {
			if (!audioRef.current) return;

			const currentAudioTime = audioRef.current.currentTime;
			let targetTime = currentAudioTime;

			if (isPlaying) {
				audioRef.current.pause();
				lottieRef.current?.pause?.();
				setIsPlaying(false);
				notifyChange({ isPlaying: false }); // Notify current time which is audioRef.current.currentTime
			} else {
				// If audio is at the end or outside the segment, restart from startTime
				if (
					currentAudioTime < startTime ||
					(endTime && currentAudioTime >= endTime) ||
					audioRef.current.ended
				) {
					targetTime = startTime;
					audioRef.current.currentTime = targetTime;
				}

				const playPromise = audioRef.current.play();
				lottieRef.current?.play?.();
				setIsPlaying(true);
				notifyChange({ isPlaying: true, currentTime: targetTime }); // Notify with potential new time

				playPromise?.catch((e) =>
					console.error("[PlayButtonTimeLine] Audio play error:", e),
				);
			}
		}, [isPlaying, notifyChange, startTime, endTime]);

		// Handle audio time updates
		const handleTimeUpdate = useCallback(() => {
			if (audioRef.current) {
				const newTime = audioRef.current.currentTime;

				// Only update React state if significantly different to avoid excessive re-renders
				// and potential conflicts with controlled updates.
				if (Math.abs(newTime - currentTime) > 0.05) {
					// Small threshold
					setCurrentTime(newTime);
				}

				setProgress(duration > 0 ? (newTime / duration) * 100 : 0);
				notifyChange({ currentTime: newTime }); // Always notify with the precise audio time

				if (endTime && newTime >= endTime) {
					audioRef.current.pause();
					lottieRef.current?.pause?.();
					setIsPlaying(false);
					// Ensure currentTime state reflects endTime accurately if stopped by endTime
					if (Math.abs(newTime - endTime) > 0.05) {
						// If it overshot
						setCurrentTime(endTime);
					}
					notifyChange({ isPlaying: false, currentTime: endTime });
				}
			}
		}, [duration, endTime, notifyChange, currentTime]); // Added currentTime as a dep for the check

		// Handle timeline slider change
		const handleTimelineChange = useCallback(
			(e: React.ChangeEvent<HTMLInputElement>) => {
				if (audioRef.current) {
					const newTime = Number.parseFloat(e.target.value);
					audioRef.current.currentTime = newTime;
					setCurrentTime(newTime); // Immediately update UI for responsiveness
					setProgress(duration > 0 ? (newTime / duration) * 100 : 0);
					notifyChange({ currentTime: newTime });
				}
			},
			[duration, notifyChange],
		);

		// Handle audio metadata loaded
		const handleLoadedMetadata = useCallback(() => {
			if (audioRef.current) {
				const newDuration = audioRef.current.duration;
				setDuration(newDuration);

				// Determine initial time: use `value` if provided, else `startTime`
				const initialAudioTime = value?.currentTime ?? startTime;

				// Set audio element's current time if it's not already there
				if (Math.abs(audioRef.current.currentTime - initialAudioTime) > 0.1) {
					audioRef.current.currentTime = initialAudioTime;
				}

				// Sync React state with the actual current time of the audio element
				const actualCurrentTime = audioRef.current.currentTime;
				setCurrentTime(actualCurrentTime);
				setProgress(
					newDuration > 0 ? (actualCurrentTime / newDuration) * 100 : 0,
				);

				// If `value` prop specified `isPlaying: true` initially, start playing
				if (value?.isPlaying && audioRef.current.paused) {
					audioRef.current
						.play()
						.catch((e) =>
							console.error(
								"[PlayButtonTimeLine] Initial play error on metadata load:",
								e,
							),
						);
					lottieRef.current?.play?.();
					// `setIsPlaying(true)` should have already been done by `value` useEffect or initial state
				}
			}
		}, [startTime, value]); // `value` is a dependency because it can define initial currentTime and isPlaying

		// Expose methods to parent via ref
		useImperativeHandle(
			ref,
			() => ({
				play: () => {
					if (audioRef.current) {
						audioRef.current.currentTime = startTime; // Imperative play always starts from startTime
						const playPromise = audioRef.current.play();
						lottieRef.current?.play?.();
						setIsPlaying(true);
						setCurrentTime(startTime); // Sync state
						notifyChange({ isPlaying: true, currentTime: startTime });

						playPromise?.catch((e) =>
							console.error(
								"[PlayButtonTimeLine] audio.play() error via ref:",
								e,
							),
						);
					}
				},
				pause: () => {
					if (audioRef.current) {
						audioRef.current.pause();
						lottieRef.current?.pause?.();
						setIsPlaying(false);
						notifyChange({ isPlaying: false }); // currentTime will be the paused time
					}
				},
				getCurrentTime: () => audioRef.current?.currentTime ?? currentTime, // Prefer actual audio time
				isPlaying: () => isPlaying,
			}),
			[isPlaying, currentTime, notifyChange, startTime],
		); // `currentTime` state for getCurrentTime fallback

		// Format time in MM:SS
		const formatTime = useCallback((timeInSeconds: number) => {
			const sanitizedTime =
				Number.isNaN(timeInSeconds) || timeInSeconds < 0 ? 0 : timeInSeconds;
			const minutes = Math.floor(sanitizedTime / 60);
			const seconds = Math.floor(sanitizedTime % 60);
			return `${minutes}:${seconds.toString().padStart(2, "0")}`;
		}, []);

		// Effect for `audioSrc` changes: reset duration and potentially other states
		useEffect(() => {
			if (audioRef.current && audioRef.current.src !== audioSrc) {
				// Only if src actually changes
				audioRef.current.pause(); // Stop previous audio
				lottieRef.current?.goToAndStop(0, true); // Reset Lottie
				setDuration(0);
				setProgress(0);

				// Reset state based on new source and initial props
				const initialPlaying = value?.isPlaying ?? false;
				const initialTime = value?.currentTime ?? startTime;

				setIsPlaying(initialPlaying);
				setCurrentTime(initialTime);

				// The audio element will load new metadata and `handleLoadedMetadata` will be called.
				// If `initialPlaying` is true, `handleLoadedMetadata` or `value` useEffect will handle play.
			}
		}, [audioSrc, startTime, value]);

		return (
			<div className="flex w-full flex-col items-center">
				<div className="flex w-full max-w-md items-center gap-4">
					<button
						type="button"
						onClick={togglePlay}
						className="rounded-full bg-primary p-2 text-primary-foreground transition-colors hover:bg-primary/90" // Use your actual Tailwind classes
						aria-label={isPlaying ? "Pause" : "Play"}
					>
						<Lottie
							lottieRef={lottieRef}
							animationData={playAnimation}
							loop={false}
							autoplay={false} // Controlled by state
							style={{ width: 32, height: 32 }}
							onComplete={() => {
								// Reset Lottie if it's a non-looping play/pause toggle animation
								if (!isPlaying && lottieRef.current) {
									// If Lottie played to end and audio is now paused
									lottieRef.current.goToAndStop(0, true); // Go to paused state frame
								}
							}}
						/>
					</button>

					<div className="flex flex-1 flex-col gap-1">
						<div className="flex justify-between text-muted-foreground text-xs">
							<span>{formatTime(currentTime)}</span>
							<span>{formatTime(duration > 0 ? duration : 0)}</span>
						</div>

						<input
							type="range"
							min={0} // Slider usually represents 0 to full duration
							max={duration > 0 ? duration : 100} // Fallback for max if duration is 0
							value={currentTime}
							step="0.01" // For smoother seeking
							onChange={handleTimelineChange}
							className="h-2 w-full appearance-none rounded-lg bg-gray-200 accent-primary" // Use your actual Tailwind classes
							style={{
								background: `linear-gradient(to right, var(--primary-color, #000) ${progress}%, #e5e7eb ${progress}%)`, // Use CSS variable for primary color
								cursor: "pointer",
							}}
							aria-label="Audio timeline"
						/>
					</div>
				</div>

				<audio
					ref={audioRef}
					src={audioSrc}
					onTimeUpdate={handleTimeUpdate}
					onLoadedMetadata={handleLoadedMetadata}
					onEnded={() => {
						setIsPlaying(false);
						lottieRef.current?.goToAndStop(0, true); // Reset Lottie to initial (paused) frame
						// If audio ends, currentTime should be duration or endTime if specified
						const finalTime =
							endTime && endTime < (audioRef.current?.duration ?? 0)
								? endTime
								: (audioRef.current?.duration ?? 0);
						setCurrentTime(finalTime);
						notifyChange({ isPlaying: false, currentTime: finalTime });
					}}
					onPlay={() => {
						// Sync lottie when audio element's play state changes directly
						if (!isPlaying) setIsPlaying(true); // Sync React state if out of sync
						lottieRef.current?.play();
					}}
					onPause={() => {
						// Sync lottie
						if (isPlaying) setIsPlaying(false); // Sync React state
						lottieRef.current?.pause();
					}}
					className="hidden"
					preload="metadata"
				>
					<track kind="captions" />
				</audio>
			</div>
		);
	},
);

PlayButtonTimeLine.displayName = "PlayButtonTimeLine";

export { PlayButtonTimeLine };
