import { readFile } from "node:fs/promises";
import path from "node:path";

const SPEC_PATH = path.join(
	process.cwd(),
	"public",
	"openapi",
	"deal-scale-public.openapi.json",
);

export async function GET() {
	const spec = await readFile(SPEC_PATH, "utf8");

	return new Response(spec, {
		headers: {
			"Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
			"Content-Type": "application/json; charset=utf-8",
		},
	});
}
