"use client";

import React from "react";
import { usePushManager } from "@/hooks/usePushManager";

interface PushManagerProps {
	children?: React.ReactNode;
}

export function PushManager({
	children,
}: PushManagerProps): React.ReactElement {
	const { isSupported, permission, isRegistering, subscription } =
		usePushManager();

	return (
		<React.Fragment>
			{children}
			<output
				aria-hidden="true"
				style={{ display: "none" }}
				data-push-supported={String(isSupported)}
				data-push-permission={permission}
				data-push-registering={String(isRegistering)}
				data-push-endpoint={subscription?.endpoint ?? ""}
			/>
		</React.Fragment>
	);
}

export default PushManager;
