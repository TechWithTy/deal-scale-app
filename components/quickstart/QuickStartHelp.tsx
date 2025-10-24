"use client";

import { Button } from "@/components/ui/button";

const QuickStartHelp = () => (
	<div className="mx-auto mt-12 max-w-5xl text-center">
		<div className="rounded-lg bg-muted/50 p-8">
			<h3 className="mb-4 font-semibold text-lg">Interactive Demo</h3>
			<p className="mb-6 text-muted-foreground text-sm">
				Watch this interactive demo to see how Deal Scale works in action.
			</p>

			{/* Supademo Embed */}
			<div className="mb-6 w-full">
				<div
					style={{
						position: "relative",
						boxSizing: "content-box",
						maxHeight: "80svh",
						width: "100%",
						aspectRatio: "2.028985507246377",
						padding: "40px 0 40px 0",
					}}
				>
					<iframe
						src="https://app.supademo.com/embed/cmgpmix8616ou12sxl6bxk80s?embed_v=2&utm_source=embed"
						loading="lazy"
						title="Supademo Demo"
						allow="clipboard-write"
						frameBorder="0"
						allowFullScreen
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							width: "100%",
							height: "100%",
						}}
					/>
				</div>
			</div>

			<Button variant="outline" size="sm">
				<a
					href="https://docs.dealscale.io/quick-start"
					target="_blank"
					rel="noopener noreferrer"
				>
					View Documentation
				</a>
			</Button>
		</div>
	</div>
);

export default QuickStartHelp;
