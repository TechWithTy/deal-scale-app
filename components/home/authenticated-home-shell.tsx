import React from "react";
import ImpersonationBanner from "@/components/admin/ImpersonationBanner";
import { DemoRevealWrapper } from "@/components/demo/DemoRevealWrapper";
import { ChatWorkbench } from "@/components/home/chat-workbench";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { MockUserProfile } from "@/constants/_faker/profile/userProfile";

export function AuthenticatedHomeShell() {
	const user = MockUserProfile || null;

	return (
		<DemoRevealWrapper>
			<div className="flex">
				<Sidebar user={user} />
				<main className="w-full flex-1 overflow-x-hidden overflow-y-auto">
					<ImpersonationBanner />
					<Header />
					<div className="px-4 py-6 md:px-6">
						<ChatWorkbench embedded />
					</div>
				</main>
			</div>
		</DemoRevealWrapper>
	);
}
