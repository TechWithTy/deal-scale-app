"use client";

import { useEffect, useMemo, useState } from "react";
import PropertyTabsList from "@/app/dashboard/properties/[propertyId]/utils/propertyTabs";
import { toPropertySummary } from "@/external/tabbed-list-test";
import type { PropertySummary } from "@/external/tabbed-list-test/schemas/types";
import {
	PropertyImage,
	PropertyAddress,
	PropertyPrice,
	PropertyDetails,
	PropertyBadges,
	PropertySelectionButton,
} from "@/external/tabbed-list-test/components/PropertyCardPrimitives";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Settings2, GripVertical } from "lucide-react";
import {
	ExpandableAISummary,
	ExpandableAISummarySkeleton,
} from "@/external/ai-summary-expandable/components";

export default function TabbedListTestPage() {
	// Loading showcase for AI Summary story
	const [aiLoading, setAiLoading] = useState(true);
	useEffect(() => {
		const t = setTimeout(() => setAiLoading(false), 900);
		return () => clearTimeout(t);
	}, []);

	const aiSection = useMemo(
		() => ({
			title: "Property Location & Market Analysis",
			description: "Likelihood of finding off-market deals in this area",
			overallScore: 85,
			overallDelta: 2,
			cards: [
				{
					title: "Crime Score",
					description: "Safety assessment of the neighborhood",
					score: 72,
					delta: 0,
					bullets: [
						"Crime rate analysis",
						"Safety trends",
						"Local law enforcement presence",
					],
					href: "https://www.google.com/maps",
					icon: "🛡️",
				},
				{
					title: "Walk Score",
					description: "Walkability of the neighborhood",
					score: 63,
					delta: 1,
					bullets: [
						"Proximity to amenities",
						"Sidewalk quality",
						"Pedestrian safety",
					],
					href: "https://www.google.com/maps",
					icon: "🚶",
				},
				{
					title: "Transit Score",
					description: "Quality of public transportation",
					score: 58,
					delta: -1,
					bullets: [
						"Transit routes",
						"Frequency of service",
						"Access to major hubs",
					],
					href: "https://www.google.com/maps",
					icon: "🚌",
				},
			],
		}),
		[],
	);
	// Sample data
	const allData: PropertySummary[] = useMemo(
		() => [
			toPropertySummary({
				id: "1",
				addressLine: "123 Main St",
				city: "Springfield",
				state: "IL",
				zip: "62701",
				price: 250000,
				beds: 3,
				baths: 2,
				sqft: 1500,
				badges: ["New", "Favorite"],
			}),
			toPropertySummary({
				id: "2",
				addressLine: "456 Oak Ave",
				city: "Dayton",
				state: "OH",
				zip: "45402",
				price: 310000,
				beds: 4,
				baths: 3,
				sqft: 2100,
				badges: ["Hot"],
			}),
			toPropertySummary({
				id: "3",
				addressLine: "789 Pine Rd",
				city: "Columbus",
				state: "OH",
				zip: "43004",
				price: 199000,
				beds: 2,
				baths: 1,
				sqft: 980,
			}),
		],
		[],
	);

	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const toggleSelect = (id: string) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			next.has(id) ? next.delete(id) : next.add(id);
			return next;
		});
	};

	function PropertyRow({ p }: { p: PropertySummary }) {
		const isSelected = selectedIds.has(p.id);
		return (
			<div className="flex items-start gap-4 border rounded-lg bg-background border-border p-3">
				<div className="w-48">
					<PropertyImage imageUrl={p.imageUrl} />
				</div>
				<div className="flex-1 space-y-1">
					<div className="flex items-start justify-between">
						<PropertyAddress property={p} />
						<PropertySelectionButton
							isSelected={isSelected}
							onToggle={() => toggleSelect(p.id)}
						/>
					</div>
					<PropertyPrice price={p.price} />
					<PropertyDetails property={p} />
					<PropertyBadges badges={p.badges} />
				</div>
			</div>
		);
	}

	// Visibility controls for tabs
	const ALL_TABS = [
		{ value: "overview", label: "Overview" },
		{ value: "property-details", label: "Property Details" },
		{ value: "mls-details", label: "MLS Details" },
		{ value: "tax-information", label: "Tax Information" },
		{ value: "linked-properties", label: "Linked Properties" },
		{ value: "foreclosures-liens", label: "Foreclosures & Liens" },
		{ value: "mortgage-transactions", label: "Mortgage & Transactions" },
	] as const;

	const STORAGE_KEY = "tabbed-list-visible-tabs";
	const STORAGE_ORDER_KEY = "tabbed-list-tab-order";
	const [visible, setVisible] = useState<Set<string>>(new Set());
	const [order, setOrder] = useState<string[]>([]);

	// Load persisted visibility on mount
	useEffect(() => {
		try {
			const raw =
				typeof window !== "undefined"
					? localStorage.getItem(STORAGE_KEY)
					: null;
			const rawOrder =
				typeof window !== "undefined"
					? localStorage.getItem(STORAGE_ORDER_KEY)
					: null;
			if (raw) {
				const arr = JSON.parse(raw) as string[];
				const valid = new Set(
					arr.filter((k) => ALL_TABS.some((t) => t.value === k)),
				);
				setVisible(
					valid.size
						? valid
						: new Set([
								"overview",
								"property-details",
								"mls-details",
								"tax-information",
							]),
				);
			} else {
				setVisible(
					new Set([
						"overview",
						"property-details",
						"mls-details",
						"tax-information",
					]),
				);
			}
			if (rawOrder) {
				const arr = JSON.parse(rawOrder) as string[];
				const valid = arr.filter((k) => ALL_TABS.some((t) => t.value === k));
				setOrder(valid.length ? valid : ALL_TABS.map((t) => t.value));
			} else {
				setOrder(ALL_TABS.map((t) => t.value));
			}
		} catch {
			setVisible(
				new Set([
					"overview",
					"property-details",
					"mls-details",
					"tax-information",
				]),
			);
			setOrder(ALL_TABS.map((t) => t.value));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Persist on change
	useEffect(() => {
		try {
			if (visible.size) {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(visible)));
			}
		} catch {
			/* ignore */
		}
	}, [visible]);

	useEffect(() => {
		try {
			if (order.length) {
				localStorage.setItem(STORAGE_ORDER_KEY, JSON.stringify(order));
			}
		} catch {
			/* ignore */
		}
	}, [order]);

	const toggleTabVisibility = (key: string) => {
		setVisible((prev) => {
			const next = new Set(prev);
			next.has(key) ? next.delete(key) : next.add(key);
			return next;
		});
	};

	// Build tab configs and filter by visibility
	const tabsData = useMemo(() => {
		const mapContent = (value: string) => {
			switch (value) {
				case "overview":
					return (
						<div className="space-y-3">
							{allData.map((p) => (
								<PropertyRow key={p.id} p={p} />
							))}
						</div>
					);
				case "property-details":
					return (
						<div className="space-y-3">
							{allData
								.filter((p) => (p.beds ?? 0) >= 3)
								.map((p) => (
									<PropertyRow key={p.id} p={p} />
								))}
						</div>
					);
				case "mls-details":
					return (
						<div className="space-y-3">
							{allData
								.filter((p) => (p.price ?? 0) >= 200000)
								.map((p) => (
									<PropertyRow key={p.id} p={p} />
								))}
						</div>
					);
				case "tax-information":
					return (
						<div className="space-y-3">
							{allData
								.filter((p) => (p.lotSqft ?? 0) > 0)
								.map((p) => (
									<PropertyRow key={p.id} p={p} />
								))}
						</div>
					);
				case "linked-properties":
					// Simple heuristic: linked by same city (excluding itself)
					return (
						<div className="space-y-3">
							{allData
								.flatMap((p) =>
									allData.filter((q) => q.city === p.city && q.id !== p.id),
								)
								.filter((_, idx, arr) => idx === arr.findIndex((x) => true))
								.slice(0, allData.length)
								.map((p, i) => (
									<div
										key={`${p.id}-linked-${i}`}
										className="border rounded-lg p-3"
									>
										<div className="mb-2 text-sm text-muted-foreground">
											Linked by city: {p.city}
										</div>
										<PropertyRow p={p} />
									</div>
								))}
							{allData.every(
								(p) =>
									allData.filter((q) => q.city === p.city && q.id !== p.id)
										.length === 0,
							) && (
								<div className="text-sm text-muted-foreground">
									No linked properties.
								</div>
							)}
						</div>
					);
				case "foreclosures-liens":
					// Mock records for demo purposes
					return (
						<div className="space-y-3">
							{[
								{
									id: "fx-1",
									type: "Lien",
									date: "2023-04-10",
									status: "Released",
								},
							].map((r) => (
								<div key={r.id} className="border rounded-lg p-3 text-sm">
									<div className="font-medium">{r.type}</div>
									<div className="text-muted-foreground">Date: {r.date}</div>
									<div className="text-muted-foreground">
										Status: {r.status}
									</div>
								</div>
							))}
						</div>
					);
				case "mortgage-transactions":
					return (
						<div className="space-y-3">
							{[
								{
									id: "mtg-1",
									lender: "Acme Bank",
									amount: 180000,
									date: "2022-08-15",
								},
							].map((m) => (
								<div key={m.id} className="border rounded-lg p-3 text-sm">
									<div className="font-medium">{m.lender}</div>
									<div className="text-muted-foreground">
										Amount: ${" " + m.amount.toLocaleString()}
									</div>
									<div className="text-muted-foreground">Date: {m.date}</div>
								</div>
							))}
						</div>
					);
				default:
					return null;
			}
		};

		const counts: Record<string, number> = {
			overview: allData.length,
			"property-details": allData.filter((p) => (p.beds ?? 0) >= 3).length,
			"mls-details": allData.filter((p) => (p.price ?? 0) >= 200000).length,
			"tax-information": allData.filter((p) => (p.lotSqft ?? 0) > 0).length,
			"linked-properties": allData.reduce(
				(acc, p) =>
					acc +
					allData.filter((q) => q.city === p.city && q.id !== p.id).length,
				0,
			),
			"foreclosures-liens": 1,
			"mortgage-transactions": 1,
		};

		// Use persisted order, then filter by visibility
		const orderedTabs = order
			.map((key) => ALL_TABS.find((t) => t.value === key)!)
			.filter(Boolean);

		return orderedTabs
			.filter((t) => visible.has(t.value))
			.map((t) => ({
				value: t.value,
				label: (
					<span className="inline-flex items-center gap-2">
						{t.label}
						<Badge variant="secondary">{counts[t.value] ?? 0}</Badge>
					</span>
				),
				content: mapContent(t.value),
			}));
	}, [visible, order, allData, selectedIds]);

	return (
		<div className="p-4">
			<div className="mb-3 flex items-center justify-between">
				<h1 className="font-semibold">Tabbed List Test (Primitives)</h1>
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Popover>
								<PopoverTrigger asChild>
									<button
										type="button"
										className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-accent"
									>
										<Settings2 className="h-4 w-4" />
									</button>
								</PopoverTrigger>
								<PopoverContent side="bottom" align="end" className="w-64 p-2">
									<div className="flex flex-col gap-1">
										{order.map((key, idx) => {
											const t = ALL_TABS.find((x) => x.value === key)!;
											const onDragStart = (
												e: React.DragEvent<HTMLDivElement>,
											) => {
												e.dataTransfer.setData("text/plain", String(idx));
												e.dataTransfer.effectAllowed = "move";
											};
											const onDragOver = (
												e: React.DragEvent<HTMLDivElement>,
											) => {
												e.preventDefault();
												e.dataTransfer.dropEffect = "move";
											};
											const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
												e.preventDefault();
												const fromIndex = Number(
													e.dataTransfer.getData("text/plain"),
												);
												if (Number.isNaN(fromIndex) || fromIndex === idx)
													return;
												setOrder((prev) => {
													const next = [...prev];
													const [moved] = next.splice(fromIndex, 1);
													next.splice(idx, 0, moved);
													return next;
												});
											};
											return (
												<div
													key={t.value}
													className="flex items-center justify-between gap-2 rounded-md px-2 py-1 hover:bg-accent"
													draggable
													onDragStart={onDragStart}
													onDragOver={onDragOver}
													onDrop={onDrop}
												>
													<div className="flex items-center gap-2">
														<GripVertical className="h-4 w-4 text-muted-foreground" />
														<span className="text-sm">{t.label}</span>
													</div>
													<label className="flex items-center gap-2">
														<input
															type="checkbox"
															checked={visible.has(t.value)}
															onChange={() => toggleTabVisibility(t.value)}
														/>
													</label>
												</div>
											);
										})}
									</div>
								</PopoverContent>
							</Popover>
						</TooltipTrigger>
						<TooltipContent>Show/hide tabs</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>

			<PropertyTabsList tabsData={tabsData} />

			{/* AI Summary storybook-style section */}
			<div className="mt-8 space-y-3">
				<h2 className="font-semibold">AI Summary Expandable — Story</h2>
				{/* Decorative gradient banner for visual context */}
				<div className="relative overflow-hidden rounded-lg border border-border">
					<div className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 h-12" />
					<div className="p-4">
						<p className="text-sm text-muted-foreground">
							Demo gradient banner above the component
						</p>
					</div>
				</div>

				{aiLoading ? (
					<ExpandableAISummarySkeleton />
				) : (
					<ExpandableAISummary
						section={aiSection}
						defaultExpanded
						gridColsClassName="grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
					/>
				)}
			</div>
		</div>
	);
}
