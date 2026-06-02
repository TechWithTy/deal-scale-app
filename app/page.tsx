import React from "react";
import { ChatWorkbench } from "@/components/home/chat-workbench";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function HomePage() {
	return <ChatWorkbench />;
}
