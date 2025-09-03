"use client";
import React, { useEffect, useMemo, useRef } from "react";
import { DrawerFlow } from "@/external/drawer-flow";
import type {
	DrawerItem,
	ListService,
	LoadMoreArgs,
	LoadMoreResult,
	DrawerFlowProps,
} from "@/external/drawer-flow";
import type { Property } from "@/types/_dashboard/property";
import PropertyCard from "./propertyCard";

export interface PropertyDrawerFlowProps {
	isOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	properties?: Property[]; // optional initial page
	loadMore: (
		args: LoadMoreArgs,
	) => Promise<{
		properties: Property[];
		hasMore: boolean;
		cursor?: string | null;
	}>; // app-provided
	listService: ListService; // app-provided
	defaultPageSize?: number;
	pageSizeOptions?: number[];
	listSizeCalc?: DrawerFlowProps["listSizeCalc"];
	onSelectionChange?: DrawerFlowProps["onSelectionChange"];
}

function mapPropertyToDrawerItem(p: Property): DrawerItem {
	// Basic mapping; extend as needed
	const addr = (p as any).address ?? {};
	const details = (p as any).details ?? {};
	const itemId = (p as any).id ?? `${addr.street ?? "id-missing"}`;
	return {
		id: itemId,
		display: {
			title: `${addr.street ?? ""}`.trim(),
			subtitle: [addr.city, addr.state, addr.zipCode]
				.filter(Boolean)
				.join(", "),
			mediaUrl: undefined, // Optionally supply primary image
		},
		details: {
			beds: details.beds,
			baths: details.fullBaths ?? details.baths,
			sqft: details.sqft,
		},
	};
}

export const PropertyDrawerFlow: React.FC<PropertyDrawerFlowProps> = ({
	isOpen,
	onOpenChange,
	properties,
	loadMore,
	listService,
	defaultPageSize = 12,
	pageSizeOptions = [12, 24, 48, 96],
	listSizeCalc,
	onSelectionChange,
}) => {
	// Keep a map from DrawerItem.id -> Property for renderItem to resolve PropertyCard props
	const propertyById = useRef<Map<string, Property>>(new Map());

	// Seed the map from initial properties
	useEffect(() => {
		if (properties?.length) {
			const m = new Map(propertyById.current);
			for (const p of properties) {
				const id = (p as any).id;
				if (id) m.set(id, p);
			}
			propertyById.current = m;
		}
	}, [properties]);

	const initialItems: DrawerItem[] | undefined = useMemo(() => {
		if (!properties?.length) return undefined;
		return properties.map((p) => {
			const item = mapPropertyToDrawerItem(p);
			// ensure map
			propertyById.current.set(item.id, p);
			return item;
		});
	}, [properties]);

	const bridgedLoadMore = async (
		args: LoadMoreArgs,
	): Promise<LoadMoreResult> => {
		const res = await loadMore(args);
		// map and cache
		const items = res.properties.map((p) => {
			const item = mapPropertyToDrawerItem(p);
			propertyById.current.set(item.id, p);
			return item;
		});
		return { items, hasMore: res.hasMore, cursor: res.cursor ?? null };
	};

	return (
		<DrawerFlow
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			listService={listService}
			loadMore={bridgedLoadMore}
			items={initialItems}
			defaultPageSize={defaultPageSize}
			pageSizeOptions={pageSizeOptions}
			listSizeCalc={listSizeCalc}
			onSelectionChange={onSelectionChange}
			renderItem={(item: DrawerItem, selected: boolean, toggle: () => void) => {
				const p = propertyById.current.get(item.id);
				if (!p) {
					// Fallback minimal card if property not cached yet
					return (
						<div
							className={`group relative mx-auto max-w-lg overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all ${selected ? "ring-2 ring-orange-500 ring-offset-2" : ""}`}
						>
							<div className="p-4">
								<div className="mb-2 flex items-center justify-between">
									<h3 className="font-semibold text-base">
										{item.display.title}
									</h3>
									<button
										type="button"
										className={`rounded-full border-2 px-2 py-1 text-sm ${selected ? "bg-orange-500 text-white border-orange-500" : "border-border hover:border-orange-500"}`}
										onClick={toggle}
									>
										{selected ? "Selected" : "Select"}
									</button>
								</div>
								{item.display.subtitle && (
									<p className="text-muted-foreground text-sm">
										{item.display.subtitle}
									</p>
								)}
							</div>
						</div>
					);
				}
				return (
					<div
						onClick={toggle}
						role="button"
						tabIndex={0}
						onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggle()}
					>
						<PropertyCard property={p} selected={selected} onSelect={toggle} />
					</div>
				);
			}}
		/>
	);
};
