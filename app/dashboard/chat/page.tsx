"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";

// Types
type ChatMessage = {
	id: string;
	user: boolean;
	text: string;
};

// Mock AI response
async function mockAiResponse(input: string): Promise<string> {
	// Simulate latency
	await new Promise((r) => setTimeout(r, 600));
	// Replace with your actual AI call
	return `Echo: ${input}`;
}

export default function ChatPage() {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const chatEndRef = useRef<HTMLDivElement>(null);

	// Only re-run when the message count changes (not the whole array identity)
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages.length]);

	const sendMessage = async (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = input.trim();
		if (!trimmed) return;

		const userMsg: ChatMessage = {
			id: crypto.randomUUID(),
			user: true,
			text: trimmed,
		};

		setMessages((prev) => [...prev, userMsg]);
		setLoading(true);

		try {
			const response = await mockAiResponse(trimmed);
			const aiMsg: ChatMessage = {
				id: crypto.randomUUID(),
				user: false,
				text: response,
			};
			setMessages((prev) => [...prev, aiMsg]);
		} finally {
			setLoading(false);
			setInput("");
		}
	};

	return (
		<div className="mx-auto w-full rounded-lg border border-border bg-card p-4 text-card-foreground">
			<h1 className="mb-3 font-semibold text-lg">Chat</h1>

			<div className="mb-3 h-72 overflow-y-auto rounded-md border border-border bg-background p-3">
				{messages.length === 0 && (
					<div className="text-center text-muted-foreground text-sm">
						Start chatting with the AI!
					</div>
				)}

				{messages.map((msg) => (
					<div
						key={msg.id}
						className={`my-2 flex ${msg.user ? "justify-end" : "justify-start"}`}
					>
						<span
							className={`inline-block max-w-[80%] rounded-md px-3 py-2 text-sm ${
								msg.user
									? "bg-primary text-primary-foreground"
									: "bg-muted text-foreground"
							}`}
						>
							{msg.text}
						</span>
					</div>
				))}
				<div ref={chatEndRef} />
			</div>

			<form onSubmit={sendMessage} className="flex items-center gap-2">
				<input
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="Type your message..."
					className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring"
				/>
				<button
					type="submit"
					disabled={loading || input.trim().length === 0}
					className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
				>
					{loading ? "Sending..." : "Send"}
				</button>
			</form>
		</div>
	);
}
