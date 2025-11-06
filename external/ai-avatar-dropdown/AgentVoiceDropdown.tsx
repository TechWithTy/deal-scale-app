"use client";
/**
 * AgentVoiceDropdown: Enhanced dropdown with agent profiles, status, and voice preview
 * Supports audio playback with play/stop toggle and visual feedback
 */

import * as React from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../shadcn-table/src/components/ui/select";
import { Button } from "../shadcn-table/src/components/ui/button";
import { Play, Square, Bot, Volume2, Loader2 } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "../shadcn-table/src/components/ui/tooltip";
import { Badge } from "../shadcn-table/src/components/ui/badge";

// Utility function for className merging
function cn(...classes: (string | boolean | undefined)[]) {
	return classes.filter(Boolean).join(" ");
}

export type AgentOption = {
	id: string;
	name: string;
	status?: "active" | "away" | "offline" | "online";
	imageUrl?: string;
	voiceUrl?: string; // audio preview URL
	description?: string;
	capabilities?: string[]; // e.g. ["Calls", "Texts", "DMs"]
	agentType?: string; // e.g. "Voice Agent"
};

export interface AgentVoiceDropdownProps {
	value?: string;
	onChange: (value: string) => void;
	options: AgentOption[];
	placeholder?: string;
}

export default function AgentVoiceDropdown({
	value,
	onChange,
	options,
	placeholder = "Select an agent",
}: AgentVoiceDropdownProps) {
	const [playingId, setPlayingId] = React.useState<string | null>(null);
	const [loadingId, setLoadingId] = React.useState<string | null>(null);
	const audioRef = React.useRef<HTMLAudioElement | null>(null);

	const current = options.find((o) => o.id === value);

	const handleTogglePlay = React.useCallback(
		(agent?: AgentOption, event?: React.MouseEvent) => {
			if (event) {
				event.preventDefault();
				event.stopPropagation();
			}

			if (!agent?.voiceUrl) return;
			const same = playingId === agent.id;

			// Stop current audio
			if (audioRef.current) {
				audioRef.current.pause();
				audioRef.current.currentTime = 0;
				audioRef.current = null;
			}

			// If clicking the same agent, just stop
			if (same) {
				setPlayingId(null);
				setLoadingId(null);
				return;
			}

			// Start loading new audio
			setLoadingId(agent.id);

			const audio = new Audio(agent.voiceUrl);
			audioRef.current = audio;

			// Event handlers
			audio.onloadeddata = () => {
				setLoadingId(null);
			};

			audio.onended = () => {
				setPlayingId(null);
				setLoadingId(null);
			};

			audio.onerror = () => {
				setPlayingId(null);
				setLoadingId(null);
				console.error("Error loading audio for agent:", agent.name);
			};

			// Start playback
			audio
				.play()
				.then(() => {
					setPlayingId(agent.id);
					setLoadingId(null);
				})
				.catch((error) => {
					console.error("Error playing audio:", error);
					setPlayingId(null);
					setLoadingId(null);
				});
		},
		[playingId],
	);

	React.useEffect(
		() => () => {
			if (audioRef.current) {
				audioRef.current.pause();
				audioRef.current = null;
			}
		},
		[],
	);

	// Helper to get status color
	const getStatusColor = (status?: string) => {
		if (status === "active" || status === "online") {
			return "bg-green-500";
		}
		if (status === "away") {
			return "bg-yellow-500";
		}
		return "bg-gray-400";
	};

	return (
		<div className="w-full">
			<TooltipProvider delayDuration={150}>
				<Select onValueChange={onChange} value={value}>
					<SelectTrigger className="relative overflow-visible">
						<div className="flex w-full items-center justify-between gap-3">
							<div className="flex min-w-0 flex-1 items-center gap-2 truncate text-left">
								{current?.imageUrl && (
									<div className="relative">
										<img
											src={current.imageUrl}
											alt={current.name}
											className="h-7 w-7 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
										/>
										{current.status && (
											<span
												className={cn(
													"-bottom-0.5 -right-0.5 absolute h-2.5 w-2.5 rounded-full border-2 border-white dark:border-gray-900",
													getStatusColor(current.status),
												)}
											/>
										)}
									</div>
								)}
								{current ? (
									<span className="truncate font-medium">{current.name}</span>
								) : (
									<span className="text-muted-foreground">{placeholder}</span>
								)}
							</div>
							{current?.voiceUrl && (
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											type="button"
											size="sm"
											variant={
												playingId === current?.id ? "default" : "outline"
											}
											onClick={(e) => handleTogglePlay(current, e)}
											className={cn(
												"ml-1 h-8 w-8 shrink-0 p-0",
												playingId === current?.id &&
													"bg-blue-600 text-white hover:bg-blue-700",
												loadingId === current?.id && "cursor-wait",
											)}
											aria-label={
												playingId === current?.id
													? "Stop preview"
													: "Play preview"
											}
											disabled={loadingId === current?.id}
										>
											{loadingId === current?.id ? (
												<Loader2 className="h-4 w-4 animate-spin" />
											) : playingId === current?.id ? (
												<Square className="h-4 w-4 fill-current" />
											) : (
												<Play className="h-4 w-4" />
											)}
										</Button>
									</TooltipTrigger>
									<TooltipContent side="top">
										<p className="text-xs">
											{playingId === current?.id
												? "Click to stop voice preview"
												: "Click to preview agent's voice"}
										</p>
									</TooltipContent>
								</Tooltip>
							)}
						</div>
					</SelectTrigger>
					<SelectContent className="z-50 max-h-80">
						{options.map((o) => (
							<SelectItem key={o.id} value={o.id}>
								<div className="flex w-full items-center justify-between gap-3 py-1">
									{/* Left: Avatar + Name + Status */}
									<div className="flex min-w-0 flex-1 items-center gap-3">
										{/* Avatar with Status Badge */}
										{o.imageUrl && (
											<div className="relative">
												<img
													src={o.imageUrl}
													alt={o.name}
													className="h-8 w-8 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
												/>
												{o.status && (
													<span
														className={cn(
															"-bottom-0.5 -right-0.5 absolute h-2.5 w-2.5 rounded-full border-2 border-white dark:border-gray-900",
															getStatusColor(o.status),
														)}
													/>
												)}
											</div>
										)}

										{/* Name */}
										<div className="min-w-0 flex-1">
											<p className="truncate font-medium text-sm">{o.name}</p>
											{o.agentType && (
												<p className="truncate text-muted-foreground text-xs">
													{o.agentType}
												</p>
											)}
										</div>
									</div>

									{/* Right: Play Button */}
									{o.voiceUrl && (
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													type="button"
													size="sm"
													variant={playingId === o.id ? "default" : "ghost"}
													onMouseDown={(e) => e.preventDefault()}
													onClick={(e) => handleTogglePlay(o, e)}
													className={cn(
														"h-8 w-8 shrink-0 p-0",
														playingId === o.id &&
															"bg-blue-600 text-white hover:bg-blue-700",
														loadingId === o.id && "cursor-wait opacity-70",
													)}
													aria-label={
														playingId === o.id
															? "Stop preview"
															: "Play voice preview"
													}
													disabled={loadingId === o.id}
												>
													{loadingId === o.id ? (
														<Loader2 className="h-4 w-4 animate-spin" />
													) : playingId === o.id ? (
														<Square className="h-4 w-4 fill-current" />
													) : (
														<Play className="h-4 w-4" />
													)}
												</Button>
											</TooltipTrigger>
											<TooltipContent side="left" className="z-[9999]">
												<div className="max-w-xs space-y-2">
													<div className="flex items-start gap-2">
														<Volume2 className="h-4 w-4 shrink-0 text-blue-500" />
														<div className="min-w-0">
															<p className="font-medium text-sm leading-tight">
																{playingId === o.id
																	? "Playing voice preview"
																	: "Preview agent voice"}
															</p>
															{o.description && (
																<p className="mt-1 line-clamp-3 text-muted-foreground text-xs">
																	{o.description}
																</p>
															)}
															{o.capabilities && o.capabilities.length > 0 && (
																<div className="mt-2 flex flex-wrap gap-1">
																	{o.capabilities.map((cap) => (
																		<Badge
																			key={cap}
																			variant="secondary"
																			className="font-medium text-[10px]"
																		>
																			{cap}
																		</Badge>
																	))}
																</div>
															)}
														</div>
													</div>
													<p className="text-muted-foreground text-xs italic">
														{playingId === o.id
															? "Click again to stop"
															: "Click to hear how this agent sounds"}
													</p>
												</div>
											</TooltipContent>
										</Tooltip>
									)}
								</div>
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</TooltipProvider>
		</div>
	);
}
