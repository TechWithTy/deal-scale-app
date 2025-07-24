import playAnimation from "@/public/lottie/playButton.json";
/// <reference types="react" />
import Lottie from "lottie-react";
import type { LottieRefCurrentProps } from "lottie-react";
import React, { useState, useEffect, useRef } from "react";

interface PlayButtonSkipProps {
	audioSrc: string;
	startTime: number;
	endTime: number;
	onNextCall: () => void; // Function to get the next call
	onPrevCall: () => void; // Function to get the previous call
	isNextDisabled: boolean; // To disable the Next button if no more calls
	isPrevDisabled: boolean; // To disable the Prev button if no more calls
	title: string; // New title prop for the audio
}

export function PlayButtonSkip({
	audioSrc,
	startTime,
	endTime,
	onNextCall,
	onPrevCall,
	isNextDisabled,
	isPrevDisabled,
	title, // Added title prop
}: PlayButtonSkipProps) {
	const [isPlaying, setIsPlaying] = useState(false);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const lottieRef = useRef<LottieRefCurrentProps | null>(null); // Ref for Lottie animation control (typed, correct interface)
	// biomelint is not defined anywhere in this scope; if you intended to use it, you need to import or define it first.
	// For now, you can declare it as 'any' to suppress the error, but you should replace this with the correct implementation or import.

	const togglePlay = () => {
		if (audioRef.current) {
			if (isPlaying) {
				audioRef.current.pause();
				// * Pause Lottie animation (type-safe)
				lottieRef.current?.pause();
			} else {
				audioRef.current.play();
				// * Play Lottie animation (type-safe)
				lottieRef.current?.play();
			}
			setIsPlaying(!isPlaying);
		}
	};

	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.currentTime = startTime;
		}
	}, [startTime]);

	return (
		<div className="flex flex-col items-center space-y-2">
			{/* Audio Title */}
			<h2 className="text-center font-semibold text-gray-700 text-sm dark:text-white">
				{title}
			</h2>

			<div className="flex items-center space-x-2">
				<button
					onClick={onPrevCall}
					type="button"
					disabled={isPrevDisabled}
					className={`p-2 ${
						isPrevDisabled ? "cursor-not-allowed opacity-50" : ""
					}`}
				>
					⏮ Prev
				</button>

				<div
					onClick={togglePlay}
					onKeyDown={(e) => {
						e.preventDefault();
						togglePlay();
					}}
					className={`relative flex cursor-pointer items-center justify-center rounded-full p-2 transition-all duration-300 ${
						isPlaying ? "bg-red-500/50" : "bg-green-500"
					}`}
					style={{ height: "60px", width: "60px" }}
				>
					<Lottie
						animationData={playAnimation}
						loop={true}
						autoplay={false}
						lottieRef={lottieRef}
						style={{ height: "40px", width: "40px" }}
					/>
				</div>

				<button
					onClick={onNextCall}
					disabled={isNextDisabled}
					type="button"
					className={`p-2 ${
						isNextDisabled ? "cursor-not-allowed opacity-50" : ""
					}`}
				>
					⏭ Next
				</button>
			</div>

			<audio ref={audioRef} src={audioSrc}>
				<track kind="captions" srcLang="en" label="English captions" />
			</audio>
		</div>
	);
}
