"use client";

/**
 * ExpandableAISummarySkeleton
 * Minimal loading state to mirror the shape of ExpandableAISummary.
 */
export default function ExpandableAISummarySkeleton() {
	return (
		<section className="w-full rounded-lg border border-border bg-background overflow-hidden">
			<div className="p-4 border-b border-border">
				<div className="animate-pulse space-y-3">
					<div className="h-5 w-64 rounded bg-muted" />
					<div className="h-3 w-96 rounded bg-muted" />
					<div className="mt-4 h-2 w-full rounded-full bg-muted" />
				</div>
			</div>
			<div className="p-4">
				<div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
					{Array.from({ length: 6 }).map((_, i) => (
						<div
							key={i}
							className="rounded-lg border border-border bg-card p-4"
						>
							<div className="animate-pulse space-y-3">
								<div className="h-4 w-40 rounded bg-muted" />
								<div className="h-3 w-24 rounded bg-muted" />
								<div className="h-1.5 w-full rounded-full bg-muted" />
								<div className="h-3 w-56 rounded bg-muted" />
								<div className="h-3 w-48 rounded bg-muted" />
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
