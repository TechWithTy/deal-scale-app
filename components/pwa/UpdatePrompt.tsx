"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useServiceWorkerUpdate } from "@/hooks/useServiceWorkerUpdate";

export function UpdatePrompt(): React.ReactElement | null {
	const { hasUpdate, applyUpdate, dismissUpdate, isReloading } =
		useServiceWorkerUpdate();
	const toastIdRef = useRef<string | number | null>(null);

	useEffect(() => {
		if (!hasUpdate) {
			if (toastIdRef.current !== null) {
				toast.dismiss(toastIdRef.current);
				toastIdRef.current = null;
			}
			return;
		}

		toastIdRef.current = toast.info("A new Deal Scale update is ready.", {
			action: {
				label: isReloading ? "Updating..." : "Refresh now",
				onClick: applyUpdate,
				disabled: isReloading,
			},
			dismissible: true,
			description: "We’ll reload to apply the latest improvements.",
			onDismiss: dismissUpdate,
		});

		return () => {
			if (toastIdRef.current !== null) {
				toast.dismiss(toastIdRef.current);
				toastIdRef.current = null;
			}
		};
	}, [hasUpdate, applyUpdate, dismissUpdate, isReloading]);

	return null;
}

export default UpdatePrompt;
