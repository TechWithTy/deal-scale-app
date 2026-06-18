"use client";

import { ChatWorkbench } from "@/components/home/chat-workbench";

export default function DashboardChatPage() {
	return (
		<ChatWorkbench
			embedded
			fillAvailableHeight
			showChatFrameHeader={false}
			showHeader={false}
			showManual={false}
			showWorkspaceSidebars
		/>
	);
}
