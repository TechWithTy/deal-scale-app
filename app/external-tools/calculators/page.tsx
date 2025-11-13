import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { calculatorDefinitions } from "external/calculators";
import { CalculatorHub } from "external/calculators/components/CalculatorHub";

type CalculatorsPageProps = {
	searchParams?: Record<string, string | string[] | undefined>;
};

export const metadata: Metadata = {
	title: "Calculator Hub | Deal Scale External Tools",
	description:
		"Run ROI, cash flow, and financing calculators without leaving Deal Scale. Prefill values via URL parameters and share results with partners.",
	alternates: {
		canonical: "/external-tools/calculators",
	},
	openGraph: {
		title: "Deal Scale Calculator Hub",
		description:
			"Financial modeling calculators built for real estate operators and revenue teams.",
		url: "https://dealscale.app/external-tools/calculators",
		type: "website",
	},
};

export default async function CalculatorsPage({
	searchParams,
}: CalculatorsPageProps) {
	const session = await auth();
	const authFlag = searchParams?.auth;
	const requiresAuth =
		typeof authFlag === "string" ? authFlag === "required" : false;

	if (requiresAuth && !session) {
		redirect("/signin?next=/external-tools/calculators");
	}

	const isAuthenticated = Boolean(session);

	return (
		<main className="max-w-6xl md:px-6 mx-auto px-4 py-16 w-full">
			<header className="mx-auto max-w-3xl space-y-4 text-center">
				<p className="text-sm font-semibold uppercase tracking-wide text-orange-500">
					Deal Modeling
				</p>
				<h1 className="text-balance text-4xl font-semibold text-foreground md:text-5xl">
					Calculator Hub
				</h1>
				<p className="text-balance text-lg text-muted-foreground">
					Run the same calculators available inside the Deal Scale dashboard— no
					authentication required. Prefill any calculator by adding query
					parameters like <code>loanAmount</code> or <code>purchasePrice</code>
					to the URL.
				</p>
			</header>

			<section className="mt-12 space-y-6 text-center">
				{isAuthenticated ? (
					<div className="mx-auto w-fit rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
						You are signed in—results sync to your dashboard history.
					</div>
				) : (
					<div className="mx-auto flex w-fit flex-wrap items-center justify-center gap-3 rounded-full border border-dashed border-border bg-muted/40 px-5 py-3 text-sm text-muted-foreground">
						<span>Visiting without an account?</span>
						<Link
							className="inline-flex items-center justify-center rounded-full border border-transparent bg-background px-3 py-1.5 font-semibold text-foreground shadow-sm transition-colors hover:bg-foreground hover:text-background focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
							href="/signin?next=/external-tools/calculators"
						>
							Sign in to save your inputs
						</Link>
					</div>
				)}
				<p className="text-sm text-muted-foreground">
					Tip: append <code>?calculator=roi</code> or any calculator ID to jump
					directly to a module. Share links with partners to collaborate on the
					same underwriting assumptions.
				</p>
			</section>

			<section className="mt-16 space-y-12">
				<CalculatorHub calculators={calculatorDefinitions} />
			</section>
		</main>
	);
}
