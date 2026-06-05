"use client";

import React from "react";
import {
	Brain,
	ChevronRight,
	Database,
	LayoutDashboard,
	Maximize2,
	Minimize2,
	Play,
	Settings2Icon,
	XIcon,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
	StreamingAvatarProvider,
	StreamingAvatarSessionState,
} from "@/components/logic/context";
import { SessionQuickStartCard } from "@/external/interactive-avatar-nextjs-demo/components/AvatarSession/SessionQuickStartCard";
import { defaultGraphData } from "@/external/interactive-avatar-nextjs-demo/components/data-viewer";
import { Chat } from "@/external/interactive-avatar-nextjs-demo/components/AvatarSession/Chat";
import { useChatController } from "@/external/interactive-avatar-nextjs-demo/components/AvatarSession/hooks/useChatController";
import { ApiServiceProvider } from "@/external/interactive-avatar-nextjs-demo/components/logic/ApiServiceContext";
import SubmoduleSidebar from "@/external/interactive-avatar-nextjs-demo/components/Sidebar";
import { ToastProvider } from "@/external/interactive-avatar-nextjs-demo/components/ui/toaster";
import {
	useAvatarOptionsQuery,
	useKnowledgeBaseOptionsQuery,
	useVoiceOptionsQuery,
} from "@/external/interactive-avatar-nextjs-demo/data/options";
import type { ApiService } from "@/lib/services/api";
import { usePlacementStore } from "@/lib/stores/placement";
import { useSessionStore } from "@/lib/stores/session";

const BrainGraphViewer = dynamic(
	() =>
		import(
			"@/external/interactive-avatar-nextjs-demo/components/three-graph-viewer"
		).then((module) => module.ThreeGraphViewer),
	{
		ssr: false,
		loading: () => (
			<div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
				Loading graph...
			</div>
		),
	},
);

const DataViewerPanel = dynamic(
	() =>
		import(
			"@/external/interactive-avatar-nextjs-demo/components/data-viewer"
		).then((module) => module.DataViewer),
	{
		ssr: false,
		loading: () => (
			<div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
				Loading data...
			</div>
		),
	},
);

const KanbanActionsPanel = dynamic(
	() =>
		import(
			"@/external/interactive-avatar-nextjs-demo/components/kanban/ActionsKanbanPanel"
		).then((module) => module.ActionsKanbanPanel),
	{
		ssr: false,
		loading: () => (
			<div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
				Loading actions...
			</div>
		),
	},
);

type WorkspaceTab = "video" | "brain" | "data" | "actions";

