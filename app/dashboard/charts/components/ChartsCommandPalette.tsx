"use client";

import type { CommandItem } from "external/action-bar/utils/types";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Component to register chart-specific commands in the command palette
 */
export function ChartsCommandPalette() {
	const router = useRouter();

	useEffect(() => {
		// Check if command palette API is available
		if (typeof window === "undefined" || !(window as any).DealActionBar) {
			return;
		}

		const commands: CommandItem[] = [
			{
				id: "charts-open",
				label: "Open Charts & Analytics",
				group: "Navigation",
				icon: "chart",
				run: () => router.push("/dashboard/charts"),
			},
			{
				id: "charts-refresh",
				label: "Refresh Chart Data",
				group: "Actions",
				icon: "refresh",
				run: () => {
					// Trigger a page reload to refresh data
					window.location.reload();
				},
			},
			{
				id: "charts-export-data",
				label: "Export Analytics Data",
				group: "Actions",
				icon: "download",
				run: () => {
					// TODO: Implement data export functionality
					console.log("Export analytics data");
					alert("Export functionality coming soon!");
				},
			},
			{
				id: "charts-roi-calculator",
				label: "Open ROI Calculator",
				group: "Tools",
				icon: "calculator",
				run: () => {
					// Scroll to ROI calculator
					const roiElement = document.querySelector('[class*="ROICalculator"]');
					if (roiElement) {
						roiElement.scrollIntoView({ behavior: "smooth", block: "center" });
					}
				},
			},
			{
				id: "charts-view-pipeline",
				label: "View Sales Pipeline",
				group: "Charts",
				icon: "pipeline",
				run: () => {
					// Scroll to pipeline visualization
					const pipelineElement = document.querySelector(
						'[class*="SalesPipelineFunnel"]',
					);
					if (pipelineElement) {
						pipelineElement.scrollIntoView({
							behavior: "smooth",
							block: "center",
						});
					}
				},
			},
			{
				id: "charts-campaign-performance",
				label: "View Campaign Performance",
				group: "Charts",
				icon: "chart-bar",
				run: () => {
					// Scroll to campaign chart
					const campaignElement = document.querySelector(
						'[class*="CampaignPerformanceChart"]',
					);
					if (campaignElement) {
						campaignElement.scrollIntoView({
							behavior: "smooth",
							block: "center",
						});
					}
				},
			},
		];

		// Register commands
		(window as any).DealActionBar.register(commands);

		// Cleanup function
		return () => {
			// Note: Command palette doesn't have an unregister function
			// Commands will persist until page reload
		};
	}, [router]);

	return null; // This component doesn't render anything
}
