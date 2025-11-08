export type MountOptions = {
	selector?: string;
	onError?: (error: Error) => void;
};

export function ensureStylesheet(
	identifier: string,
	href: string,
): void {
	if (typeof document === "undefined") {
		return;
	}

	const selector = `link[data-${identifier}]`;
	if (document.querySelector(selector)) {
		return;
	}

	const link = document.createElement("link");
	link.rel = "stylesheet";
	link.href = href;
	link.setAttribute(`data-${identifier}`, "true");
	document.head.appendChild(link);
}

export function normalizeError(error: unknown): Error {
	if (error instanceof Error) {
		return error;
	}
	if (typeof error === "string") {
		return new Error(error);
	}
	return new Error("Unknown embed error");
}

export function renderConfigError(
	host: Element,
	error: Error,
	message = "Invalid configuration",
	attributes?: {
		flag?: string;
		message?: string;
		className?: string;
	},
): void {
	const flagAttr = attributes?.flag ?? "data-embed-error";
	const messageAttr = attributes?.message ?? "data-embed-error-message";
	const className = attributes?.className ?? "deal-scale-embed-error";
	host.setAttribute(flagAttr, "true");
	host.setAttribute(messageAttr, error.message);
	host.innerHTML = `<div class="${className}" role="alert">${message}</div>`;
}