const UUID_PATTERN =
	/^(urn:uuid:)?[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function EmbeddedShellControls({
	chatMinimized,
	hidden,
	onRestoreChat,
}: {
	chatMinimized: boolean;
	hidden: boolean;
	onRestoreChat: () => void;
}) {
	const { viewTab, setViewTab, controlsMinimized, setControlsMinimized } =
		useSessionStore();
	const sidebarCollapsed = usePlacementStore((state) => state.sidebarCollapsed);
	const setSidebarCollapsed = usePlacementStore(
		(state) => state.setSidebarCollapsed,
	);

	return (
		<div
			className={`pointer-events-none absolute inset-0 z-[220] ${
				hidden ? "hidden" : ""
			}`}
		>
			{sidebarCollapsed ? (
				<button
					aria-label="Open workspace sidebar"
					className="pointer-events-auto absolute left-0 top-1/2 flex h-20 w-6 -translate-y-1/2 items-center justify-center rounded-r border border-primary bg-background text-foreground shadow-lg shadow-black/30 hover:bg-muted"
					type="button"
					onClick={() => setSidebarCollapsed(false)}
				>
					<span className="h-10 w-1.5 rounded-full bg-primary" />
				</button>
			) : null}

			{chatMinimized ? (
				<button
					aria-label="Restore chat"
					className="pointer-events-auto absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-md border border-primary bg-background px-3 py-2 text-foreground shadow-lg shadow-black/30 hover:bg-muted"
					type="button"
					onClick={onRestoreChat}
				>
					<span className="h-1.5 w-8 rounded-full bg-primary" />
					<span className="text-xs font-medium">Chat</span>
				</button>
			) : null}

			{controlsMinimized ? (
				<button
					aria-label="Show workspace controls"
					className="pointer-events-auto absolute left-1/2 top-0 flex -translate-x-1/2 items-center gap-2 rounded-b-md border border-primary bg-background px-3 py-2 text-foreground shadow-lg shadow-black/30 hover:bg-muted"
					data-tour="top-panel-toggle"
					type="button"
					onClick={() => setControlsMinimized(false)}
				>
					<span className="h-1.5 w-8 rounded-full bg-primary" />
					<span className="text-xs font-medium">Controls</span>
				</button>
			) : (
				<div className="pointer-events-auto absolute left-1/2 top-3 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-card px-2 py-1 text-card-foreground shadow-lg shadow-black/30">
					<Button
						className={`h-9 w-9 rounded-xl !border !border-border !p-0 ${
							viewTab === "video"
								? "!bg-primary !text-primary-foreground"
								: "!bg-muted !text-foreground"
						}`}
						title="Video"
						onClick={() => setViewTab("video")}
					>
						<Play className="h-4 w-4" />
					</Button>
					<Button
						className={`h-9 w-9 rounded-xl !border !border-border !p-0 ${
							viewTab === "brain"
								? "!bg-primary !text-primary-foreground"
								: "!bg-muted !text-foreground"
						}`}
						title="Brain"
						onClick={() => setViewTab("brain")}
					>
						<Brain className="h-4 w-4" />
					</Button>
					<Button
						className={`h-9 w-9 rounded-xl !border !border-border !p-0 ${
							viewTab === "data"
								? "!bg-primary !text-primary-foreground"
								: "!bg-muted !text-foreground"
						}`}
						title="Data"
						onClick={() => setViewTab("data")}
					>
						<Database className="h-4 w-4" />
					</Button>
					<Button
						className={`h-9 w-9 rounded-xl !border !border-border !p-0 ${
							viewTab === "actions"
								? "!bg-primary !text-primary-foreground"
								: "!bg-muted !text-foreground"
						}`}
						title="Actions"
						onClick={() => setViewTab("actions")}
					>
						<LayoutDashboard className="h-4 w-4" />
					</Button>
					<Button
						className="ml-1 h-9 w-9 rounded-xl !border !border-border !bg-muted !p-0 !text-foreground"
						title="Minimize controls"
						onClick={() => setControlsMinimized(true)}
					>
						<Minimize2 className="h-4 w-4" />
					</Button>
				</div>
			)}
		</div>
	);
}

function WorkspacePanel({ tab }: { tab: WorkspaceTab }) {
	const { openChatSettings } = useSessionStore();
	const [liveAvatarEmbedUrl, setLiveAvatarEmbedUrl] = useState<string | null>(
		null,
	);
	const [isEmbedLoading, setIsEmbedLoading] = useState(false);
	const [isConnecting, setIsConnecting] = useState(false);
	const embedFrameRef = useRef<HTMLIFrameElement | null>(null);
	const [selectedAvatar, setSelectedAvatar] = useState("");
	const [customAvatarId, setCustomAvatarId] = useState("");
	const [knowledgeBaseId, setKnowledgeBaseId] = useState("");
	const [selectedVoiceId, setSelectedVoiceId] = useState("");
	const { data: avatarOptionItems = [], isFetching: isLoadingAvatarOptions } =
		useAvatarOptionsQuery();
	const { data: voiceOptions = [], isFetching: isLoadingVoiceOptions } =
		useVoiceOptionsQuery();
	const { data: contextOptions = [], isFetching: isLoadingContextOptions } =
		useKnowledgeBaseOptionsQuery();

	useEffect(() => {
		if (!selectedAvatar && avatarOptionItems[0]?.value) {
			setSelectedAvatar(avatarOptionItems[0].value);
		}
	}, [avatarOptionItems, selectedAvatar]);

	useEffect(() => {
		if (!knowledgeBaseId && contextOptions[0]?.value) {
			setKnowledgeBaseId(contextOptions[0].value);
		}
	}, [contextOptions, knowledgeBaseId]);

	useEffect(() => {
		if (!selectedVoiceId && voiceOptions[0]?.value) {
			setSelectedVoiceId(voiceOptions[0].value);
		}
	}, [selectedVoiceId, voiceOptions]);

	useEffect(() => {
		if (!liveAvatarEmbedUrl) {
			setIsEmbedLoading(false);
			return;
		}

		setIsEmbedLoading(true);

		const frame = embedFrameRef.current;
		const clearLoading = () => setIsEmbedLoading(false);
		const forceReadyTimer = window.setTimeout(clearLoading, 4000);

		frame?.addEventListener("load", clearLoading);
		frame?.addEventListener("error", clearLoading);

		return () => {
			window.clearTimeout(forceReadyTimer);
			frame?.removeEventListener("load", clearLoading);
			frame?.removeEventListener("error", clearLoading);
		};
	}, [liveAvatarEmbedUrl]);

	const avatarOptions = avatarOptionItems.map((option) => ({
		avatar_id: option.value,
		name: option.label,
	}));
	const selectedAvatarId =
		selectedAvatar === "CUSTOM" ? customAvatarId.trim() : selectedAvatar;
	const customIdValid = UUID_PATTERN.test(selectedAvatarId);
	const kbIdValid = UUID_PATTERN.test(knowledgeBaseId.trim());

	if (tab === "brain") {
		return (
			<div className="h-full w-full bg-background" data-tour="brain-graph">
				<BrainGraphViewer
					graphData={defaultGraphData}
					isHighlightActive
					isEditing
					nodesToHighlight={["root"]}
					showControls={false}
				/>
			</div>
		);
	}

	if (tab === "data") {
		return (
			<div className="h-full w-full bg-background" data-tour="data-grid">
				<DataViewerPanel />
			</div>
		);
	}

	if (tab === "actions") {
		return (
			<div className="h-full w-full bg-background" data-tour="kanban-board">
				<KanbanActionsPanel />
			</div>
		);
	}

	if (tab === "video") {
		const startSession = async (options: {
			avatarId?: string;
			knowledgeBaseId?: string;
			voiceId?: string;
		}) => {
			try {
				setIsConnecting(true);
				const response = await fetch("/api/liveavatar/embed", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						avatarName: options.avatarId,
						knowledgeId: options.knowledgeBaseId,
						voice: options.voiceId ? { voiceId: options.voiceId } : undefined,
					}),
				});
				const data = await response.json().catch(() => ({}));
				if (!response.ok || !data?.data?.url) {
					throw new Error(data?.error || "Failed to start LiveAvatar session");
				}
				setLiveAvatarEmbedUrl(data.data.url);
			} catch (error) {
				console.error(
					"[VideoSetupPanel] Failed to start avatar session",
					error,
				);
				setIsEmbedLoading(false);
			} finally {
				setIsConnecting(false);
			}
		};

		return (
			<div
				className="relative h-full w-full overflow-hidden bg-background"
				data-tour="avatar-video"
			>
				{liveAvatarEmbedUrl ? (
					<div className="absolute inset-0 bg-black">
						<div className="relative h-full w-full overflow-hidden bg-black">
							<Button
								size="icon"
								type="button"
								variant="secondary"
								title="Stop avatar"
								className="absolute right-4 top-4 z-20"
								onClick={() => {
									setIsEmbedLoading(false);
									setLiveAvatarEmbedUrl(null);
								}}
							>
								<XIcon className="h-4 w-4" />
							</Button>
							{isEmbedLoading ? (
								<div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 text-sm text-white/80">
									Loading LiveAvatar session...
								</div>
							) : null}
							<iframe
								allow="camera; microphone; autoplay; clipboard-read; clipboard-write; fullscreen"
								className="absolute left-1/2 top-1/2 block h-full min-w-full -translate-x-1/2 -translate-y-1/2 border-0"
								ref={embedFrameRef}
								referrerPolicy="strict-origin-when-cross-origin"
								src={liveAvatarEmbedUrl}
								style={{ aspectRatio: "16 / 9" }}
								title="LiveAvatar session"
							/>
						</div>
					</div>
				) : (
					<div className="absolute inset-0 flex items-center justify-center">
						<Button
							size="icon"
							type="button"
							variant="secondary"
							title="Chat settings"
							className="absolute right-4 top-4 z-20"
							onClick={() => openChatSettings("avatar")}
						>
							<Settings2Icon className="h-4 w-4" />
						</Button>
						<SessionQuickStartCard
							avatarOptions={avatarOptions}
							contextOptions={contextOptions}
							voiceOptions={voiceOptions}
							customAvatarId={customAvatarId}
							customIdValid={customIdValid}
							isConnecting={isConnecting}
							isLoadingAvatarOptions={isLoadingAvatarOptions}
							isLoadingContextOptions={isLoadingContextOptions}
							isLoadingVoiceOptions={isLoadingVoiceOptions}
							kbIdValid={kbIdValid}
							knowledgeBaseId={knowledgeBaseId}
							onCustomAvatarChange={setCustomAvatarId}
							onKnowledgeBaseChange={setKnowledgeBaseId}
							onSelectAvatar={setSelectedAvatar}
							onSelectVoice={setSelectedVoiceId}
							onStartSession={startSession}
							onStartWithoutAvatar={() => {
								window.dispatchEvent(
									new CustomEvent("deal-scale:restore-chat"),
								);
							}}
							selectedAvatar={selectedAvatar}
							selectedVoiceId={selectedVoiceId}
						/>
					</div>
				)}
			</div>
		);
	}

	return (
		<div className="flex h-full w-full items-center justify-center bg-slate-950 text-sm text-muted-foreground" />
	);
}

