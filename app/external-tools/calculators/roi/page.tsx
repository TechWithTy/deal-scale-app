import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { DealScaleRoiCalculator } from "external/calculators";

type RoiCalculatorPageProps = {
	searchParams?: Record<string, string | string[] | undefined>;
};

function requiresAuthentication(flag: string | string[] | undefined): boolean {
	if (!flag) return false;
	if (Array.isArray(flag)) {
		return flag.includes("required");
	}
	return flag === "required";
}

export const metadata: Metadata = {
	title: "Deal Scale ROI Calculator | External Tools",
	description:
		"Model manual and automated ROI scenarios with Deal Scale benchmarks. Share links externally or sign in to sync assumptions to your workspace.",
	alternates: {
		canonical: "/external-tools/calculators/roi",
	},
	openGraph: {
		title: "Deal Scale ROI Calculator",
		description:
			"Quantify ROI using Deal Scale's automation benchmarks and manual campaign inputs.",
		url: "https://dealscale.app/external-tools/calculators/roi",
		type: "website",
	},
};

export default async function RoiCalculatorPage({
	searchParams,
}: RoiCalculatorPageProps = {}) {
	const session = await auth();

	if (requiresAuthentication(searchParams?.auth) && !session) {
		redirect("/signin?next=/external-tools/calculators/roi");
	}

	const isAuthenticated = Boolean(session);

	return (
		<main className="mx-auto w-full max-w-5xl px-4 py-16 md:px-6">
			<header className="space-y-4 text-center">
				<p className="text-sm font-semibold uppercase tracking-wide text-orange-500">
					Financial ROI
				</p>
				<h1 className="text-balance text-4xl font-semibold text-foreground md:text-5xl">
					Deal Scale ROI Calculator
				</h1>
				<p className="text-balance text-lg text-muted-foreground">
					Compare profile-based automation against manual campaigns to quantify
					return on investment. Share this calculator externally or save your
					results directly to the Deal Scale dashboard when you sign in.
				</p>
			</header>

			<section className="mt-10 space-y-4 text-sm text-muted-foreground text-center">
				<p>
					Prefill the calculator by appending query parameters such as{" "}
					<code>dealsPerMonth</code>, <code>avgDealValue</code>, or{" "}
					<code>profitMarginPercent</code> to collaborate with clients and
					lenders on shared assumptions.
				</p>
				{!isAuthenticated ? (
					<div className="mx-auto flex w-fit flex-wrap items-center justify-center gap-3 rounded-full border border-dashed border-border bg-muted/40 px-5 py-3">
						<span>Want to save scenarios for later?</span>
						<Link
							className="inline-flex items-center justify-center rounded-full border border-transparent bg-background px-3 py-1.5 font-semibold text-foreground shadow-sm transition-colors hover:bg-foreground hover:text-background focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
							href="/signin?next=/external-tools/calculators/roi"
						>
							Sign in to sync ROI drafts
						</Link>
					</div>
				) : (
					<div className="mx-auto w-fit rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 font-medium text-emerald-700">
						Authenticated session detected—calculations stay with your Deal
						Scale account.
					</div>
				)}
			</section>

			<section className="mt-16">
				<DealScaleRoiCalculator
					className="rounded-3xl border border-border bg-card/60 shadow-sm"
					session={session}
				/>
			</section>
		</main>
	);
}
