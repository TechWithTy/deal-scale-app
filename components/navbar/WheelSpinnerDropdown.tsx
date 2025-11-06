"use client";

import { CircleDashed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModalStore } from "@/lib/stores/dashboard";
import { useGamificationStore } from "@/lib/stores/gamification";
import { useSessionStore } from "@/lib/stores/user/useSessionStore";
import { useEffect, useState } from "react";

export default function WheelSpinnerDropdown() {
	const { openWheelSpinnerModal } = useModalStore();
	const { checkSpinAvailability, markSpinAsViewed } = useGamificationStore();
	const sessionUser = useSessionStore((state) => state.user);
	const [isAvailable, setIsAvailable] = useState(false);

	// Check spin availability periodically
	useEffect(() => {
		const userId = sessionUser?.id || sessionUser?.email || "demo-user";

		const checkAvailability = () => {
			const available = checkSpinAvailability(userId, "daily");
			setIsAvailable(available);
		};

		checkAvailability();

		// Check every minute
		const interval = setInterval(checkAvailability, 60000);

		return () => clearInterval(interval);
	}, [sessionUser, checkSpinAvailability]);

	const handleClick = () => {
		markSpinAsViewed();
		setIsAvailable(false);
		openWheelSpinnerModal();
	};

	return (
		<Button
			variant="outline"
			size="icon"
			aria-label="Open daily wheel spinner"
			className="relative"
			onClick={handleClick}
		>
			<CircleDashed className="h-[1.1rem] w-[1.1rem]" />
			{isAvailable ? (
				<span className="absolute -right-0.5 -top-0.5 inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-amber-400" />
			) : null}
		</Button>
	);
}
