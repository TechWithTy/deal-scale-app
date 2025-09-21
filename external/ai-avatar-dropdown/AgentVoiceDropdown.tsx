"use client";

import * as React from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../shadcn-table/src/components/ui/select";
import { Button } from "../shadcn-table/src/components/ui/button";
import { Play, Square, Bot } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "../shadcn-table/src/components/ui/tooltip";
import { Badge } from "../shadcn-table/src/components/ui/badge";

export type AgentOption = {
	id: string;
	name: string;
	status?: "active" | "away" | "offline";
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
	const audioRef = React.useRef<HTMLAudioElement | null>(null);

	const current = options.find((o) => o.id === value);

	const handleTogglePlay = React.useCallback(
		(agent?: AgentOption) => {
			if (!agent?.voiceUrl) return;
			const same = playingId === agent.id;

			// Stop current
			if (audioRef.current) {
				audioRef.current.pause();
				audioRef.current.currentTime = 0;
			}

			if (same) {
				setPlayingId(null);
				audioRef.current = null;
				return;
			}

			const a = new Audio(agent.voiceUrl);
			audioRef.current = a;
			a.onended = () => setPlayingId(null);
			a.play()
				.then(() => setPlayingId(agent.id))
				.catch(() => setPlayingId(null));
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

	return (
		<div className="w-full">
			<TooltipProvider delayDuration={150}>
				<Select onValueChange={onChange} value={value}>
					<SelectTrigger className="overflow-visible relative">
						<div className="flex w-full items-center justify-between gap-3">
							<div className="min-w-0 flex-1 truncate text-left">
								{current ? (
									<span className="truncate">{current.name}</span>
								) : (
									<span className="text-muted-foreground">{placeholder}</span>
								)}
							</div>
							{current?.imageUrl && (
								<Tooltip>
									<TooltipTrigger asChild>
										<img
											src={current.imageUrl}
											alt={current.name}
											className="h-6 w-6 rounded-full object-cover shrink-0"
										/>
									</TooltipTrigger>
									<TooltipContent side="top" className="z-50 max-w-xs">
										<div className="flex items-start gap-2">
											<Bot className="h-4 w-4 shrink-0 text-muted-foreground" />
											<div className="min-w-0">
												<p className="text-sm font-medium leading-tight flex items-center gap-2">
													<span className="truncate">{current.name}</span>
													{current.agentType && (
														<Badge
															variant="secondary"
															className="text-[10px] py-0 px-1 whitespace-nowrap"
														>
															{current.agentType}
														</Badge>
													)}
												</p>
												<p className="mt-0.5 text-[10px] text-muted-foreground/80">
													ID: {current.id}
												</p>
												{current.description && (
													<p className="mt-1 text-xs text-muted-foreground line-clamp-4">
														{current.description}
													</p>
												)}
												{current.capabilities &&
													current.capabilities.length > 0 && (
														<div className="mt-2 flex flex-wrap gap-1">
															{current.capabilities.map((cap) => (
																<Badge
																	key={cap}
																	variant="secondary"
																	className="text-[10px] font-medium"
																>
																	{cap}
																</Badge>
															))}
														</div>
													)}
											</div>
										</div>
									</TooltipContent>
								</Tooltip>
							)}
							{current?.voiceUrl && (
								<Button
									type="button"
									size="icon"
									variant="outline"
									onClick={(e) => {
										e.stopPropagation();
										handleTogglePlay(current);
									}}
									className="ml-1 shrink-0"
									aria-label={
										playingId === current?.id ? "Stop preview" : "Play preview"
									}
								>
									{playingId === current?.id ? (
										<Square className="h-4 w-4" />
									) : (
										<Play className="h-4 w-4" />
									)}
								</Button>
							)}
						</div>
					</SelectTrigger>
					<SelectContent className="z-50">
						{options.map((o) => (
							<Tooltip key={o.id}>
								<TooltipTrigger asChild>
									<SelectItem value={o.id}>
										<div className="flex w-full items-center justify-between gap-3">
											<div className="flex min-w-0 items-center gap-2">
												<span className="truncate">{o.name}</span>
												<span
													className={`h-2 w-2 rounded-full ${
														o.status === "active"
															? "bg-green-500"
															: o.status === "away"
																? "bg-yellow-500"
																: "bg-gray-400"
													}`}
													title={o.status}
												/>
											</div>
											<div className="flex items-center gap-2">
												{o.imageUrl && (
													<Tooltip>
														<TooltipTrigger asChild>
															<img
																src={o.imageUrl}
																alt={o.name}
																className="h-6 w-6 rounded-full object-cover shrink-0"
															/>
														</TooltipTrigger>
														<TooltipContent
															side="left"
															className="z-50 max-w-xs"
														>
															<div className="flex items-start gap-2">
																<Bot className="h-4 w-4 shrink-0 text-muted-foreground" />
																<div className="min-w-0">
																	<p className="text-sm font-medium leading-tight flex items-center gap-2">
																		<span className="truncate">{o.name}</span>
																		{o.agentType && (
																			<Badge
																				variant="secondary"
																				className="text-[10px] py-0 px-1 whitespace-nowrap"
																			>
																				{o.agentType}
																			</Badge>
																		)}
																	</p>
																	<p className="mt-0.5 text-[10px] text-muted-foreground/80">
																		ID: {o.id}
																	</p>
																	{o.description && (
																		<p className="mt-1 text-xs text-muted-foreground line-clamp-4">
																			{o.description}
																		</p>
																	)}
																	{o.capabilities &&
																		o.capabilities.length > 0 && (
																			<div className="mt-2 flex flex-wrap gap-1">
																				{o.capabilities.map((cap) => (
																					<Badge
																						key={cap}
																						variant="secondary"
																						className="text-[10px] font-medium"
																					>
																						{cap}
																					</Badge>
																				))}
																			</div>
																		)}
																</div>
															</div>
														</TooltipContent>
													</Tooltip>
												)}
												{o.voiceUrl && (
													<Button
														type="button"
														size="icon"
														variant="outline"
														onMouseDown={(e) => e.preventDefault()}
														onClick={(e) => {
															e.stopPropagation();
															handleTogglePlay(o);
														}}
														aria-label={
															playingId === o.id
																? "Stop preview"
																: "Play preview"
														}
														className="shrink-0"
													>
														{playingId === o.id ? (
															<Square className="h-4 w-4" />
														) : (
															<Play className="h-4 w-4" />
														)}
													</Button>
												)}
											</div>
										</div>
									</SelectItem>
								</TooltipTrigger>
								<TooltipContent side="right" className="z-50 max-w-xs">
									<div className="flex items-start gap-2">
										<Bot className="h-4 w-4 shrink-0 text-muted-foreground" />
										<div className="min-w-0">
											<p className="text-sm font-medium leading-tight flex items-center gap-2">
												<span className="truncate">{o.name}</span>
												{o.agentType && (
													<Badge
														variant="secondary"
														className="text-[10px] py-0 px-1 whitespace-nowrap"
													>
														{o.agentType}
													</Badge>
												)}
											</p>
											<p className="mt-0.5 text-[10px] text-muted-foreground/80">
												ID: {o.id}
											</p>
											{o.description && (
												<p className="mt-1 text-xs text-muted-foreground line-clamp-4">
													{o.description}
												</p>
											)}
											{o.capabilities && o.capabilities.length > 0 && (
												<div className="mt-2 flex flex-wrap gap-1">
													{o.capabilities.map((cap) => (
														<Badge
															key={cap}
															variant="secondary"
															className="text-[10px] font-medium"
														>
															{cap}
														</Badge>
													))}
												</div>
											)}
										</div>
									</div>
								</TooltipContent>
							</Tooltip>
						))}
					</SelectContent>
				</Select>
			</TooltipProvider>
		</div>
	);
}
