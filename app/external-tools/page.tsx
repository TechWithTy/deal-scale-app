import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";

type ExternalToolsPageProps = {
	searchParams?: Record<string, string | string[] | undefined>;
};

type ExternalTool = {
	description: string;
	href: string;
	id: string;
	items: readonly string[];
	label: string;
	tags: readonly string[];
	type: "external" | "internal";
};

const tools: readonly ExternalTool[] = [
	{
		description:
			"Solve ROI, cash-on-cash, debt coverage, and acquisition underwriting with interactive inputs that generate shareable links.",
		href: "/external-tools/calculators",
		id: "calculator-hub",
		items: [
			"Quickly model financing terms for wholesale, fix-and-flip, or rental deals.",
			"Prefill calculators via URL parameters to align everyone on assumptions.",
			"Export structured deal snapshots for lenders or funding partners.",
		],
		label: "Calculator Hub",
		tags: ["Deal Analysis", "Financial Modeling"],
		type: "internal",
	},
	{
		description:
			"Collaborate on Deal Scale-specific benchmarks while exploring manual versus automated ROI scenarios with shareable presets.",
		href: "/external-tools/calculators/roi",
		id: "deal-scale-roi",
		items: [
			"Toggle between manual campaign inputs and profile-based automation results.",
			"Prefill assumptions via URL parameters for async stakeholder reviews.",
			"Save ROI drafts to your workspace when signed in.",
		],
		label: "Deal Scale ROI Calculator",
		tags: ["ROI", "Financial Modeling"],
		type: "internal",
	},
	{
		description:
			"Audit on-page SEO fundamentals—titles, meta descriptions, performance metrics, and schema hints—to keep lead funnels discoverable.",
		href: "https://app.neilpatel.com/en/seo_analyzer",
		id: "seo-analyzer",
		items: [
			"Identify quick wins for technical and content-driven SEO improvements.",
			"Download a prioritized checklist for future team stand-ups.",
			"Monitor progress across multiple campaign landing pages.",
		],
		label: "SEO Analyzer",
		tags: ["SEO", "Site Audit"],
		type: "external",
	},
	{
		description:
			"Verify SPF, DKIM, and inbox placement signals to maintain deliverability for outbound campaigns and nurture sequences.",
		href: "https://www.mail-tester.com",
		id: "deliverability-checker",
		items: [
			"Receive a detailed spam score with tactical remediation advice.",
			"Validate new sender domains before scaling automation volume.",
			"Share reports with marketing or revenue operations teams instantly.",
		],
		label: "Deliverability Checker",
		tags: ["Deliverability", "Outbound Email"],
		type: "external",
	},
] as const;

export const metadata: Metadata = {
	title: "External Growth Tools | Deal Scale",
	description:
		"Curated calculators, SEO analyzers, and lead generation utilities you can use without leaving Deal Scale.",
	alternates: {
		canonical: "/external-tools",
	},
	openGraph: {
		title: "Deal Scale External Tools",
		description:
			"Free resources for lead generation, SEO, and deal underwriting.",
		url: "https://dealscale.app/external-tools",
		type: "website",
	},
};

export default async function ExternalToolsPage({
	searchParams,
}: ExternalToolsPageProps) {
	const session = await auth();
	const authFlag = searchParams?.auth;
	const requiresAuth =
		typeof authFlag === "string" ? authFlag === "required" : false;

	if (requiresAuth && !session) {
		redirect("/signin?next=/external-tools");
	}

	const isAuthenticated = Boolean(session);

	return (
		<main className="max-w-6xl md:px-6 mx-auto px-4 py-16 w-full">
			<header className="mx-auto max-w-3xl space-y-6 text-center">
				<p className="text-sm font-semibold uppercase tracking-wide text-orange-500">
					Growth Enablement
				</p>
				<h1 className="text-balance text-4xl font-semibold text-foreground md:text-5xl">
					External Growth Tools
				</h1>
				<p className="text-balance text-lg text-muted-foreground">
					Access curated calculators, SEO audits, and deliverability diagnostics
					that compound with the Deal Scale platform. Every resource is safe to
					share with clients and partners—no login required.
				</p>
			</header>

			<section
				aria-label="Featured tools"
				className="mt-16 grid gap-6 md:grid-cols-2"
			>
				{tools.map((tool) => (
					<article
						key={tool.id}
						className="border border-border bg-card/60 p-6 shadow-sm transition-shadow hover:shadow-md rounded-2xl"
					>
						<div className="space-y-3">
							<div className="flex items-center gap-2">
								<h2 className="text-xl font-semibold text-foreground">
									{tool.label}
								</h2>
								{tool.type === "external" ? (
									<span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
										External
									</span>
								) : (
									<span className="rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-orange-600">
										Deal Scale
									</span>
								)}
							</div>
							<p className="text-sm text-muted-foreground">
								{tool.description}
							</p>
						</div>

						<ul className="mt-6 space-y-2 text-sm text-muted-foreground">
							{tool.items.map((item) => (
								<li key={item} className="flex gap-2">
									<span aria-hidden="true" className="text-orange-500">
										•
									</span>
									<span>{item}</span>
								</li>
							))}
						</ul>

						<div className="mt-6 flex flex-wrap items-center gap-2">
							{tool.tags.map((tag) => (
								<span
									key={tag}
									className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground"
								>
									{tag}
								</span>
							))}
						</div>

						<div className="mt-8 flex flex-wrap items-center gap-3">
							<Link
								className="inline-flex items-center justify-center rounded-full border border-transparent bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
								href={tool.href}
								prefetch={tool.type === "internal"}
								rel={
									tool.type === "external" ? "noreferrer noopener" : undefined
								}
								target={tool.type === "external" ? "_blank" : undefined}
							>
								{tool.type === "external" ? "Open Tool" : "Explore Tool"}
							</Link>
							{tool.type === "external" ? (
								<p className="text-xs text-muted-foreground">
									No account required. Opens in a new tab.
								</p>
							) : (
								<p className="text-xs text-muted-foreground">
									All calculators mirror the signed-in dashboard experience.
								</p>
							)}
						</div>
					</article>
				))}
			</section>

			{!isAuthenticated ? (
				<aside className="mt-20 rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center">
					<h2 className="text-xl font-semibold text-foreground">
						Want to save your calculator inputs?
					</h2>
					<p className="mt-2 text-sm text-muted-foreground">
						Sign in to Deal Scale to sync underwriting drafts and deliverability
						checklists with the rest of your team.
					</p>
					<Link
						className="mt-4 inline-flex items-center justify-center rounded-full border border-transparent bg-background px-5 py-2 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-foreground hover:text-background focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
						href="/signin?next=/external-tools"
					>
						Sign in to save progress
					</Link>
				</aside>
			) : (
				<aside className="mt-20 rounded-2xl border border-dashed border-border bg-emerald-50/50 p-6 text-center text-emerald-700">
					<h2 className="text-xl font-semibold">Authenticated view detected</h2>
					<p className="mt-2 text-sm">
						Your Deal Scale account is active—launch calculators above or head
						back to the dashboard for saved analyses.
					</p>
				</aside>
			)}
		</main>
	);
}
