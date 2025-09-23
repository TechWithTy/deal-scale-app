import { Wifi, WifiOff } from "lucide-react";

interface OnlineStatusProps {
	isOnline: boolean;
}

export const OnlineStatus = ({ isOnline }: OnlineStatusProps) => (
	<div className="flex items-center gap-1">
		{isOnline ? (
			<Wifi className="h-4 w-4 text-success" />
		) : (
			<WifiOff className="h-4 w-4 text-muted-foreground" />
		)}
		<span className="text-muted-foreground text-xs">
			{isOnline ? "Online" : "Offline"}
		</span>
	</div>
);
