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
import { useSessionStore } from "@/lib/stores/user/useSessionStore";
import { useUserProfileStore } from "@/lib/stores/user/userProfile";
import { signOut } from "next-auth/react"; // Still needed for logging out
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

void React;

export function UserNav() {
	const router = useRouter();
	const sessionUser = useSessionStore((state) => state.user);
	const { userProfile } = useUserProfileStore();
	const {
		openUsageModal,
		openSecurityModal,
		openWebhookModal,
		openEmployeeModal,
	} = useModalStore();

	/**
	 * Opens Stripe Customer Portal in a new tab
	 * TODO: Replace with actual API endpoint that creates a Stripe billing portal session
	 */
	const handleBillingClick = async () => {
		try {
			// TODO: Call API endpoint to create Stripe billing portal session
			// const response = await fetch('/api/stripe/create-portal-session', {
			//   method: 'POST',
			//   headers: { 'Content-Type': 'application/json' },
			// });
			// const { url } = await response.json();
			// window.open(url, '_blank');

			// Placeholder: Open Stripe dashboard or configured portal URL
			const stripePortalUrl =
				process.env.NEXT_PUBLIC_STRIPE_PORTAL_URL || "/api/stripe/portal";

			// Open in new tab
			window.open(stripePortalUrl, "_blank", "noopener,noreferrer");

			toast.success("Opening billing portal in new tab");
		} catch (error) {
			console.error("Error opening billing portal:", error);
			toast.error("Failed to open billing portal. Please try again.");
		}
	};

	if (!sessionUser && !userProfile) return null;

	const displayName =
		sessionUser?.name ||
		sessionUser?.email ||
		(userProfile?.firstName
			? `${userProfile.firstName} ${userProfile.lastName ?? ""}`.trim()
			: null) ||
		"User";
	const email = sessionUser?.email ?? userProfile?.email ?? "";
	const avatarSeed =
		sessionUser?.name ?? sessionUser?.email ?? userProfile?.firstName ?? "User";
	const avatarUrl =
		userProfile?.companyInfo?.companyLogo ||
		sessionUser?.image ||
		`https://ui-avatars.com/api/?name=${encodeURIComponent(avatarSeed)}`;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className="relative h-8 w-8 rounded-full"
					aria-label={`Open user menu for ${displayName}`}
				>
					<Avatar className="h-8 w-8">
						<AvatarImage src={avatarUrl} alt={displayName} />
						<AvatarFallback>
							{avatarSeed?.charAt(0).toUpperCase() ?? "?"}
						</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56" align="end" forceMount>
				<DropdownMenuLabel className="font-normal">
					<div className="flex flex-col space-y-1">
						<p className="font-medium text-sm leading-none">{displayName}</p>
						<p className="text-muted-foreground text-xs leading-none">
							{email}
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
						onClick={handleBillingClick}
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
						onClick={() => openWebhookModal("incoming", "leads")}
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
				<DropdownMenuItem className="cursor-pointer" onClick={() => signOut()}>
					Log out
					<DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
