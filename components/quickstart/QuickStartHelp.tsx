"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

const QuickStartHelp = () => (
	<div className="mx-auto mt-12 max-w-2xl text-center">
		<div className="rounded-lg bg-muted/50 p-6">
			<h3 className="mb-2 font-semibold text-lg">Need Help Getting Started?</h3>
			<p className="mb-4 text-muted-foreground text-sm">
				Our step-by-step guide will walk you through creating your first
				campaign, managing leads, and optimizing your outreach strategy.
			</p>
			<Button asChild variant="outline" size="sm">
				<Link href="https://docs.dealscale.io/quick-start" target="_blank">
					View Getting Started Guide
				</Link>
			</Button>
		</div>
	</div>
);

export default QuickStartHelp;
