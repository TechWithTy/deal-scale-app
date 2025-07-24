import React from "react";
import { useEffect, useRef, useState } from "react";

export interface AudioDropdownOption {
	label: string;
	value: string;
	audioUrl?: string; // Optional: mp3 url to play when selected
	category?: string; // e.g., 'ElevenLabs', 'Vapi', 'General', etc.
}

interface AudioDropdownProps {
	options: AudioDropdownOption[];
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
	placeholder?: string;
}

/**
 * AudioDropdown: A dropdown that allows selection and plays an mp3 for each option.
 */

export const AudioDropdown: React.FC<AudioDropdownProps> = ({
	options,
	value,
	onChange,
	disabled = false,
	placeholder = "Select an option...",
}) => {
	const [open, setOpen] = useState(false);
	// ! playingIndex is now string|null to match option.value
	const [playingIndex, setPlayingIndex] = useState<string | null>(null);
	const [audioPaused, setAudioPaused] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});

	// Close dropdown on outside click
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setOpen(false);
			}
		};
		if (open) {
			document.addEventListener("mousedown", handleClickOutside);
			return () =>
				document.removeEventListener("mousedown", handleClickOutside);
		}
	}, [open]);

	const handleSelect = (val: string) => {
		onChange(val);
		setOpen(false);
	};

	const handlePlay = (value: string, audioUrl: string | undefined) => {
		if (!audioUrl) return;

		// Pause any currently playing audio
		if (playingIndex && playingIndex !== value) {
			const prevAudio = playingIndex
				? audioRefs.current[playingIndex]
				: undefined;
			if (prevAudio) {
				prevAudio.pause();
				prevAudio.currentTime = 0;
			}
		}

		setPlayingIndex(value);
		setAudioPaused(false);
		// Play audio immediately
		setTimeout(() => {
			const audio = audioRefs.current[value];
			if (audio) {
				audio.currentTime = 0;
				audio.play();
			}
		}, 0);
	};

	return (
		<div ref={dropdownRef} className="relative w-full">
			<button
				type="button"
				className="w-full rounded-md border bg-background px-3 py-2 text-left text-sm focus:outline-none focus:ring-2 focus:ring-primary"
				onClick={() => setOpen((prev) => !prev)}
				disabled={disabled}
			>
				{options.find((opt) => opt.value === value)?.label || placeholder}
			</button>
			{open &&
				(() => {
					// Group options by category (fallback to 'Other')
					const grouped = options.reduce<Record<string, AudioDropdownOption[]>>(
						(acc, opt) => {
							const cat = opt.category || "Other";
							if (!acc[cat]) acc[cat] = [];
							acc[cat].push(opt);
							return acc;
						},
						{},
					);
					return (
						<ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-background shadow-lg">
							{Object.entries(grouped).map(([category, opts]) => (
								<React.Fragment key={category}>
									<li className="sticky top-0 z-10 bg-muted/40 px-3 py-1 font-semibold text-muted-foreground text-xs">
										{category}
									</li>
									{opts.map((opt) => (
										<li
											key={opt.value}
											className={`flex cursor-pointer items-center justify-between px-3 py-2 hover:bg-primary/10 ${opt.value === value ? "bg-primary/20" : ""}`}
											aria-selected={opt.value === value}
											onClick={() => handleSelect(opt.value)}
											onKeyDown={(e) => {
												if (e.key === "Enter" || e.key === " ") {
													e.preventDefault();
													handleSelect(opt.value);
												}
											}}
										>
											<span>{opt.label}</span>
											{opt.audioUrl && (
												<button
													type="button"
													className="ml-2 rounded-full focus:outline-none"
													onClick={(e) => {
														e.stopPropagation();
														const audio = audioRefs.current[opt.value];
														if (playingIndex === opt.value) {
															if (audioPaused) {
																audio?.play();
																setAudioPaused(false);
															} else {
																audio?.pause();
																setAudioPaused(true);
															}
														} else {
															handlePlay(opt.value, opt.audioUrl);
														}
													}}
													aria-label={
														playingIndex === opt.value && !audioPaused
															? `Pause ${opt.label}`
															: `Play ${opt.label}`
													}
												>
													<span
														role="img"
														aria-label={
															playingIndex === opt.value && !audioPaused
																? "pause"
																: "play"
														}
													>
														{playingIndex === opt.value && !audioPaused
															? "⏸️"
															: "▶️"}
													</span>
													<audio
														ref={(el) => {
															if (el) {
																audioRefs.current[opt.value] = el;
															}
														}}
														src={opt.audioUrl}
														onEnded={() => {
															setPlayingIndex(null);
															setAudioPaused(false);
														}}
														preload="none"
														style={{ display: "none" }}
													>
														<track
															kind="captions"
															src=""
															label="No captions available"
														/>
													</audio>
												</button>
											)}
										</li>
									))}
								</React.Fragment>
							))}
						</ul>
					);
				})()}
		</div>
	);
};

export default AudioDropdown;
