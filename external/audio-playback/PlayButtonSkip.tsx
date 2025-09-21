"use client";

import playAnimation from "@/public/lottie/playButton.json";
import Lottie from "lottie-react";
import type { LottieRefCurrentProps } from "lottie-react";
import React, { useState, useEffect, useRef } from "react";

export interface PlayButtonSkipProps {
	audioSrc: string;
	startTime?: number; // optional, seconds offset
	endTime?: number; // optional, seconds offset
	onNextCall: () => void;
	onPrevCall: () => void;
	isNextDisabled: boolean;
	isPrevDisabled: boolean;
	title: string;
}

export function PlayButtonSkip({
	audioSrc,
	startTime = 0,
	endTime,
	onNextCall,
	onPrevCall,
	isNextDisabled,
	isPrevDisabled,
	title,
}: PlayButtonSkipProps) {
	const defaultAudio = "/calls/example-call-yt.mp3";
	const isValidAudio = (src: string) => /\.(mp3|wav|ogg)$/i.test(src || "");
	const src = isValidAudio(audioSrc) ? audioSrc : defaultAudio;

	const [isPlaying, setIsPlaying] = useState(false);
	const [audioError, setAudioError] = useState<string | null>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const lottieRef = useRef<LottieRefCurrentProps | null>(null);
	const [progress, setProgress] = useState(0); // 0..1 within the visible window
	const [duration, setDuration] = useState(0); // full audio duration in seconds
	const [dragging, setDragging] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);

	const rangeStart = Math.max(0, startTime || 0);
	const explicitEnd =
		typeof endTime === "number" && Number.isFinite(endTime)
			? endTime
			: undefined;
	const hasEnd = typeof explicitEnd === "number" && explicitEnd > rangeStart;
	const effectiveRangeEnd: number = hasEnd
		? (explicitEnd as number)
		: Math.max(typeof duration === "number" ? duration : 0, rangeStart);

	const clamp = (v: number, min: number, max: number) =>
		Math.max(min, Math.min(max, v));
	const fmt = (sec: number) => {
		if (!Number.isFinite(sec) || sec < 0) sec = 0;
		const m = Math.floor(sec / 60);
		const s = Math.floor(sec % 60);
		return `${m}:${s.toString().padStart(2, "0")}`;
	};

	const togglePlay = () => {
		const el = audioRef.current;
		if (!el) return;
		if (isPlaying) {
			el.pause();
			lottieRef.current?.pause();
		} else {
			void el.play();
			lottieRef.current?.play();
		}
		setIsPlaying(!isPlaying);
	};

	useEffect(() => {
		const el = audioRef.current;
		if (!el) return;
		try {
			el.currentTime = Math.max(0, startTime || 0);
			setCurrentTime(el.currentTime);
		} catch {}
	}, [startTime]);

	// keep progress updated and clamp playback to endTime if provided
	useEffect(() => {
		const el = audioRef.current;
		if (!el) return;

		const onTimeUpdate = () => {
			const cur = el.currentTime;
			if (hasEnd && cur >= effectiveRangeEnd) {
				el.pause();
				lottieRef.current?.pause();
				setIsPlaying(false);
				setProgress(1);
				setCurrentTime(effectiveRangeEnd);
				return;
			}
			const denom = Math.max(
				0.000001,
				(hasEnd ? effectiveRangeEnd : el.duration || 0) - rangeStart,
			);
			setProgress(Math.max(0, Math.min(1, (cur - rangeStart) / denom)));
			setCurrentTime(cur);
		};

		const onLoaded = () => setDuration(el.duration || 0);

		el.addEventListener("timeupdate", onTimeUpdate);
		el.addEventListener("loadedmetadata", onLoaded);
		return () => {
			el.removeEventListener("timeupdate", onTimeUpdate);
			el.removeEventListener("loadedmetadata", onLoaded);
		};
	}, [startTime, endTime]);

	const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
		const el = audioRef.current;
		if (!el) return;
		const rect = e.currentTarget.getBoundingClientRect();
		const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
		const pct = x / rect.width; // 0..1
		const rangeEnd: number = hasEnd
			? effectiveRangeEnd
			: duration || el.duration || rangeStart;
		const target = rangeStart + pct * Math.max(0, rangeEnd - rangeStart);
		try {
			el.currentTime = target;
		} catch {}
		if (!isPlaying) {
			// reflect UI immediately
			setProgress(pct);
			setCurrentTime(target);
		}
	};

	const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
		setDragging(true);
		handleSeek(e);
	};
	const handleDragMove = (e: MouseEvent) => {
		if (!dragging) return;
		const el = document.getElementById("playback-track");
		if (!el) return;
		const rect = el.getBoundingClientRect();
		const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
		const pct = x / rect.width;
		const audio = audioRef.current;
		if (!audio) return;
		const rangeEnd: number = hasEnd
			? effectiveRangeEnd
			: duration || audio.duration || rangeStart;
		const target = rangeStart + pct * Math.max(0, rangeEnd - rangeStart);
		try {
			audio.currentTime = target;
		} catch {}
		setProgress(pct);
		setCurrentTime(target);
	};
	const handleDragEnd = () => setDragging(false);

	useEffect(() => {
		if (!dragging) return;
		window.addEventListener("mousemove", handleDragMove);
		window.addEventListener("mouseup", handleDragEnd, { once: true });
		return () => {
			window.removeEventListener("mousemove", handleDragMove);
			window.removeEventListener("mouseup", handleDragEnd);
		};
	}, [dragging]);

	const handleKeySeek = (e: React.KeyboardEvent<HTMLDivElement>) => {
		const el = audioRef.current;
		if (!el) return;
		const step = 5; // seconds
		if (e.key === "ArrowRight") {
			const next = clamp(el.currentTime + step, rangeStart, effectiveRangeEnd);
			el.currentTime = next;
			setCurrentTime(next);
			setProgress(
				Math.max(
					0,
					Math.min(
						1,
						(next - rangeStart) /
							Math.max(0.000001, effectiveRangeEnd - rangeStart),
					),
				),
			);
			e.preventDefault();
		} else if (e.key === "ArrowLeft") {
			const prev = clamp(el.currentTime - step, rangeStart, effectiveRangeEnd);
			el.currentTime = prev;
			setCurrentTime(prev);
			setProgress(
				Math.max(
					0,
					Math.min(
						1,
						(prev - rangeStart) /
							Math.max(0.000001, effectiveRangeEnd - rangeStart),
					),
				),
			);
			e.preventDefault();
		}
	};

	return (
		<div className="flex w-full flex-col items-center gap-1 py-1">
			{audioError && (
				<div className="text-[10px] text-red-500">{audioError}</div>
			)}

			<h2
				className="max-w-full truncate text-center text-[11px] font-semibold leading-none text-foreground"
				title={title}
			>
				{title}
			</h2>

			<div className="flex items-center gap-3">
				<button
					onClick={onPrevCall}
					type="button"
					disabled={isPrevDisabled}
					className={`p-2 text-xs ${isPrevDisabled ? "cursor-not-allowed opacity-50" : ""}`}
				>
					⏮ Prev
				</button>

				<div
					onClick={togglePlay}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							togglePlay();
						}
					}}
					role="button"
					tabIndex={0}
					className={`relative flex h-[52px] w-[52px] cursor-pointer items-center justify-center rounded-full p-2 transition-all duration-300 ${
						isPlaying ? "bg-red-500/50" : "bg-green-500"
					}`}
				>
					<Lottie
						animationData={playAnimation}
						loop
						autoplay={false}
						lottieRef={lottieRef}
						style={{ height: 36, width: 36 }}
					/>
				</div>

				<button
					onClick={onNextCall}
					disabled={isNextDisabled}
					type="button"
					className={`p-2 text-xs ${isNextDisabled ? "cursor-not-allowed opacity-50" : ""}`}
				>
					⏭ Next
				</button>
			</div>

			{/* Timeline (always visible) with time labels */}
			<div className="mt-2 w-full">
				<div className="mb-1 flex items-center justify-between text-[10px] text-muted-foreground">
					<span
						className="rounded border border-border bg-card/70 px-1.5 py-0.5"
						aria-label="Current time"
					>
						{fmt(currentTime)}
					</span>
					<span
						className="rounded border border-border bg-card/70 px-1.5 py-0.5"
						aria-label="End time"
					>
						{fmt(effectiveRangeEnd)}
					</span>
				</div>
				<div
					id="playback-track"
					className="relative h-3 w-full cursor-pointer rounded-md border border-border bg-muted/40 shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					onClick={handleSeek}
					onMouseDown={handleDragStart}
					onKeyDown={handleKeySeek}
					tabIndex={0}
					role="slider"
					aria-label="Seek through audio"
					aria-valuemin={0}
					aria-valuemax={100}
					aria-valuenow={Math.round(progress * 100)}
					aria-valuetext={`${fmt(rangeStart + progress * Math.max(0, effectiveRangeEnd - rangeStart))} of ${fmt(effectiveRangeEnd)}`}
					title="Seek"
				>
					{/* Filled progress (before the thumb) */}
					<div
						className="absolute left-0 top-0 h-full rounded-md bg-primary transition-[width] duration-150"
						style={{ width: `${Math.max(0, Math.min(100, progress * 100))}%` }}
					/>
					{/* Thumb */}
					<div
						className="absolute top-1/2 -translate-y-1/2 h-4 w-4 -translate-x-1/2 rounded-full border border-border bg-primary shadow ring-2 ring-ring"
						style={{ left: `${Math.max(0, Math.min(100, progress * 100))}%` }}
					/>
				</div>
			</div>

			<audio
				ref={audioRef}
				src={src}
				onError={() =>
					setAudioError("Audio file could not be loaded or is not supported.")
				}
				preload="auto"
				className="hidden"
			>
				<track kind="captions" srcLang="en" label="English captions" />
			</audio>
		</div>
	);
}
