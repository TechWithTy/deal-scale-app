"use client";

import { useEffect, useState } from "react";

import { SubmoduleChatShell } from "@/components/home/submodule-chat-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { MANUAL_CHAT_MESSAGE_TYPE } from "@/lib/chat/manual-bridge";

type WorkbenchTab = "chat" | "manual";

export function ChatWorkbench() {
	const [tab, setTab] = useState<WorkbenchTab>("chat");
	const [manualInput, setManualInput] = useState("");
	const [manualEnabled, setManualEnabled] = useState(true);
	const [pendingManualMessage, setPendingManualMessage] = useState("");

	useEffect(() => {
		if (!pendingManualMessage) return;

		window.dispatchEvent(
			new MessageEvent("message", {
				data: {
					type: MANUAL_CHAT_MESSAGE_TYPE,
					text: pendingManualMessage,
				},
			}),
		);

		setPendingManualMessage("");
	}, [pendingManualMessage]);

	const submitManualPrompt = () => {
		const text = manualInput.trim();
		if (!manualEnabled || !text) return;

		setPendingManualMessage(text);
		setManualInput("");
		setTab("chat");
	};

	return (
		<main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_32%),linear-gradient(to_bottom,#020617,#0f172a_52%,#020617)] px-4 py-6 text-slate-100 md:px-6">
			<div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
				<header className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur">
					<div className="flex flex-wrap items-center gap-2">
						<Badge variant="secondary" className="bg-cyan-400/15 text-cyan-200">
							Interactive Avatar
						</Badge>
						<Badge variant="outline" className="border-white/15 text-slate-300">
							Direct import
						</Badge>
					</div>
					<div className="space-y-1">
						<h1 className="font-semibold text-3xl tracking-tight md:text-4xl">
							Chat first. Manual second.
						</h1>
						<p className="max-w-3xl text-slate-300">
							The Chat tab mounts the imported interactive avatar experience.
							The Manual tab validates a user prompt, hands it off into chat,
							and switches you back automatically.
						</p>
					</div>
				</header>

				<Tabs
					className="w-full"
					value={tab}
					onValueChange={(value) => setTab(value as WorkbenchTab)}
				>
					<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
						<TabsList className="bg-white/10">
							<TabsTrigger value="chat">Chat</TabsTrigger>
							<TabsTrigger value="manual">Manual</TabsTrigger>
						</TabsList>
						<p className="text-slate-400 text-sm">
							Submodule mounted directly in the main app
						</p>
					</div>

					<TabsContent value="chat" className="mt-0">
						<section className="overflow-hidden rounded-3xl border border-white/10 bg-black/40 shadow-2xl shadow-black/30">
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
							<div className="min-h-[72vh] bg-slate-950">
								<SubmoduleChatShell />
							</div>
						</section>
					</TabsContent>

					<TabsContent value="manual" className="mt-0">
						<section className="mx-auto grid max-w-3xl gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur">
							<div className="space-y-2">
								<h2 className="font-semibold text-xl">Manual handoff</h2>
								<p className="text-slate-300 text-sm">
									Enter a prompt here, validate it, and send it into the chat
									tab. The interface switches back to Chat after submission.
								</p>
							</div>

							<label className="flex items-center gap-2 text-slate-200 text-sm">
								<input
									checked={manualEnabled}
									className="size-4 rounded border-white/20 bg-transparent"
									type="checkbox"
									onChange={(event) => setManualEnabled(event.target.checked)}
								/>
								Manual enabled
							</label>

							<Textarea
								className="min-h-40 border-white/10 bg-slate-950/70 text-slate-100"
								disabled={!manualEnabled}
								placeholder="Type the user's response to move into chat..."
								value={manualInput}
								onChange={(event) => setManualInput(event.target.value)}
							/>

							<div className="flex flex-wrap items-center justify-between gap-3">
								<p className="text-slate-400 text-sm">
									{manualEnabled
										? "Validated prompts are forwarded to Chat."
										: "Enable Manual to forward prompts."}
								</p>
								<Button
									disabled={!manualEnabled || !manualInput.trim()}
									onClick={submitManualPrompt}
								>
									Send to Chat
								</Button>
							</div>
						</section>
					</TabsContent>
				</Tabs>
			</div>
		</main>
	);
}
