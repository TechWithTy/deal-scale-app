"use client";

import { ChatWorkbench } from "@/components/home/chat-workbench";

export default function DashboardChatPage() {
	return (
		<ChatWorkbench
			embedded
			showChatFrameHeader={false}
			showHeader={false}
			showManual={false}
		/>
	);
}
