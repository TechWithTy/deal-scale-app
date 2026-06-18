import { cn } from "@root/lib/_utils";
import React from "react";
import type { Player } from "../realtime/WebSocketProvider";
import { getProfileHref } from "./utils";

interface PlayerTitleProps {
	player: Player;
	isCurrentUser?: boolean;
	isTop10: boolean;
}

export const PlayerTitle: React.FC<PlayerTitleProps> = ({
	player,
	isCurrentUser = false,
	isTop10,
}) => {
	const profileHref = React.useMemo(() => getProfileHref(player), [player]);

	return (
		<h3
			className={cn(
				"min-w-0 max-w-full truncate font-semibold text-sm transition-colors duration-smooth sm:text-base",
				isCurrentUser
					? "text-primary"
					: "text-foreground group-hover:text-primary",
			)}
			title={player.username}
		>
			{isTop10 && profileHref ? (
				<a
					href={profileHref}
					target="_blank"
					rel="noopener noreferrer"
					className="block max-w-full truncate text-inherit underline decoration-dotted underline-offset-2 hover:decoration-solid"
				>
					{player.username}
				</a>
			) : (
				player.username
			)}
		</h3>
	);
};
