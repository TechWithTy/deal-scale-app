export function extractYouTubeId(s: string): string {
	try {
		if (s.includes("youtube.com") || s.includes("youtu.be")) {
			const u = new URL(s);
			if (u.hostname.includes("youtu.be")) return u.pathname.replace("/", "");
			const v = u.searchParams.get("v");
			if (v) return v;
			const parts = u.pathname.split("/");
			return parts[parts.length - 1] || s;
		}
		return s;
	} catch {
		return s;
	}
}
