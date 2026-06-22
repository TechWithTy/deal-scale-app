"use client";

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
	</div>
);

export default QuickStartHeader;
