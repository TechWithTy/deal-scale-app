import Link from "next/link";

const DEMO_URL =
	process.env.NEXT_PUBLIC_INTERACTIVE_AVATAR_DEMO_URL ??
	"http://localhost:3001";

export default function InteractiveAvatarDemoPage() {
	return (
		<main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 py-8 text-slate-100">
			<div className="mx-auto flex max-w-7xl flex-col gap-6">
				<header className="space-y-3">
					<p className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-cyan-200 text-xs uppercase tracking-[0.28em]">
						External Submodule
					</p>
					<h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
						Interactive Avatar Next.js Demo
					</h1>
					<p className="max-w-3xl text-slate-300">
						This page wires the standalone
						<code className="mx-1 rounded bg-white/5 px-1.5 py-0.5 text-slate-100 text-sm">
							external/interactive-avatar-nextjs-demo
						</code>
						submodule into the app as an embeddable test surface.
					</p>
				</header>

				<section className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/20 lg:grid-cols-[280px_1fr]">
					<div className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
						<div className="space-y-2">
							<h2 className="font-semibold text-lg">Run target</h2>
							<p className="text-slate-300 text-sm">
								Point this page at the submodule dev server with
								<code className="mx-1 rounded bg-white/5 px-1.5 py-0.5 text-slate-100">
									NEXT_PUBLIC_INTERACTIVE_AVATAR_DEMO_URL
								</code>
								or run it on
								<code className="mx-1 rounded bg-white/5 px-1.5 py-0.5 text-slate-100">
									{DEMO_URL}
								</code>
								.
							</p>
						</div>

						<div className="space-y-2 text-sm text-slate-300">
							<p className="font-medium text-slate-100">What this gives you</p>
							<ul className="space-y-1">
								<li>- A real route inside this repo.</li>
								<li>- No fragile import coupling to the submodule app.</li>
								<li>- A stable place to verify iframe behavior and layout.</li>
							</ul>
						</div>

						<div className="flex flex-col gap-2">
							<Link
								className="rounded-xl bg-cyan-400 px-4 py-2 text-center font-medium text-slate-950 transition hover:bg-cyan-300"
								href={DEMO_URL}
								target="_blank"
								rel="noreferrer"
							>
								Open Submodule
							</Link>
						</div>
					</div>

					<div className="min-h-[70vh] overflow-hidden rounded-2xl border border-white/10 bg-black">
						<iframe
							allow="camera; microphone; autoplay; clipboard-read; clipboard-write; fullscreen"
							className="h-full min-h-[70vh] w-full border-0"
							src={DEMO_URL}
							title="Interactive Avatar Next.js Demo"
						/>
					</div>
				</section>
			</div>
		</main>
	);
}
