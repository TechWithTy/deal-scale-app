import ThemeToggle from "@/components/layout/ThemeToggle/theme-toggle";
import { mockSubscriptions } from "@/constants/_faker/profile/userSubscription";
import { cn } from "@/lib/_utils/kanban/utils";
import { SecurityModal } from "../reusables/modals/user/security";
import { UpgradeButton } from "../reusables/modals/user/usage/UpgradeModalButton";
import { MobileSidebar } from "./mobile-sidebar";
import { UserNav } from "./user-nav";

export default function Header() {
	return (
		<header className="sticky inset-x-0 top-0 w-full">
			<nav className="flex items-center justify-between px-4 py-2 md:justify-end">
				<div className="flex items-center gap-2">
					<UpgradeButton currentMembership={mockSubscriptions[1]} />
					<UserNav />
					<ThemeToggle />
					<SecurityModal />
				</div>
				<div className={cn("lg:!hidden mx-5 block")}>
					<MobileSidebar />
				</div>
			</nav>
		</header>
	);
}