function SubmoduleChatPanel() {
	const messages = useSessionStore((state) => state.messages);
	const viewTab = useSessionStore((state) => state.viewTab);
	const setViewTab = useSessionStore((state) => state.setViewTab);
	const {
		chatInput,
		setChatInput,
		isSending,
		isVoiceChatActive,
		handleCopy,
		handleArrowUp,
		handleArrowDown,
		sendMessageVoid,
		startVoiceChatVoid,
		stopVoiceChatVoid,
	} = useChatController(StreamingAvatarSessionState.CONNECTED);
	const setSidebarCollapsed = usePlacementStore(
		(state) => state.setSidebarCollapsed,
	);
	const setControlsMinimized = useSessionStore(
		(state) => state.setControlsMinimized,
	);
	const [chatMinimized, setChatMinimized] = useState(false);
	const [chatMaximized, setChatMaximized] = useState(false);
	const [videoSelectOpen, setVideoSelectOpen] = useState(false);
	const [mountedWorkspaceTabs, setMountedWorkspaceTabs] = useState<
		Record<WorkspaceTab, boolean>
	>({
		actions: false,
		brain: false,
		data: false,
		video: true,
	});
	const previousTabRef = useRef<WorkspaceTab>("video");

	useEffect(() => {
		setSidebarCollapsed(true);
		setControlsMinimized(true);
		setViewTab("video");
	}, [setControlsMinimized, setSidebarCollapsed, setViewTab]);

	useEffect(() => {
		const nextTab = viewTab as WorkspaceTab;
		setMountedWorkspaceTabs((current) => ({
			...current,
			[nextTab]: true,
		}));
		if (nextTab !== previousTabRef.current) {
			previousTabRef.current = nextTab;
			setChatMinimized(true);
			setChatMaximized(false);
		}
	}, [viewTab]);

	useEffect(() => {
		const restoreChat = () => {
			setChatMinimized(false);
		};
		window.addEventListener("deal-scale:restore-chat", restoreChat);
		return () => {
			window.removeEventListener("deal-scale:restore-chat", restoreChat);
		};
	}, []);

	useEffect(() => {
		const handleVideoSelectOpen = (event: Event) => {
			const detail = (event as CustomEvent<{ open?: boolean }>).detail;
			setVideoSelectOpen(Boolean(detail?.open));
		};

		window.addEventListener(
			"deal-scale:video-select-open",
			handleVideoSelectOpen,
		);
		return () => {
			window.removeEventListener(
				"deal-scale:video-select-open",
				handleVideoSelectOpen,
			);
		};
	}, []);

	const showWorkspace = chatMinimized;

	return (
		<div className="relative flex h-[calc(100vh-8rem)] min-h-0 w-full flex-1 overflow-visible bg-slate-950 text-foreground">
			<SubmoduleSidebar showCollapsedTrigger={false} />
			<EmbeddedShellControls
				chatMinimized={chatMinimized}
				hidden={videoSelectOpen}
				onRestoreChat={() => {
					setChatMinimized(false);
				}}
			/>
			<div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
				<div className="flex items-center justify-between border-border/70 border-b bg-background/70 px-4 py-3">
					<div>
						<p className="font-medium text-sm">Workspace</p>
						<p className="text-muted-foreground text-xs">
							Embedded avatar workspace with chat, brain, data, and actions.
						</p>
					</div>
					<div className="flex items-center gap-2">
						{!chatMinimized ? (
							<>
								<Button
									size="icon"
									title={chatMaximized ? "Restore chat" : "Maximize chat"}
									variant="ghost"
									onClick={() => setChatMaximized((current) => !current)}
								>
									<Maximize2 className="h-4 w-4" />
								</Button>
								<Button
									size="icon"
									title="Minimize chat"
									variant="ghost"
									onClick={() => setChatMinimized(true)}
								>
									<Minimize2 className="h-4 w-4" />
								</Button>
							</>
						) : null}
					</div>
				</div>

				<div className="flex min-h-0 flex-1 overflow-hidden">
					<div
						className={`min-h-0 ${
							viewTab === "actions" || viewTab === "data"
								? "overflow-auto overscroll-contain"
								: "overflow-hidden"
						} ${
							showWorkspace
								? chatMinimized
									? "flex-1"
									: "w-[40%] min-w-[320px] border-r border-border/70"
								: "hidden w-0"
						}`}
					>
						<div className="relative h-full min-h-0 w-full">
							{mountedWorkspaceTabs.video ? (
								<div
									className={
										viewTab === "video"
											? "h-full w-full"
											: "hidden h-full w-full"
									}
								>
									<WorkspacePanel tab="video" />
								</div>
							) : null}
							{mountedWorkspaceTabs.brain ? (
								<div
									className={
										viewTab === "brain"
											? "h-full w-full"
											: "hidden h-full w-full"
									}
								>
									<WorkspacePanel tab="brain" />
								</div>
							) : null}
							{mountedWorkspaceTabs.data ? (
								<div
									className={
										viewTab === "data"
											? "h-full w-full"
											: "hidden h-full w-full"
									}
								>
									<WorkspacePanel tab="data" />
								</div>
							) : null}
							{mountedWorkspaceTabs.actions ? (
								<div
									className={
										viewTab === "actions"
											? "h-full w-full"
											: "hidden h-full w-full"
									}
								>
									<WorkspacePanel tab="actions" />
								</div>
							) : null}
						</div>
					</div>

					<div
						className={`min-h-0 flex-1 overflow-hidden ${
							chatMinimized
								? "hidden w-0"
								: chatMaximized || !showWorkspace
									? "w-full"
									: ""
						}`}
					>
						<Chat
							chatInput={chatInput}
							isSending={isSending}
							isVoiceChatActive={isVoiceChatActive}
							messages={messages}
							onArrowDown={handleArrowDown}
							onArrowUp={handleArrowUp}
							onChatInputChange={setChatInput}
							onCopy={handleCopy}
							onSendMessage={sendMessageVoid}
							onStartVoiceChat={startVoiceChatVoid}
							onStopVoiceChat={stopVoiceChatVoid}
						/>
					</div>
				</div>
			</div>
			{chatMinimized && !videoSelectOpen ? (
				<div className="pointer-events-none fixed bottom-6 left-1/2 z-[500] -translate-x-1/2">
					<button
						aria-label="Restore chat"
						className="pointer-events-auto flex items-center gap-2 rounded-full border border-primary bg-background px-4 py-3 text-foreground shadow-2xl shadow-black/60 hover:bg-muted"
						type="button"
						onClick={() => {
							setChatMinimized(false);
						}}
					>
						<span className="h-2 w-2 rounded-full bg-primary" />
						<span className="text-xs font-semibold">Chat</span>
					</button>
				</div>
			) : null}
		</div>
	);
}

export function SubmoduleChatShell() {
	const [apiService, setApiService] = useState<ApiService | null>(null);
	const [queryClient] = useState(() => new QueryClient());

	return (
		<QueryClientProvider client={queryClient}>
			<ApiServiceProvider service={apiService} setApiService={setApiService}>
				<ToastProvider>
					<StreamingAvatarProvider>
						<SubmoduleChatPanel />
					</StreamingAvatarProvider>
				</ToastProvider>
			</ApiServiceProvider>
		</QueryClientProvider>
	);
}
