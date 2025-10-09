"use client";

import { HelpCircle } from "lucide-react";
import { type FC } from "react";

interface QuickStartHeaderProps {
	readonly onOpenWalkthrough: () => void;
}

const QuickStartHeader: FC<QuickStartHeaderProps> = ({ onOpenWalkthrough }) => (
	<div className="relative mb-8 text-center">
		<h1 className="mb-2 text-3xl font-bold text-foreground">Quick Start</h1>
		<p className="text-lg text-muted-foreground">
			Get up and running in minutes. Choose how you’d like to begin.
		</p>
		<button
			type="button"
			onClick={onOpenWalkthrough}
			className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-muted-foreground transition hover:bg-muted"
		>
			<HelpCircle className="h-5 w-5" />
		</button>
	</div>
);

export default QuickStartHeader;
