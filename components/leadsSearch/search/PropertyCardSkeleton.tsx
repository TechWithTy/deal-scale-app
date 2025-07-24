import { Skeleton } from "@/components/ui/skeleton";

// Skeleton Loader Component
const PropertyCardSkeleton = () => (
	<div className="rounded-lg border bg-card p-4 shadow-sm">
		<Skeleton className="h-48 w-full rounded-md" />
		<div className="mt-4 space-y-2">
			<Skeleton className="h-6 w-3/4" />
			<Skeleton className="h-4 w-1/2" />
			<div className="flex space-x-4 pt-2">
				<Skeleton className="h-4 w-1/4" />
				<Skeleton className="h-4 w-1/4" />
				<Skeleton className="h-4 w-1/4" />
			</div>
			<Skeleton className="h-4 w-full" />
			<Skeleton className="h-4 w-2/3" />
		</div>
	</div>
);

export default PropertyCardSkeleton;
