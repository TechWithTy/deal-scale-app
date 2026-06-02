"use client";

import React from "react";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	StreamingAvatarProvider,
	StreamingAvatarSessionState,
} from "@/components/logic/context";
import { ChatPanel } from "@/external/interactive-avatar-nextjs-demo/components/AvatarSession/ChatPanel";
import { useChatController } from "@/external/interactive-avatar-nextjs-demo/components/AvatarSession/hooks/useChatController";
import {
	ApiServiceProvider,
} from "@/external/interactive-avatar-nextjs-demo/components/logic/ApiServiceContext";
import type { ApiService } from "@/lib/services/api";
import { useSessionStore } from "@/lib/stores/session";

function SubmoduleChatPanel() {
	const messages = useSessionStore((state) => state.messages);
	const {
		chatInput,
		setChatInput,
		isSending,
		isVoiceChatActive,
		canChat,
		isChatSolidBg,
		handleCopy,
		handleArrowUp,
		handleArrowDown,
		sendMessageVoid,
		startVoiceChatVoid,
		stopVoiceChatVoid,
		enableMockChatUi,
	} = useChatController(StreamingAvatarSessionState.CONNECTED);

	return (
		<ChatPanel
			chatInput={chatInput}
			canChat={canChat}
			dock="bottom"
			expanded
			isChatSolidBg={isChatSolidBg}
			isSending={isSending}
			isVoiceActive={isVoiceChatActive}
			messages={messages}
			sessionState={StreamingAvatarSessionState.CONNECTED}
			onArrowDown={handleArrowDown}
			onArrowUp={handleArrowUp}
			onChatInputChange={setChatInput}
			onCopy={handleCopy}
			onDock={() => {}}
			onHeaderPointerDown={() => {}}
			onSendMessage={sendMessageVoid}
			onStartMockChat={enableMockChatUi}
			onStartVoiceChat={startVoiceChatVoid}
			onStopVoiceChat={stopVoiceChatVoid}
			onToggleExpand={() => {}}
		/>
	);
}

export function SubmoduleChatShell() {
	const [apiService, setApiService] = useState<ApiService | null>(null);
	const [queryClient] = useState(() => new QueryClient());

	return (
		<QueryClientProvider client={queryClient}>
			<ApiServiceProvider service={apiService} setApiService={setApiService}>
				<StreamingAvatarProvider>
					<SubmoduleChatPanel />
				</StreamingAvatarProvider>
			</ApiServiceProvider>
		</QueryClientProvider>
	);
}
