"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCommandPalette } from "@/external/action-bar/components/providers/CommandPaletteProvider";
import { PlaybackCell } from "@/external/audio-playback";
import { CloneModal } from "@/external/teleprompter-modal";
import { MinimalWheel } from "@/external/wheel-spinner";
import type { CallInfo } from "@/types/_dashboard/campaign";
import type { GetCallResponse } from "@/types/vapiAi/api/calls/get";
import { LeaderboardContainer } from "@ssf/components/leaderboard/LeaderboardContainer";
import { WebSocketProvider } from "@ssf/components/realtime/WebSocketProvider";
import {
	Highlighter,
	Home,
	Image as ImageIcon,
	ListOrdered,
	PlayCircle,
	Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";

export default function StorybookExternalPage() {
	// Minimal mock data for PlaybackCell
	// Note: We only use id, recordingUrl, startedAt, endedAt in the UI,
	// so we provide those and coerce the rest for typing.
	const buildCallResponse = (
		id: string,
		recordingUrl: string,
		startedAt: string,
		endedAt: string,
	): GetCallResponse => ({
		id,
		orgId: "org-demo",
		type: "webCall",
		phoneCallProvider: "twilio",
		phoneCallTransport: "pstn",
		status: "ended",
		endedReason: "customer-ended-call",
		messages: [],
		monitor: { listenUrl: "", controlUrl: "" },
		createdAt: startedAt,
		updatedAt: endedAt,
		startedAt,
		endedAt,
		cost: 0,
		costBreakdown: {
			transport: 0,
			stt: 0,
			llm: 0,
			tts: 0,
			vapi: 0,
			total: 0,
			llmPromptTokens: 0,
			llmCompletionTokens: 0,
			ttsCharacters: 0,
		},
		transcript: "",
		recordingUrl,
	});

	const mockCalls: CallInfo[] = [
		{
			callResponse: buildCallResponse(
				"Call A",
				"/calls/example-call-yt.mp3",
				new Date(Date.now() - 60_000).toISOString(),
				new Date().toISOString(),
			),
			contactId: "contact-1",
			campaignId: "campaign-1",
		},
		{
			callResponse: buildCallResponse(
				"Call B",
				"/calls/example-call-yt.mp3",
				new Date(Date.now() - 120_000).toISOString(),
				new Date(Date.now() - 60_000).toISOString(),
			),
			contactId: "contact-2",
			campaignId: "campaign-1",
		},
	];

	const [cloneOpen, setCloneOpen] = useState(false);

	const demoPrizes = [
		{ id: "p1", label: "10 Credits", weight: 2, color: "#6d28d9" },
		{ id: "p2", label: "Try Again", weight: 3, color: "#8b5cf6" },
		{ id: "p3", label: "25 Credits", weight: 1, color: "#d946ef" },
		{ id: "p4", label: "5 Credits", weight: 4, color: "#22c55e" },
	];

	const {
		registerDynamicCommands,
		setOpen,
		setInitialQuery,
		setVariant,
		isOpen,
		variant,
		setExternalUrlAttachments,
	} = useCommandPalette();

	// Highlight + Action Bar demo state
	const [highlightColor, setHighlightColor] = useState<string>("#fde047"); // yellow-300
	const [selectedText, setSelectedText] = useState<string>("");
	const [highlights, setHighlights] = useState<
		Array<{ id: string; text: string }>
	>([]);
	const highlightAreaRef = useRef<HTMLDivElement | null>(null);

	const highlightStyle = useMemo(
		() => ({ "--highlight-color": highlightColor }) as CSSProperties,
		[highlightColor],
	);

	const onSelectionChange = useCallback(() => {
		const sel = window.getSelection();
		if (sel) {
			const text = sel.toString().trim();
			setSelectedText(text);
		}
	}, []);

	useEffect(() => {
		const area = highlightAreaRef.current;
		if (area) {
			area.addEventListener("mouseup", onSelectionChange);
			area.addEventListener("keyup", onSelectionChange);
			return () => {
				area.removeEventListener("mouseup", onSelectionChange);
				area.removeEventListener("keyup", onSelectionChange);
			};
		}
	}, [onSelectionChange]);

	const addHighlight = useCallback(() => {
		if (selectedText) {
			const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
			setHighlights((prev) => [...prev, { id, text: selectedText }]);
		}
	}, [selectedText]);

	const removeHighlight = useCallback((id: string) => {
		setHighlights((prev) => prev.filter((h) => h.id !== id));
	}, []);

	const openActionBarWithSelection = useCallback(() => {
		if (selectedText) {
			setInitialQuery(selectedText);
			setOpen(true);
		} else {
			setOpen(true);
		}
	}, [selectedText, setInitialQuery, setOpen]);

	// Media popovers demo state
	const [imageOpen, setImageOpen] = useState(false);
	const [imageSrc, setImageSrc] = useState<string>(
		"https://place-hold.it/300x500/666/fff",
	);

	const [videoOpen, setVideoOpen] = useState(false);
	const [videoUrl, setVideoUrl] = useState<string>(
		"https://www.youtube.com/watch?v=ysz5S6PUM-U",
	);

	const youTubeId = useMemo(() => {
		try {
			const url = new URL(videoUrl);
			if (url.hostname.includes("youtube.com")) {
				return url.searchParams.get("v");
			}
			if (url.hostname.includes("youtu.be")) {
				return url.pathname.replace("/", "");
			}
		} catch {
			/* ignore */
		}
		return null;
	}, [videoUrl]);

	useEffect(() => {
		registerDynamicCommands([
			{
				id: "sb-go-home",
				group: "Action Bar Demo",
				label: "Go Home",
				action: () => {
					window.location.href = "/";
				},
				icon: <Home className="h-4 w-4" />,
				shortcut: "G H",
			},
			{
				id: "sb-go-leaderboard",
				group: "Action Bar Demo",
				label: "Go Leaderboard",
				action: () => {
					window.location.href = "/app/dashboard/leaderboard";
				},
				icon: <ListOrdered className="h-4 w-4" />,
				shortcut: "G L",
			},
			// Media preview commands that open the modals using payload
			{
				id: "sb-media-image",
				group: "Action Bar Demo",
				label: "Show Image (Preview)",
				hint: "Opens the image modal with preview src",
				icon: <ImageIcon className="h-4 w-4" />,
				preview: {
					type: "image",
					src: imageSrc,
					placeholder: "https://place-hold.it/300x500/666/fff",
					alt: "Image preview",
				},
				action: (payload) => {
					const src = payload?.media?.src ?? imageSrc;
					setImageSrc(src);
					setImageOpen(true);
				},
			},
			{
				id: "sb-media-youtube",
				group: "Action Bar Demo",
				label: "Play YouTube (Preview)",
				hint: "Opens the video modal with YouTube URL",
				icon: <PlayCircle className="h-4 w-4" />,
				preview: {
					type: "youtube",
					src: videoUrl,
					placeholder: "https://place-hold.it/300x500/666/fff",
					alt: "YouTube preview",
				},
				action: (payload) => {
					const media = payload?.media;
					if (media?.type === "youtube") {
						const id = media.id;
						if (id) {
							setVideoUrl(`https://www.youtube.com/watch?v=${id}`);
						} else if (media.src) {
							setVideoUrl(media.src);
						}
						setVideoOpen(true);
					}
				},
			},
		]);
	}, [registerDynamicCommands, imageSrc, videoUrl]);

	return (
		<main className="mx-auto max-w-2xl space-y-8 p-6" style={highlightStyle}>
			<section className="space-y-3 rounded-md border p-4">
				<h1 className="font-semibold text-xl">Audio Playback (External)</h1>
				<p className="text-muted-foreground text-sm">
					Test the reusable playback UI with Next/Prev, Lottie play/pause, and
					timeline seek.
				</p>
				<div className="rounded-md border p-3">
					<PlaybackCell callInformation={mockCalls} />
				</div>
			</section>

			<section className="space-y-3 rounded-md border p-4">
				<h2 className="font-semibold text-lg">Teleprompter Modal (External)</h2>
				<p className="text-muted-foreground text-sm">
					Click the button to open the voice recording modal with teleprompter.
				</p>
				<button
					type="button"
					onClick={() => setCloneOpen(true)}
					className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
				>
					Open Teleprompter Modal
				</button>

				<CloneModal
					open={cloneOpen}
					onClose={() => setCloneOpen(false)}
					onSave={(blob) => {
						// For demo purposes, just close on save.
						console.log("Saved audio blob:", blob);
						setCloneOpen(false);
					}}
				/>
			</section>

			<section className="space-y-3 rounded-md border p-4">
				<h2 className="font-semibold text-lg">Prize Wheel (External)</h2>
				<p className="text-muted-foreground text-sm">
					Spin the wheel to test prize distribution, countdown lock, and modal
					behavior.
				</p>
				<MinimalWheel
					cadence="hourly"
					userId="storybook-user"
					prizes={demoPrizes}
				/>
			</section>

			<section className="space-y-3 rounded-md border p-4">
				<h2 className="font-semibold text-lg">Live Leaderboard (Embedded)</h2>
				<p className="text-muted-foreground text-sm">
					Directly rendering the score-streak-flow React components.
				</p>
				<div className="rounded-md border">
					<WebSocketProvider>
						<LeaderboardContainer />
					</WebSocketProvider>
				</div>
			</section>

			<section className="space-y-3 rounded-md border p-4">
				<h2 className="font-semibold text-lg">
					Action Bar (Global Command Palette)
				</h2>
				<p className="text-muted-foreground text-sm">
					Press <kbd className="rounded bg-muted px-1.5 py-0.5">Cmd</kbd>+
					<kbd className="rounded bg-muted px-1.5 py-0.5">K</kbd> (macOS) or
					<kbd className="rounded bg-muted px-1.5 py-0.5">Ctrl</kbd>+
					<kbd className="rounded bg-muted px-1.5 py-0.5">K</kbd>{" "}
					(Windows/Linux) to open, or click the button below.
				</p>
				<div className="space-y-2">
					<label htmlFor="slash-test" className="text-muted-foreground text-xs">
						Test input (typing '/' will OPEN the palette with an empty query)
					</label>
					<input
						id="slash-test"
						type="text"
						placeholder="Focus here and type / — palette should open without '/' in the box"
						className="w-full rounded-md border bg-background px-3 py-2 text-sm"
					/>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<Button
						type="button"
						onClick={() => {
							setVariant("dialog");
							setOpen(true);
						}}
					>
						<Sparkles className="mr-2 h-4 w-4" /> Open (Dialog)
					</Button>
					<Button
						type="button"
						variant="secondary"
						onClick={() => {
							setVariant("floating");
							setOpen(true);
						}}
					>
						Open (Floating)
					</Button>
					<Button
						type="button"
						variant="outline"
						onClick={() => {
							setVariant("dialog");
							setInitialQuery("/");
							setOpen(true);
						}}
					>
						Open with '/' Query
					</Button>
					{variant === "floating" && isOpen ? (
						<Button
							type="button"
							variant="destructive"
							onClick={() => setOpen(false)}
						>
							Close Floating Panel
						</Button>
					) : null}
				</div>
				<p className="mt-2 text-muted-foreground text-xs">
					Tip: Press '/' anywhere (even in inputs) to open the palette. The '/'
					is not inserted.
				</p>
			</section>

			{/* Highlight + Action Bar mock demo */}
			<section className="space-y-3 rounded-md border p-4">
				<h2 className="font-semibold text-lg">Highlights + Action Bar</h2>
				<p className="text-muted-foreground text-sm">
					Select some text below, then highlight it or open the Action Bar
					prefilled with your selection.
				</p>
				<div className="flex flex-wrap items-center gap-3">
					<div className="flex items-center gap-2">
						<Label htmlFor="hl-color" className="text-xs">
							Highlight Color
						</Label>
						<Input
							id="hl-color"
							type="color"
							value={highlightColor}
							onChange={(e) => setHighlightColor(e.target.value)}
							className="h-8 w-16 p-1"
						/>
					</div>
					<Button type="button" onClick={addHighlight} disabled={!selectedText}>
						<Highlighter className="mr-2 h-4 w-4" /> Highlight Selection
					</Button>
					<Button
						type="button"
						variant="secondary"
						onClick={openActionBarWithSelection}
					>
						<Sparkles className="mr-2 h-4 w-4" /> Open Action Bar
						{selectedText ? " with Text" : ""}
					</Button>
				</div>
				<div
					ref={highlightAreaRef}
					className="rounded-md border bg-background/50 p-3 text-sm leading-6"
				>
					This is a simple paragraph intended for highlighting. Select any
					portion of this text to simulate a highlight action or to open the
					Action Bar prefilled with the selected phrase. You can change the
					highlight color using the color picker above to preview theming.
				</div>
				{highlights.length > 0 ? (
					<div className="space-y-2">
						<p className="text-muted-foreground text-xs">
							Highlighted snippets (mock):
						</p>
						<ul className="flex flex-wrap gap-2">
							{highlights.map((h) => (
								<li key={h.id} className="flex items-center gap-2">
									<mark
										style={{ backgroundColor: "var(--highlight-color)" }}
										className="rounded px-1 py-0.5"
									>
										{h.text}
									</mark>
									<Button
										type="button"
										variant="ghost"
										className="h-7 px-2 text-xs"
										onClick={() => removeHighlight(h.id)}
									>
										Remove
									</Button>
								</li>
							))}
						</ul>
					</div>
				) : null}
			</section>

			{/* Media popovers */}
			<section className="space-y-3 rounded-md border p-4">
				<h2 className="font-semibold text-lg">Media Popovers</h2>
				<p className="text-muted-foreground text-sm">
					Click the image or open a YouTube video in a modal.
				</p>
				<div className="flex flex-wrap items-center gap-4">
					<button
						type="button"
						className="group rounded-md border p-2 hover:bg-muted"
						onClick={() => {
							setImageSrc("https://place-hold.it/300x500/666/fff");
							setImageOpen(true);
						}}
					>
						<ImageIcon className="mb-1 h-5 w-5 text-muted-foreground group-hover:text-foreground" />
						<div className="text-xs">Open Image</div>
					</button>
					<div className="flex items-end gap-2">
						<div className="grid gap-1">
							<Label htmlFor="yt-url" className="text-xs">
								YouTube URL
							</Label>
							<Input
								id="yt-url"
								value={videoUrl}
								onChange={(e) => setVideoUrl(e.target.value)}
								placeholder="https://www.youtube.com/watch?v=..."
							/>
						</div>
						<Button
							type="button"
							onClick={() => setVideoOpen(true)}
							disabled={!youTubeId}
						>
							<PlayCircle className="mr-2 h-4 w-4" /> Open Video
						</Button>
					</div>

					{/* New: Quick open Action Bar with URL chip(s) */}
					<div className="flex flex-wrap items-center gap-2">
						<Button
							variant="outline"
							type="button"
							onClick={() => {
								setVariant("dialog");
								// Provide the image URL as an external attachment chip
								setExternalUrlAttachments?.([
									imageSrc || "https://place-hold.it/300x500/666/fff",
								]);
								setInitialQuery("");
								setOpen(true);
							}}
						>
							Open Action Bar with Image URL
						</Button>
						<Button
							variant="secondary"
							type="button"
							onClick={() => {
								setVariant("dialog");
								// Provide the YouTube URL as an external attachment chip
								if (videoUrl) setExternalUrlAttachments?.([videoUrl]);
								setInitialQuery("");
								setOpen(true);
							}}
							disabled={!videoUrl}
						>
							Open Action Bar with YouTube URL
						</Button>
					</div>
				</div>

				<Dialog open={imageOpen} onOpenChange={setImageOpen}>
					<DialogContent className="max-w-2xl">
						<DialogHeader>
							<DialogTitle>Image Preview</DialogTitle>
						</DialogHeader>
						<div className="flex items-center justify-center">
							<img
								src={imageSrc}
								alt="Preview"
								className="max-h-[60vh] w-auto"
							/>
						</div>
					</DialogContent>
				</Dialog>

				<Dialog open={videoOpen} onOpenChange={setVideoOpen}>
					<DialogContent className="max-w-3xl">
						<DialogHeader>
							<DialogTitle>Video Player</DialogTitle>
						</DialogHeader>
						<div className="aspect-video w-full">
							{youTubeId ? (
								<iframe
									title="YouTube video"
									className="h-full w-full rounded"
									src={`https://www.youtube.com/embed/${youTubeId}`}
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
									allowFullScreen
								/>
							) : (
								<div className="flex h-full items-center justify-center text-muted-foreground text-sm">
									Enter a valid YouTube URL
								</div>
							)}
						</div>
					</DialogContent>
				</Dialog>
			</section>
		</main>
	);
}
