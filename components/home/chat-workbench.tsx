"use client";

import dynamic from "next/dynamic";
import React from "react";
import { useState } from "react";

import { SubmoduleChatShell } from "@/components/home/submodule-chat-shell";
import { Badge } from "@/components/ui/badge";

type WorkbenchTab = "chat" | "manual";
type ChatWorkbenchProps = {
	embedded?: boolean;
	showManual?: boolean;
	showHeader?: boolean;
	showChatFrameHeader?: boolean;
};

const QuickStartFlow = dynamic(
	() => import("@/components/quickstart/QuickStartDashboardPage"),
	{
		ssr: false,
		loading: () => (
			<div className="flex min-h-[40vh] items-center justify-center rounded-3xl border border-white/10 bg-slate-950/60 text-slate-300">
				Loading quick start flow...
			</div>
		),
	},
);

export function ChatWorkbench({
	embedded = false,
	showManual = true,
	showHeader = true,
	showChatFrameHeader = true,
}: ChatWorkbenchProps) {
	const [tab, setTab] = useState<WorkbenchTab>("chat");
	const [hasOpenedManual, setHasOpenedManual] = useState(false);
	const shellClassName = embedded
		? "flex w-full flex-col gap-5"
		: "min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_32%),linear-gradient(to_bottom,#020617,#0f172a_52%,#020617)] px-4 py-6 text-slate-100 md:px-6";
	const contentClassName = embedded
		? "mx-auto flex w-full max-w-7xl flex-col gap-5 text-slate-100"
		: "mx-auto flex w-full max-w-7xl flex-col gap-6";
	const titleClassName = embedded
		? "font-semibold text-2xl tracking-tight md:text-3xl"
		: "font-semibold text-3xl tracking-tight md:text-4xl";
	const chatHeightClassName = embedded ? "min-h-[68vh]" : "min-h-[72vh]";

	return (
		<div className={shellClassName} data-tour="chat-experience-page">
			<div className={contentClassName}>
				{showHeader ? (
					<header className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur">
						<div className="flex flex-wrap items-center gap-2">
							<Badge
								variant="secondary"
								className="bg-cyan-400/15 text-cyan-200"
							>
								Interactive Avatar
							</Badge>
							<Badge
								variant="outline"
								className="border-white/15 text-slate-300"
							>
								Direct import
							</Badge>
						</div>
						<div className="space-y-1">
							<h1 className={titleClassName}>Chat first. Manual second.</h1>
							<p className="max-w-3xl text-slate-300">
								The Chat tab mounts the imported interactive avatar experience.
								The Manual tab embeds the existing quick-start flow inside the
								same app shell.
							</p>
						</div>
					</header>
				) : null}

				{showManual ? (
					<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
						<div className="inline-flex rounded-lg bg-white/10 p-1">
							<button
								className={`rounded-md px-3 py-1 text-sm transition ${
									tab === "chat"
										? "bg-white text-slate-900"
										: "text-slate-300 hover:text-white"
								}`}
								type="button"
								onClick={() => setTab("chat")}
							>
								Chat
							</button>
							<button
								className={`rounded-md px-3 py-1 text-sm transition ${
									tab === "manual"
										? "bg-white text-slate-900"
										: "text-slate-300 hover:text-white"
								}`}
								type="button"
								onClick={() => {
									setHasOpenedManual(true);
									setTab("manual");
								}}
							>
								Manual
							</button>
						</div>
						<p className="text-slate-400 text-sm">
							Submodule mounted directly in the main app
						</p>
					</div>
				) : null}

				<section
					aria-hidden={tab !== "chat"}
					className={tab === "chat" ? "block" : "hidden"}
				>
					<div className="overflow-hidden rounded-3xl border border-white/10 bg-black/40 shadow-2xl shadow-black/30">
						{showChatFrameHeader ? (
							<div className="flex items-center justify-between border-white/10 border-b px-4 py-3">
								<div>
									<p className="font-medium text-sm">Chat</p>
									<p className="text-slate-400 text-xs">
										Imported submodule chat experience.
									</p>
								</div>
								<Badge
									variant="outline"
									className="border-white/15 text-cyan-200"
								>
									Live import
								</Badge>
							</div>
						) : null}
						<div className={`${chatHeightClassName} bg-slate-950`}>
							<SubmoduleChatShell />
						</div>
					</div>
				</section>

				{showManual ? (
					<section
						aria-hidden={tab !== "manual"}
						className={tab === "manual" ? "block" : "hidden"}
					>
						<div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/20 backdrop-blur">
							<div className="flex items-center justify-between border-white/10 border-b px-4 py-3">
								<div>
									<p className="font-medium text-sm">Manual</p>
									<p className="text-slate-400 text-xs">
										Embedded quick start flow.
									</p>
								</div>
								<Badge
									variant="outline"
									className="border-white/15 text-cyan-200"
								>
									Quick start
								</Badge>
							</div>
							<div className="max-h-[80vh] overflow-auto bg-slate-950/20 p-3">
								{hasOpenedManual ? <QuickStartFlow /> : null}
							</div>
						</div>
					</section>
				) : null}
			</div>
		</div>
	);
}
