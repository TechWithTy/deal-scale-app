import type { LottieRefCurrentProps } from "lottie-react";

/**
 * State of the audio player
 */
export interface AudioPlayerState {
	isPlaying: boolean;
	currentTime: number;
	duration: number;
	progress: number;
}

/**
 * Props for the PlayButton component
 */
export interface PlayButtonProps {
	isPlaying: boolean;
	togglePlay: () => void;
	lottieRef: React.RefObject<LottieRefCurrentProps>;
}

/**
 * Props for the TimelineSlider component
 */
export interface TimelineSliderProps {
	progress: number;
	currentTime: number;
	duration: number;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Props for the TimeDisplay component
 */
export interface TimeDisplayProps {
	currentTime: number;
	duration: number;
	formatTime: (time: number) => string;
}

/**
 * Props for the PlayButtonTimeLine component
 */
export interface PlayButtonTimeLineProps {
	audioSrc: string;
	startTime?: number;
	endTime?: number;
	name?: string;
	onChange?: (state: Partial<AudioPlayerState>) => void;
	value?: Partial<AudioPlayerState>;
	className?: string;
}

/**
 * Ref methods exposed by PlayButtonTimeLine
 */
export interface PlayButtonTimeLineHandle {
	play: () => void;
	pause: () => void;
	getCurrentTime: () => number;
	isPlaying: () => boolean;
}
