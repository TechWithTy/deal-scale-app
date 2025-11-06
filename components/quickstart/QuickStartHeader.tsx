"use client";

import { HelpCircle } from "lucide-react";
import type { FC } from "react";

interface QuickStartHeaderProps {
	readonly onOpenWalkthrough: () => void;
}

const QuickStartHeader: FC<QuickStartHeaderProps> = ({ onOpenWalkthrough }) => (
	<div className="relative mb-8 text-center">
		<h1 className="mb-2 font-bold text-3xl text-foreground">Quick Start</h1>
		<p className="text-lg text-muted-foreground">
			Get up and running in 5 minutes or less
		</p>
		<button
			type="button"
			onClick={() => {
				if (typeof window !== "undefined") {
					window.dispatchEvent(new Event("dealScale:helpFab:show"));
				}
			}}
			className="absolute top-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-muted-foreground transition hover:bg-muted"
		>
			<HelpCircle className="h-5 w-5" />
		</button>
	</div>
);

export default QuickStartHeader;
