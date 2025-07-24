import type React from "react";
import type { TimelineSliderProps } from "./types";

const TimelineSlider: React.FC<TimelineSliderProps> = ({
	progress,
	currentTime,
	duration,
	onChange,
}) => {
	return (
		<div className="w-full">
			<input
				type="range"
				min="0"
				max={duration || 100}
				value={currentTime}
				onChange={onChange}
				className="h-2 w-full appearance-none rounded-lg bg-gray-200 accent-primary"
				style={{
					background: `linear-gradient(to right, #000 ${progress}%, #e5e7eb ${progress}%)`,
					cursor: "pointer",
				}}
				aria-label="Audio timeline"
			/>
		</div>
	);
};

export { TimelineSlider };
