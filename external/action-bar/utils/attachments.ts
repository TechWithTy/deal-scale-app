export type ParsedAttachment =
	| { type: "youtube"; value: string }
	| { type: "image"; value: string }
	| { type: "url"; value: string };

export function parseUrlAttachments(q: string): ParsedAttachment[] {
	if (!q) return [];
	// Collect potential tokens: http(s), protocol-relative, data URLs, relative paths, or bare filenames
	const tokens = Array.from(
		new Set(
			q.match(
				/(?:https?:\/\/|data:image\/[a-zA-Z+.-]+;base64,|\/\/)[^\s]+|(?:\.\/|\.\.\/|\/)?[^\s]+/gi,
			) ?? [],
		),
	);

	const imageExt = /\.(png|jpe?g|gif|webp|svg|bmp|ico|avif|heic|heif)(\?.*)?$/i;

	return tokens
		.filter((u) => u.trim().length > 0)
		.map((u) => {
			if (u.includes("youtu.be") || u.includes("youtube.com")) {
				return { type: "youtube", value: u } as const;
			}
			// data URL image
			if (/^data:image\//i.test(u)) {
				return { type: "image", value: u } as const;
			}
			// protocol-relative or http(s) with image extension
			if (imageExt.test(u)) {
				return { type: "image", value: u } as const;
			}
			// If it looks like a relative path or bare filename with an image extension
			if (imageExt.test(u.split("?")[0])) {
				return { type: "image", value: u } as const;
			}
			// Otherwise treat as a generic URL-like token
			return { type: "url", value: u } as const;
		});
}

export function friendlyGeneratedImageName(now: Date = new Date()): string {
	return `Generated Image ${now.toLocaleDateString(undefined, {
		month: "long",
		day: "2-digit",
		year: "numeric",
	})}`;
}

export function filenameFromUrl(u: string): string | null {
	try {
		// Remove query/hash for parsing filename
		const cleaned = u.split("#")[0].split("?")[0];
		const parts = cleaned.split("/");
		const last = parts[parts.length - 1];
		if (!last) return null;
		return last;
	} catch {
		return null;
	}
}
