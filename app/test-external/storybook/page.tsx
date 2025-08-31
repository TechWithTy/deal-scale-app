"use client";

import { useState } from "react";
import { PlaybackCell } from "@/external/audio-playback";
import { CloneModal } from "@/external/teleprompter-modal";
import type { CallInfo } from "@/types/_dashboard/campaign";
import WheelDemo from "@/external/shadcn-table/src/examples/wheel-demo";

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
					Test the prize wheel with center-click spin and auto-spin behavior.
				</p>
				<div className="rounded-md border p-3">
					<WheelDemo />
				</div>
			</section>
		</main>
	);
}
