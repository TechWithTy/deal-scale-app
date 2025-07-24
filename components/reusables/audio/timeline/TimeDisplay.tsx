import type React from "react";
import type { TimeDisplayProps } from "./types";

const TimeDisplay: React.FC<TimeDisplayProps> = ({
	currentTime,
	duration,
	formatTime,
}) => {
	return (
		<div className="flex justify-between text-muted-foreground text-xs">
			<span>{formatTime(currentTime)}</span>
			<span>{formatTime(duration)}</span>
		</div>
	);
};

export { TimeDisplay };
