"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { EvalRunResponse } from "@/types/vapiAi/api/eval/run";
import {
	AlertCircle,
	CheckCircle2,
	Clock,
	Loader2,
	XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface EvaluationReportModalProps {
	evalRunId: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	apiKey?: string;
}

export function EvaluationReportModal({
	evalRunId,
	open,
	onOpenChange,
	apiKey,
}: EvaluationReportModalProps) {
	const [evalRun, setEvalRun] = useState<EvalRunResponse | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [polling, setPolling] = useState(false);
	const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
	const isMountedRef = useRef(true);
	const openRef = useRef(open);

	// Cleanup on unmount
	useEffect(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
			if (pollIntervalRef.current) {
				clearInterval(pollIntervalRef.current);
				pollIntervalRef.current = null;
			}
		};
	}, []);

	// Update open ref
	useEffect(() => {
		openRef.current = open;
	}, [open]);

	// Reset state when modal closes
	useEffect(() => {
		if (!open) {
			// Use setTimeout to batch state updates and prevent re-render loops
			const timeoutId = setTimeout(() => {
				if (!isMountedRef.current) return;
				setEvalRun(null);
				setError(null);
				setLoading(false);
				setPolling(false);
			}, 0);

			if (pollIntervalRef.current) {
				clearInterval(pollIntervalRef.current);
				pollIntervalRef.current = null;
			}

			return () => clearTimeout(timeoutId);
		}
	}, [open]);

	// Generate mock eval run when modal opens and has evalRunId
	useEffect(() => {
		// Early return if conditions not met
		if (!evalRunId || !open) {
			return;
		}

		// Don't run if already mounted and not open
		if (!isMountedRef.current || !openRef.current) {
			return;
		}

		let cancelled = false;

		const generateMockEvalRun = async () => {
			if (!isMountedRef.current || !openRef.current || cancelled) return;

			try {
				setLoading(true);
				setError(null);

				// Simulate API delay
				await new Promise((resolve) => setTimeout(resolve, 500));

				if (!isMountedRef.current || !openRef.current || cancelled) return;

				// Generate mock data
				const now = new Date();
				const startedAt = new Date(now.getTime() - 45000); // Started 45 seconds ago
				const endedAt = now;

				const mockData: EvalRunResponse = {
					status: "ended",
					endedReason: "mockConversation.done",
					target: {
						assistant: {
							name: "Campaign Assistant",
						},
						assistantId: "assistant_123",
						type: "assistant",
					},
					id: evalRunId,
					orgId: "org_123",
					createdAt: startedAt.toISOString(),
					startedAt: startedAt.toISOString(),
					endedAt: endedAt.toISOString(),
					results: [
						{
							status: "pass",
							messages: [
								{
									role: "user",
									content: "Hello, I'm interested in your services",
								},
								{
									role: "assistant",
									content:
										"Hello! I'd be happy to help you learn more about our services. What specifically are you interested in?",
								},
								{
									role: "user",
									content: "I want to know about pricing",
								},
								{
									role: "assistant",
									content:
										"Great question! Our pricing varies based on your specific needs. Let me connect you with our sales team to discuss options.",
								},
							],
							startedAt: startedAt.toISOString(),
							endedAt: endedAt.toISOString(),
						},
						{
							status: "pass",
							messages: [
								{
									role: "user",
									content: "I need to speak with a human agent",
								},
								{
									role: "assistant",
									content:
										"Absolutely! I'll transfer you to one of our representatives right away. Please hold for just a moment.",
								},
							],
							startedAt: startedAt.toISOString(),
							endedAt: endedAt.toISOString(),
						},
						{
							status: "fail",
							messages: [
								{
									role: "user",
									content: "Can you help me cancel my subscription?",
								},
								{
									role: "assistant",
									content:
										"I understand you want to cancel. Before we proceed, can you tell me why you're looking to cancel?",
								},
							],
							startedAt: startedAt.toISOString(),
							endedAt: endedAt.toISOString(),
						},
					],
					cost: 0.0045,
					costs: [
						{
							type: "model",
							model: "gpt-4o",
							cost: 0.003,
						},
						{
							type: "transcriber",
							model: "deepgram",
							cost: 0.001,
						},
						{
							type: "tts",
							model: "playht",
							cost: 0.0005,
						},
					],
					type: "eval",
					eval: {
						messages: [
							{
								role: "user",
							},
							{
								role: "assistant",
							},
						],
						type: "chat.mockConversation",
						name: "Conversation Flow Test",
						description:
							"Evaluates the flow of conversation and ensures proper responses at key checkpoints.",
					},
					endedMessage: null,
					evalId: "eval_123",
				};

				if (!isMountedRef.current || !openRef.current || cancelled) return;

				setEvalRun(mockData);
				setLoading(false);
				setPolling(false);
			} catch (err) {
				if (!isMountedRef.current || !openRef.current || cancelled) return;

				setError(err instanceof Error ? err.message : "Unknown error");
				setLoading(false);
				setPolling(false);
			}
		};

		generateMockEvalRun();

		return () => {
			cancelled = true;
			if (pollIntervalRef.current) {
				clearInterval(pollIntervalRef.current);
				pollIntervalRef.current = null;
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [evalRunId, open]);

	const getStatusBadge = () => {
		if (!evalRun) return null;

		if (evalRun.status === "running") {
			return (
				<Badge variant="secondary" className="gap-1.5">
					<Loader2 className="h-3 w-3 animate-spin" />
					Running
				</Badge>
			);
		}

		if (evalRun.endedReason === "mockConversation.done") {
			const allPassed = evalRun.results.every((r) => r.status === "pass");
			return (
				<Badge
					variant={allPassed ? "default" : "destructive"}
					className="gap-1.5"
				>
					{allPassed ? (
						<CheckCircle2 className="h-3 w-3" />
					) : (
						<XCircle className="h-3 w-3" />
					)}
					{allPassed ? "Passed" : "Failed"}
				</Badge>
			);
		}

		if (evalRun.endedReason === "error") {
			return (
				<Badge variant="destructive" className="gap-1.5">
					<AlertCircle className="h-3 w-3" />
					Error
				</Badge>
			);
		}

		if (evalRun.endedReason === "timeout") {
			return (
				<Badge variant="secondary" className="gap-1.5">
					<Clock className="h-3 w-3" />
					Timeout
				</Badge>
			);
		}

		if (evalRun.endedReason === "cancelled") {
			return (
				<Badge variant="secondary" className="gap-1.5">
					<XCircle className="h-3 w-3" />
					Cancelled
				</Badge>
			);
		}

		return (
			<Badge variant="secondary" className="gap-1.5">
				{evalRun.endedReason}
			</Badge>
		);
	};

	const getScore = () => {
		if (!evalRun || evalRun.results.length === 0) return null;

		const passed = evalRun.results.filter((r) => r.status === "pass").length;
		const total = evalRun.results.length;
		const percentage = Math.round((passed / total) * 100);

		return {
			passed,
			total,
			percentage,
		};
	};

	const score = getScore();

	const handleOpenChange = (newOpen: boolean) => {
		// Prevent state updates if already in the target state
		if (newOpen === open) return;

		// Update openRef immediately to prevent race conditions
		openRef.current = newOpen;

		// Call the parent's onOpenChange
		onOpenChange(newOpen);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-4xl flex-col overflow-hidden sm:w-full">
				<DialogHeader className="flex-shrink-0">
					<div className="flex items-center justify-between">
						<DialogTitle>Evaluation Report</DialogTitle>
						{getStatusBadge()}
					</div>
					{evalRun?.eval?.name && (
						<p className="text-muted-foreground text-sm">{evalRun.eval.name}</p>
					)}
				</DialogHeader>

				<ScrollArea className="flex-1">
					<div className="space-y-6 pr-4">
						{loading && !evalRun && (
							<div className="flex items-center justify-center py-12">
								<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
								<span className="ml-2 text-muted-foreground">
									Loading evaluation results...
								</span>
							</div>
						)}

						{error && (
							<div className="rounded-lg border border-destructive bg-destructive/10 p-4">
								<p className="font-medium text-destructive">
									Error loading evaluation
								</p>
								<p className="text-destructive/80 text-sm">{error}</p>
							</div>
						)}

						{evalRun && (
							<>
								{/* Score Summary */}
								{score && (
									<div className="rounded-lg border bg-card p-6">
										<div className="mb-4 flex items-center justify-between">
											<h3 className="font-semibold text-lg">Overall Score</h3>
											{score.percentage >= 80 && (
												<CheckCircle2 className="h-6 w-6 text-green-500" />
											)}
											{score.percentage < 80 && (
												<XCircle className="h-6 w-6 text-red-500" />
											)}
										</div>
										<div className="space-y-2">
											<div className="flex items-baseline gap-2">
												<span className="font-bold text-4xl">
													{score.percentage}%
												</span>
												<span className="text-muted-foreground text-sm">
													({score.passed} of {score.total} tests passed)
												</span>
											</div>
											<div className="h-2 w-full overflow-hidden rounded-full bg-muted">
												<div
													className="h-full bg-primary transition-all"
													style={{ width: `${score.percentage}%` }}
												/>
											</div>
										</div>
									</div>
								)}

								{/* Evaluation Details */}
								<div className="space-y-4">
									<h3 className="font-semibold text-lg">Evaluation Details</h3>

									<div className="grid gap-4 sm:grid-cols-2">
										<div className="rounded-lg border p-4">
											<p className="text-muted-foreground text-sm">Status</p>
											<p className="font-medium capitalize">{evalRun.status}</p>
										</div>
										<div className="rounded-lg border p-4">
											<p className="text-muted-foreground text-sm">
												Ended Reason
											</p>
											<p className="font-medium">
												{evalRun.endedReason === "mockConversation.done"
													? "Completed"
													: evalRun.endedReason}
											</p>
										</div>
										<div className="rounded-lg border p-4">
											<p className="text-muted-foreground text-sm">Cost</p>
											<p className="font-medium">${evalRun.cost.toFixed(4)}</p>
										</div>
										{evalRun.endedAt && (
											<div className="rounded-lg border p-4">
												<p className="text-muted-foreground text-sm">
													Duration
												</p>
												<p className="font-medium">
													{Math.round(
														(new Date(evalRun.endedAt).getTime() -
															new Date(evalRun.startedAt).getTime()) /
															1000,
													)}{" "}
													seconds
												</p>
											</div>
										)}
									</div>

									{evalRun.endedMessage && (
										<div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
											<p className="font-medium text-yellow-700 dark:text-yellow-400">
												Ended Message
											</p>
											<p className="text-sm text-yellow-600 dark:text-yellow-300">
												{evalRun.endedMessage}
											</p>
										</div>
									)}
								</div>

								{/* Results */}
								{evalRun.results.length > 0 && (
									<div className="space-y-4">
										<h3 className="font-semibold text-lg">Test Results</h3>
										<div className="space-y-3">
											{evalRun.results.map((result, index) => (
												<div
													key={index}
													className={`rounded-lg border p-4 ${
														result.status === "pass"
															? "border-green-500/50 bg-green-500/10"
															: "border-red-500/50 bg-red-500/10"
													}`}
												>
													<div className="mb-3 flex items-center justify-between">
														<Badge
															variant={
																result.status === "pass"
																	? "default"
																	: "destructive"
															}
															className="gap-1.5"
														>
															{result.status === "pass" ? (
																<CheckCircle2 className="h-3 w-3" />
															) : (
																<XCircle className="h-3 w-3" />
															)}
															Test {index + 1} -{" "}
															{result.status === "pass" ? "Passed" : "Failed"}
														</Badge>
														<span className="text-muted-foreground text-xs">
															{new Date(result.startedAt).toLocaleTimeString()}
														</span>
													</div>

													{result.messages.length > 0 && (
														<div className="space-y-2">
															<p className="font-medium text-muted-foreground text-sm">
																Messages:
															</p>
															<div className="space-y-1 rounded bg-background p-2">
																{result.messages.map((msg, msgIndex) => (
																	<div key={msgIndex} className="text-sm">
																		<span className="font-medium text-muted-foreground capitalize">
																			{msg.role}:
																		</span>{" "}
																		{msg.content}
																	</div>
																))}
															</div>
														</div>
													)}
												</div>
											))}
										</div>
									</div>
								)}

								{/* Cost Breakdown */}
								{evalRun.costs.length > 0 && (
									<div className="space-y-4">
										<h3 className="font-semibold text-lg">Cost Breakdown</h3>
										<div className="space-y-2">
											{evalRun.costs.map((cost, index) => (
												<div
													key={index}
													className="flex items-center justify-between rounded-lg border p-3"
												>
													<div>
														<p className="font-medium capitalize">
															{cost.type}
														</p>
														{cost.model && (
															<p className="text-muted-foreground text-xs">
																{cost.model}
															</p>
														)}
													</div>
													<p className="font-medium">${cost.cost.toFixed(4)}</p>
												</div>
											))}
										</div>
									</div>
								)}
							</>
						)}

						{polling && (
							<div className="flex items-center justify-center gap-2 py-4 text-muted-foreground text-sm">
								<Loader2 className="h-4 w-4 animate-spin" />
								<span>Polling for updates...</span>
							</div>
						)}
					</div>
				</ScrollArea>

				<div className="flex flex-shrink-0 justify-end gap-2 border-t pt-4">
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Close
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
