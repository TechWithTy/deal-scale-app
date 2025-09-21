import React from "react";
import type { Player } from "../realtime/WebSocketProvider";
import { getProfileHref } from "./utils";
import { cn } from "@root/lib/_utils";

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
				"truncate font-semibold transition-colors duration-smooth",
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
					className="text-inherit underline decoration-dotted underline-offset-2 hover:decoration-solid"
				>
					{player.username}
				</a>
			) : (
				player.username
			)}
		</h3>
	);
};
