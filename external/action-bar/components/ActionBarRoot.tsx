"use client";

import type { FC } from "react";
import CommandPalette from "./command/CommandPalette";
import { useCommandPalette } from "./providers/CommandPaletteProvider";

const ActionBarRoot: FC = () => {
	const { isOpen, setOpen, commands, initialQuery, variant } =
		useCommandPalette();
	return (
		<CommandPalette
			isOpen={isOpen}
			onOpenChange={setOpen}
			commands={commands}
			initialQuery={initialQuery}
			variant={variant}
		/>
	);
};

export default ActionBarRoot;
