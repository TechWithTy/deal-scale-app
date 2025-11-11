/**
 * LoadingSkeleton Components
 *
 * Provides better perceived performance by showing skeleton placeholders
 * while content is loading.
 *
 * Benefits:
 * - Reduces perceived loading time
 * - Shows layout structure immediately
 * - Prevents layout shift
 * - Better UX than spinners alone
 */

"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
	className?: string;
}

/**
 * Base Skeleton component
 */
export function Skeleton({ className }: SkeletonProps) {
	return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}

/**
 * Property Card Skeleton
 */
export function PropertyCardSkeleton() {
	return (
		<div className="space-y-3 rounded-lg border border-border p-4">
			<Skeleton className="h-48 w-full" /> {/* Image */}
			<Skeleton className="h-4 w-3/4" /> {/* Address */}
			<Skeleton className="h-4 w-1/2" /> {/* Price */}
			<div className="flex gap-2">
				<Skeleton className="h-4 w-16" /> {/* Beds */}
				<Skeleton className="h-4 w-16" /> {/* Baths */}
				<Skeleton className="h-4 w-16" /> {/* Sqft */}
			</div>
		</div>
	);
}

/**
 * Table Row Skeleton
 */
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
	return (
		<div className="flex gap-4 border-b border-border p-4">
			{Array.from({ length: columns }).map((_, i) => (
				<Skeleton key={i} className="h-4 flex-1" />
			))}
		</div>
	);
}

/**
 * Table Skeleton
 */
export function TableSkeleton({
	rows = 10,
	columns = 5,
}: { rows?: number; columns?: number }) {
	return (
		<div className="space-y-2 rounded-lg border border-border">
			{/* Header */}
			<div className="flex gap-4 border-b-2 border-border bg-muted/50 p-4">
				{Array.from({ length: columns }).map((_, i) => (
					<Skeleton key={i} className="h-4 flex-1" />
				))}
			</div>
			{/* Rows */}
			{Array.from({ length: rows }).map((_, i) => (
				<TableRowSkeleton key={i} columns={columns} />
			))}
		</div>
	);
}

/**
 * Map Skeleton
 */
export function MapSkeleton() {
	return (
		<div className="relative h-[600px] w-full overflow-hidden rounded-lg border border-border">
			<Skeleton className="h-full w-full" />
			<div className="absolute inset-0 flex items-center justify-center">
				<div className="flex items-center gap-2 text-muted-foreground">
					<div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
					<span className="text-sm">Loading map...</span>
				</div>
			</div>
		</div>
	);
}

/**
 * Dashboard Card Skeleton
 */
export function DashboardCardSkeleton() {
	return (
		<div className="space-y-3 rounded-lg border border-border p-6">
			<Skeleton className="h-4 w-24" /> {/* Label */}
			<Skeleton className="h-8 w-32" /> {/* Value */}
			<Skeleton className="h-3 w-full" /> {/* Chart/graph */}
		</div>
	);
}

/**
 * Chart Skeleton
 */
export function ChartSkeleton() {
	return (
		<div className="space-y-4 rounded-lg border border-border p-6">
			<div className="flex items-center justify-between">
				<Skeleton className="h-6 w-32" /> {/* Title */}
				<Skeleton className="h-4 w-20" /> {/* Legend */}
			</div>
			<div className="flex h-[300px] items-end gap-2">
				{Array.from({ length: 12 }).map((_, i) => (
					<Skeleton
						key={i}
						className="flex-1"
						style={{ height: `${Math.random() * 100}%` }}
					/>
				))}
			</div>
		</div>
	);
}

/**
 * Form Skeleton
 */
export function FormSkeleton({ fields = 5 }: { fields?: number }) {
	return (
		<div className="space-y-6 rounded-lg border border-border p-6">
			{Array.from({ length: fields }).map((_, i) => (
				<div key={i} className="space-y-2">
					<Skeleton className="h-4 w-24" /> {/* Label */}
					<Skeleton className="h-10 w-full" /> {/* Input */}
				</div>
			))}
			<Skeleton className="h-10 w-32" /> {/* Submit button */}
		</div>
	);
}

/**
 * Page Skeleton - Full page loading state
 */
export function PageSkeleton() {
	return (
		<div className="space-y-6 p-8">
			<div className="space-y-2">
				<Skeleton className="h-8 w-64" /> {/* Page title */}
				<Skeleton className="h-4 w-96" /> {/* Description */}
			</div>

			{/* Stats cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<DashboardCardSkeleton key={i} />
				))}
			</div>

			{/* Main content */}
			<div className="grid gap-6 md:grid-cols-2">
				<ChartSkeleton />
				<ChartSkeleton />
			</div>
		</div>
	);
}
