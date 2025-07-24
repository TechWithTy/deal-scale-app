declare module "react-joyride" {
	import type { ComponentType, ReactNode } from "react";

	export interface Step {
		target: string;
		content: ReactNode;
		placement?: string;
		disableBeacon?: boolean;
		floaterProps?: Record<string, string>;
		spotlightPadding?: number;
		title?: string | ReactNode;
		styles?: Record<string, string>;
		[key: string]: string;
	}

	export interface Props {
		steps: Step[];
		run: boolean;
		continuous?: boolean;
		scrollToFirstStep?: boolean;
		showProgress?: boolean;
		showSkipButton?: boolean;
		callback?: (data: { status?: string; [key: string]: unknown }) => void; // More accurate callback type for Joyride

		// Removed index signature to allow correct typing for steps and other props
		// ! Do not add [key: string]: string; as it breaks non-string props like steps: Step[]
	}

	const Joyride: ComponentType<Props>;
	export default Joyride;
}
