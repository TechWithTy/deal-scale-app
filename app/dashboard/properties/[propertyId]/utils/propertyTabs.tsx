"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type * as React from "react";
import { useEffect, useRef, useState } from "react";
// Define the type for each tab
type TabData = {
	value: string;
	label: React.ReactNode;
	content: React.ReactNode; // The content can be any valid JSX
};

// Define the props for the PropertyTabsList component
interface PropertyTabsListProps {
	tabsData: TabData[]; // Array of TabData
	// Optional override to force a specific view regardless of screen size
	view?: "table" | "tabbed";
	// When view is not provided, use this as the initial mode (defaults to 'table')
	defaultView?: "table" | "tabbed";
	// Show a simple toggle to switch between views when view is not forced
	enableToggle?: boolean;
}

// DesktopTabs component
const DesktopTabs: React.FC<PropertyTabsListProps> = ({ tabsData }) => {
	const [visibleIndex, setVisibleIndex] = useState(0); // Manage the starting index of visible tabs
	const itemsPerPage = 3; // Number of tabs visible at a time on desktop

	const tabsRef = useRef<HTMLDivElement | null>(null); // Ref to the tab container

	// Move the tabs left by 3 (or fewer if near the start)
	const handlePrev = () => {
		setVisibleIndex((prev) => Math.max(prev - itemsPerPage, 0));
	};

	// Move the tabs right by 3 (or fewer if near the end)
	const handleNext = () => {
		setVisibleIndex((prev) =>
			Math.min(prev + itemsPerPage, tabsData.length - itemsPerPage),
		);
	};

	// Get the visible tabs to display
	const visibleTabs = tabsData.slice(visibleIndex, visibleIndex + itemsPerPage);

	const scrollToTab = (tabIndex: number) => {
		const tabElement = tabsRef.current?.children[tabIndex] as
			| HTMLElement
			| undefined;
		if (tabElement) {
			tabElement.scrollIntoView({
				behavior: "smooth",
				block: "nearest",
				inline: "center",
			});
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		scrollToTab(visibleIndex);
	}, [tabsData, visibleIndex]);

	return (
		<Tabs defaultValue={tabsData[0]?.value || ""} className="mt-6">
			{/* Tab navigation arrows */}
			<div className="flex items-center justify-between">
				{/* Left arrow */}
				<button
					type="button"
					onClick={handlePrev}
					disabled={visibleIndex === 0} // Disable if we're at the start
					className="rounded bg-gray-200 p-2 hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-gray-600"
				>
					←
				</button>

				{/* Scrollable Tab List */}
				<TabsList
					className="relative mx-2 flex w-full justify-center space-x-2 overflow-x-auto overflow-y-hidden rounded-lg bg-transparent px-2 py-2 sm:mx-4 sm:px-4"
					ref={tabsRef} // Attach ref to track the tab container
				>
					<div className="flex space-x-4">
						{/* Map over the visible tabs only (3 tabs at a time) */}
						{visibleTabs.map((tab, index) => (
							<TabsTrigger
								key={tab.value}
								value={tab.value}
								onClick={() => scrollToTab(visibleIndex + index)} // Scroll into view when clicked
								className="min-w-[60px] flex-shrink-0 rounded-lg bg-gray-100 px-2 text-center text-black hover:bg-gray-200 sm:min-w-[100px] sm:px-4 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
							>
								{tab.label}
							</TabsTrigger>
						))}
					</div>
				</TabsList>

				{/* Right arrow */}
				<button
					type="button"
					onClick={handleNext}
					disabled={visibleIndex >= tabsData.length - itemsPerPage} // Disable if we're at the end
					className="rounded bg-gray-200 p-2 hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-gray-600"
				>
					→
				</button>
			</div>

			{/* Render the content for each tab */}
			{tabsData.map((tab) => (
				<TabsContent key={tab.value} value={tab.value}>
					{tab.content}
				</TabsContent>
			))}
		</Tabs>
	);
};

// MobileTabs component

const MobileAccordion: React.FC<PropertyTabsListProps> = ({ tabsData }) => {
	return (
		<Accordion type="single" collapsible className="mt-6 w-full">
			{tabsData.map((tab: TabData) => (
				<AccordionItem key={tab.value} value={tab.value}>
					<AccordionTrigger>{tab.label}</AccordionTrigger>
					<AccordionContent>
						<div className="p-4">{tab.content}</div>
					</AccordionContent>
				</AccordionItem>
			))}
		</Accordion>
	);
};

// Main component to conditionally render Mobile or Desktop tabs
const PropertyTabsList: React.FC<PropertyTabsListProps> = ({
	tabsData,
	view,
	defaultView = "table",
	enableToggle = true,
}) => {
	// If a view is explicitly requested, render that mode for all screen sizes
	if (view === "table") {
		return <MobileAccordion tabsData={tabsData} />;
	}
	if (view === "tabbed") {
		return <DesktopTabs tabsData={tabsData} />;
	}
	// No forced view: maintain internal mode with default to 'table'
	const [mode, setMode] = useState<"table" | "tabbed">(defaultView);
	return (
		<div className="mt-4">
			{enableToggle && (
				<div className="mb-3 flex items-center gap-2">
					<span className="text-sm text-muted-foreground">View:</span>
					<div className="inline-flex border border-border rounded-md bg-card p-1">
						<button
							type="button"
							aria-pressed={mode === "table"}
							onClick={() => setMode("table")}
							className={`rounded px-3 py-1 text-sm ${mode === "table" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
						>
							Table
						</button>
						<button
							type="button"
							aria-pressed={mode === "tabbed"}
							onClick={() => setMode("tabbed")}
							className={`rounded px-3 py-1 text-sm ${mode === "tabbed" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
						>
							Tabbed
						</button>
					</div>
				</div>
			)}
			{mode === "table" ? (
				<MobileAccordion tabsData={tabsData} />
			) : (
				<DesktopTabs tabsData={tabsData} />
			)}
		</div>
	);
};

export default PropertyTabsList;
