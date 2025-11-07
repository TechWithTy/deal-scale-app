"use client";

import { useEffect, useRef } from "react";

interface MermaidProps {
	chart: string;
}

export default function Mermaid({ chart }: MermaidProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!containerRef.current) return;

		// Dynamically import mermaid to avoid SSR issues
		import("mermaid").then((mermaidModule) => {
			const mermaid = mermaidModule.default;

			mermaid.initialize({
				startOnLoad: false,
				theme: "dark",
				themeVariables: {
					primaryColor: "#8b5cf6",
					primaryTextColor: "#fff",
					primaryBorderColor: "#a78bfa",
					lineColor: "#6366f1",
					secondaryColor: "#ec4899",
					tertiaryColor: "#3b82f6",
					background: "#1e293b",
					mainBkg: "#1e293b",
					secondBkg: "#334155",
					tertiaryBkg: "#475569",
					darkMode: true,
					fontFamily: "ui-sans-serif, system-ui, sans-serif",
				},
				flowchart: {
					curve: "basis",
					padding: 20,
				},
			});

			// Clear previous content
			containerRef.current!.innerHTML = chart;

			// Render the mermaid diagram
			const id = `mermaid-${Math.random().toString(36).slice(2, 11)}`;
			mermaid
				.render(id, chart)
				.then(({ svg }) => {
					if (containerRef.current) {
						containerRef.current.innerHTML = svg;
					}
				})
				.catch((error) => {
					console.error("Mermaid rendering error:", error);
					if (containerRef.current) {
						containerRef.current.innerHTML = `<div class="text-destructive text-sm">Error rendering diagram</div>`;
					}
				});
		});
	}, [chart]);

	return (
		<div
			ref={containerRef}
			className="mermaid-container flex items-center justify-center min-h-[200px] w-full"
		/>
	);
}
