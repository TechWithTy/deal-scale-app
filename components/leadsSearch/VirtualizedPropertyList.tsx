/**
 * VirtualizedPropertyList
 *
 * High-performance virtualized list for rendering large numbers of properties.
 * Only renders visible items in the viewport, dramatically improving performance
 * for lists with 100+ properties.
 *
 * Features:
 * - Handles 1000+ properties smoothly
 * - Constant memory usage regardless of list size
 * - 60fps scrolling performance
 * - Responsive grid layout support
 *
 * @see https://github.com/bvaughn/react-window
 */

"use client";

import type { Property } from "@/types/_dashboard/property";
import type React from "react";
import { memo, useCallback, useMemo, useRef } from "react";
import { FixedSizeList as List } from "react-window";
import PropertyCard from "./propertyCard";

interface VirtualizedPropertyListProps {
	properties: Property[];
	selectedPropertyIds: string[];
	onPropertySelect: (propertyId: string) => void;
	itemsPerRow?: number; // Number of cards per row (default: 3)
	itemHeight?: number; // Height of each row in pixels (default: 400)
}

/**
 * Memoized property card row component for optimal performance
 */
const PropertyRow = memo(
	({
		properties,
		selectedPropertyIds,
		onPropertySelect,
		itemsPerRow,
		index,
	}: {
		properties: Property[];
		selectedPropertyIds: string[];
		onPropertySelect: (propertyId: string) => void;
		itemsPerRow: number;
		index: number;
	}) => {
		const startIndex = index * itemsPerRow;
		const rowProperties = properties.slice(
			startIndex,
			startIndex + itemsPerRow,
		);

		return (
			<div className="grid grid-cols-1 gap-8 px-4 md:grid-cols-3">
				{rowProperties.map((property) => {
					if (!property.id) return null;

					return (
						<div key={property.id} className="p-4">
							<PropertyCard
								property={property}
								selected={selectedPropertyIds.includes(property.id)}
								onSelect={() => property.id && onPropertySelect(property.id)}
							/>
						</div>
					);
				})}
			</div>
		);
	},
);

PropertyRow.displayName = "PropertyRow";

/**
 * VirtualizedPropertyList Component
 *
 * Efficiently renders large property lists using windowing technique.
 * Only renders items visible in the viewport + small buffer.
 *
 * @example
 * ```tsx
 * <VirtualizedPropertyList
 *   properties={filteredProperties}
 *   selectedPropertyIds={selectedIds}
 *   onPropertySelect={handleSelect}
 *   itemsPerRow={3}
 *   itemHeight={400}
 * />
 * ```
 */
const VirtualizedPropertyList: React.FC<VirtualizedPropertyListProps> = ({
	properties,
	selectedPropertyIds,
	onPropertySelect,
	itemsPerRow = 3,
	itemHeight = 400,
}) => {
	const listRef = useRef<List>(null);

	// Calculate number of rows needed
	const rowCount = Math.ceil(properties.length / itemsPerRow);

	// Memoize the row renderer to prevent unnecessary re-renders
	const Row = useCallback(
		({ index, style }: { index: number; style: React.CSSProperties }) => (
			<div style={style}>
				<PropertyRow
					properties={properties}
					selectedPropertyIds={selectedPropertyIds}
					onPropertySelect={onPropertySelect}
					itemsPerRow={itemsPerRow}
					index={index}
				/>
			</div>
		),
		[properties, selectedPropertyIds, onPropertySelect, itemsPerRow],
	);

	// Calculate list height (max 80vh or window height)
	const listHeight = useMemo(() => {
		const maxHeight =
			typeof window !== "undefined" ? window.innerHeight * 0.8 : 600;
		return Math.min(rowCount * itemHeight, maxHeight);
	}, [rowCount, itemHeight]);

	// Calculate list width
	const listWidth = useMemo(() => {
		if (typeof window === "undefined") return "100%";
		return "100%";
	}, []);

	if (properties.length === 0) {
		return (
			<div className="flex h-64 items-center justify-center text-muted-foreground">
				<p>No properties found matching your search criteria.</p>
			</div>
		);
	}

	return (
		<div className="w-full">
			<List
				ref={listRef}
				height={listHeight}
				itemCount={rowCount}
				itemSize={itemHeight}
				width={listWidth}
				overscanCount={2} // Pre-render 2 rows above and below viewport
				className="scrollbar-thin scrollbar-thumb-muted-foreground scrollbar-track-muted"
			>
				{Row}
			</List>
		</div>
	);
};

VirtualizedPropertyList.displayName = "VirtualizedPropertyList";

export default memo(VirtualizedPropertyList);
