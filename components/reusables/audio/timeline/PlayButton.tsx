import { forwardRef } from "react";
import Lottie from "lottie-react";
import playAnimation from "@/public/lottie/playButton.json";
import type { PlayButtonProps } from "./types";

const PlayButton = forwardRef<HTMLButtonElement, PlayButtonProps>(
	({ isPlaying, togglePlay, lottieRef }, ref) => {
		return (
			<button
				ref={ref}
				type="button"
				onClick={togglePlay}
				className="rounded-full bg-primary p-2 text-primary-foreground transition-colors hover:bg-primary/90"
				aria-label={isPlaying ? "Pause" : "Play"}
			>
				<Lottie
					lottieRef={lottieRef}
					animationData={playAnimation}
					loop={false}
					autoplay={false}
					style={{ width: 32, height: 32 }}
				/>
			</button>
		);
	},
);

PlayButton.displayName = "PlayButton";

export { PlayButton };
