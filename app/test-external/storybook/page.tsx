"use client";

import { useState } from "react";
import { PlaybackCell } from "@/external/audio-playback";
import { CloneModal } from "@/external/teleprompter-modal";
import { MinimalWheel } from "@/external/wheel-spinner";
import type { CallInfo } from "@/types/_dashboard/campaign";

export default function StorybookExternalPage() {
	// Minimal mock data for PlaybackCell
	// Note: We only use id, recordingUrl, startedAt, endedAt in the UI,
	// so we provide those and coerce the rest for typing.
	const mockCalls: CallInfo[] = [
		{
			callResponse: {
				id: "Call A",
				recordingUrl: "/calls/example-call-yt.mp3",
				startedAt: new Date(Date.now() - 60_000).toISOString(),
				endedAt: new Date().toISOString(),
			} as any,
			contactId: "contact-1",
			campaignId: "campaign-1",
		},
		{
			callResponse: {
				id: "Call B",
				recordingUrl: "/calls/example-call-yt.mp3",
				startedAt: new Date(Date.now() - 120_000).toISOString(),
				endedAt: new Date(Date.now() - 60_000).toISOString(),
			} as any,
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

	return (
		<main className="mx-auto max-w-2xl space-y-8 p-6">
			<section className="space-y-3 rounded-md border p-4">
				<h1 className="text-xl font-semibold">Audio Playback (External)</h1>
				<p className="text-sm text-muted-foreground">
					Test the reusable playback UI with Next/Prev, Lottie play/pause, and
					timeline seek.
				</p>
				<div className="rounded-md border p-3">
					<PlaybackCell callInformation={mockCalls} />
				</div>
			</section>

			<section className="space-y-3 rounded-md border p-4">
				<h2 className="text-lg font-semibold">Teleprompter Modal (External)</h2>
				<p className="text-sm text-muted-foreground">
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
				<h2 className="text-lg font-semibold">Prize Wheel (External)</h2>
				<p className="text-sm text-muted-foreground">
					Spin the wheel to test prize distribution, countdown lock, and modal
					behavior.
				</p>
				<MinimalWheel
					cadence="hourly"
					userId="storybook-user"
					prizes={demoPrizes}
				/>
			</section>
		</main>
	);
}
