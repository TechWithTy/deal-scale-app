"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useModalStore } from "@/lib/stores/dashboard";
import { useUserProfileStore } from "@/lib/stores/user/userProfile";
import { signOut } from "next-auth/react"; // Still needed for logging out
import { useRouter } from "next/navigation";

export function UserNav() {
	const router = useRouter();
	const { userProfile } = useUserProfileStore(); // ✅ Fetching profile from Zustand store
	const {
		openUsageModal,
		openBillingModal,
		openSecurityModal,
		openWebhookModal,
		openEmployeeModal,
	} = useModalStore();

	if (!userProfile) return null; // ✅ Ensure component doesn't render without profile

	const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
		userProfile.firstName,
	)}`;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="relative h-8 w-8 rounded-full">
					<Avatar className="h-8 w-8">
						<AvatarImage
							src={userProfile?.companyInfo?.companyLogo ?? avatarUrl}
							alt={userProfile?.firstName ?? ""}
						/>
						<AvatarFallback>
							{userProfile?.firstName?.charAt(0).toUpperCase() ?? "?"}
						</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56" align="end" forceMount>
				<DropdownMenuLabel className="font-normal">
					<div className="flex flex-col space-y-1">
						<p className="font-medium text-sm leading-none">
							{userProfile?.firstName ?? "User"}
						</p>
						<p className="text-muted-foreground text-xs leading-none">
							{userProfile?.email}
						</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem
						className="cursor-pointer"
						onClick={() => router.push("/dashboard/profile")}
					>
						Profile
						<DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
					</DropdownMenuItem>
					<DropdownMenuItem className="cursor-pointer" onClick={openUsageModal}>
						Usage
						<DropdownMenuShortcut>⌘U</DropdownMenuShortcut>
					</DropdownMenuItem>
					<DropdownMenuItem
						className="cursor-pointer"
						onClick={openBillingModal}
					>
						Billing
						<DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
					</DropdownMenuItem>
					<DropdownMenuItem
						className="cursor-pointer"
						onClick={openSecurityModal}
					>
						Security
						<DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
					</DropdownMenuItem>
					<DropdownMenuItem
						className="cursor-pointer"
						onClick={openWebhookModal}
					>
						Webhooks
						<DropdownMenuShortcut>⌘W</DropdownMenuShortcut>
					</DropdownMenuItem>
					<DropdownMenuItem
						className="cursor-pointer"
						onClick={openEmployeeModal}
					>
						Add Team Member
						<DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					className="cursor-pointer"
					onClick={() => signOut({ callbackUrl: "/auth/signin" })}
				>
					Log out
					<DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
