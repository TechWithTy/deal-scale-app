"use client";
import type { Property } from "@/types/_dashboard/property";
import { DrawerFlow } from "external/drawer-flow";
import type {
	DrawerFlowProps,
	DrawerItem,
	ListService,
	LoadMoreArgs,
	LoadMoreResult,
} from "external/drawer-flow";
import { useEffect, useMemo, useRef } from "react";
import PropertyCard from "./propertyCard";

export interface PropertyDrawerFlowProps {
	isOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	properties?: Property[]; // optional initial page
	loadMore: (args: LoadMoreArgs) => Promise<{
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
	const addr = p.address;
	const details = p.details;
	const itemId = p.id;
	return {
		id: itemId,
		display: {
			title: `${addr.street}`.trim(),
			subtitle: [addr.city, addr.state, addr.zipCode]
				.filter(Boolean)
				.join(", "),
			mediaUrl: undefined, // Optionally supply primary image
		},
		details: {
			beds: details.beds,
			baths: details.fullBaths,
			sqft: details.sqft ?? undefined,
		},
	};
}

export const PropertyDrawerFlow = ({
	isOpen,
	onOpenChange,
	properties,
	loadMore,
	listService,
	defaultPageSize = 12,
	pageSizeOptions = [12, 24, 48, 96],
	listSizeCalc,
	onSelectionChange,
}: PropertyDrawerFlowProps) => {
	// Keep a map from DrawerItem.id -> Property for renderItem to resolve PropertyCard props
	const propertyById = useRef<Map<string, Property>>(new Map());

	// Seed the map from initial properties
	useEffect(() => {
		if (properties?.length) {
			const m = new Map(propertyById.current);
			for (const p of properties) {
				const id = p.id;
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
										className={`rounded-full border-2 px-2 py-1 text-sm ${selected ? "border-orange-500 bg-orange-500 text-white" : "border-border hover:border-orange-500"}`}
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
					<button type="button" onClick={toggle} className="contents">
						<PropertyCard property={p} selected={selected} onSelect={toggle} />
					</button>
				);
			}}
		/>
	);
};
