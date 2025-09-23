import type { Player } from "../realtime/WebSocketProvider";

export const formatScore = (score: number) => score.toLocaleString();

export const buildTopRowExtras = (player: Player) => {
	const isTop10 = player.rank <= 10;
	const isTop3 = player.rank <= 3;
	return isTop3
		? "bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border-primary/40 ring-2 ring-primary/25 shadow-lg"
		: isTop10
			? "bg-primary/5 border-primary/30 ring-1 ring-primary/15 shadow"
			: "";
};

export const buildRequestButtonLabel = (creditType: string) => {
	const type = creditType && creditType.trim().length > 0 ? creditType : "lead";
	return `Requesting ${type} credit`;
};

export const getProfileHref = (player: Player) => {
	const url = player.profileUrl;
	if (!url) return undefined;
	return url.startsWith("https://") ? url : undefined;
};
