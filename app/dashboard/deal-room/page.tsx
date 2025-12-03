"use client";

import { Breadcrumbs } from "@/components/breadcrumbs";
import PageContainer from "@/components/layout/page-container";
import { CreateDealModal } from "@/components/deal-room/CreateDealModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { sampleDeals } from "@/constants/dealRoomData";
import { useDealRoomStore } from "@/lib/stores/dealRoom";
import type { Deal, DealStatus } from "@/types/_dashboard/dealRoom";
import {
	Briefcase,
	Plus,
	Search,
	TrendingUp,
	Clock,
	CheckCircle2,
	DollarSign,
	Home,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const breadcrumbItems = [
	{ title: "Dashboard", link: "/dashboard" },
	{ title: "Deal Room", link: "/dashboard/deal-room" },
];

const STATUS_COLORS: Record<DealStatus, string> = {
	"pre-offer": "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
	"offer-submitted":
		"bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
	"under-contract":
		"bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
	"due-diligence":
		"bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
	financing:
		"bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
	closing: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
	closed:
		"bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
	cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const STATUS_LABELS: Record<DealStatus, string> = {
	"pre-offer": "Pre-Offer",
	"offer-submitted": "Offer Submitted",
	"under-contract": "Under Contract",
	"due-diligence": "Due Diligence",
	financing: "Financing",
	closing: "Closing",
	closed: "Closed",
	cancelled: "Cancelled",
};

export default function DealRoomPage() {
	const storeDeals = useDealRoomStore((state) => state.deals);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<DealStatus | "all">("all");
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

	// Combine sample deals with store deals for demo
	const allDeals = useMemo(() => [...sampleDeals, ...storeDeals], [storeDeals]);

	// Calculate stats
	const stats = useMemo(() => {
		const activeDeals = allDeals.filter(
			(d) => d.status !== "closed" && d.status !== "cancelled",
		);
		const closedDeals = allDeals.filter((d) => d.status === "closed");
		const totalValue = activeDeals.reduce(
			(sum, deal) => sum + deal.purchasePrice,
			0,
		);
		const avgCompletion =
			activeDeals.length > 0
				? activeDeals.reduce(
						(sum, deal) => sum + deal.completionPercentage,
						0,
					) / activeDeals.length
				: 0;

		return {
			totalActive: activeDeals.length,
			totalClosed: closedDeals.length,
			totalValue,
			avgCompletion: Math.round(avgCompletion),
		};
	}, [allDeals]);

	// Filter deals
	const filteredDeals = useMemo(() => {
		let filtered = allDeals;

		if (statusFilter !== "all") {
			filtered = filtered.filter((deal) => deal.status === statusFilter);
		}

		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(deal) =>
					deal.propertyAddress.toLowerCase().includes(query) ||
					deal.propertyCity.toLowerCase().includes(query) ||
					deal.propertyState.toLowerCase().includes(query),
			);
		}

		return filtered;
	}, [allDeals, searchQuery, statusFilter]);

	return (
		<PageContainer>
			<CreateDealModal
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
			/>
			<div className="space-y-6">
				{/* Breadcrumbs */}
				<Breadcrumbs items={breadcrumbItems} />

				{/* Page Header */}
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="space-y-1">
						<h1 className="font-bold text-3xl tracking-tight">Deal Room</h1>
						<p className="text-muted-foreground">
							Manage all your property deals from offer to closing
						</p>
					</div>
					<Button
						size="lg"
						className="gap-2"
						onClick={() => setIsCreateModalOpen(true)}
					>
						<Plus className="h-5 w-5" />
						New Deal
					</Button>
				</div>

				{/* Quick Stats */}
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="font-medium text-sm">
								Active Deals
							</CardTitle>
							<Briefcase className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="font-bold text-2xl">{stats.totalActive}</div>
							<p className="text-muted-foreground text-xs">
								{stats.totalClosed} closed this year
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="font-medium text-sm">Total Value</CardTitle>
							<DollarSign className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="font-bold text-2xl">
								${(stats.totalValue / 1000000).toFixed(2)}M
							</div>
							<p className="text-muted-foreground text-xs">In active deals</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="font-medium text-sm">
								Avg Completion
							</CardTitle>
							<CheckCircle2 className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="font-bold text-2xl">{stats.avgCompletion}%</div>
							<p className="text-muted-foreground text-xs">
								Across all active deals
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="font-medium text-sm">
								Avg Days to Close
							</CardTitle>
							<Clock className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="font-bold text-2xl">38</div>
							<p className="text-muted-foreground text-xs">
								Based on deal type
							</p>
						</CardContent>
					</Card>
				</div>

				<Separator />

				{/* Search and Filter */}
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="relative flex-1 max-w-md">
						<Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search by address, city, or state..."
							className="w-full rounded-lg border border-border bg-background py-2 pr-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
						/>
					</div>

					<div className="flex gap-2 overflow-x-auto">
						<Button
							variant={statusFilter === "all" ? "default" : "outline"}
							size="sm"
							onClick={() => setStatusFilter("all")}
						>
							All
						</Button>
						<Button
							variant={
								statusFilter === "under-contract" ? "default" : "outline"
							}
							size="sm"
							onClick={() => setStatusFilter("under-contract")}
						>
							Under Contract
						</Button>
						<Button
							variant={statusFilter === "due-diligence" ? "default" : "outline"}
							size="sm"
							onClick={() => setStatusFilter("due-diligence")}
						>
							Due Diligence
						</Button>
						<Button
							variant={statusFilter === "closing" ? "default" : "outline"}
							size="sm"
							onClick={() => setStatusFilter("closing")}
						>
							Closing
						</Button>
					</div>
				</div>

				{/* Deals Grid */}
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{filteredDeals.map((deal) => (
						<Link key={deal.id} href={`/dashboard/deal-room/${deal.id}`}>
							<Card className="group h-full transition-all hover:shadow-lg">
								<CardHeader className="p-4">
									<div className="mb-2 flex items-start justify-between">
										<Badge className={STATUS_COLORS[deal.status]}>
											{STATUS_LABELS[deal.status]}
										</Badge>
										{deal.daysUntilClosing !== undefined && (
											<span className="text-muted-foreground text-xs">
												{deal.daysUntilClosing}d to close
											</span>
										)}
									</div>
									<CardTitle className="line-clamp-1 text-lg">
										{deal.propertyAddress}
									</CardTitle>
									<CardDescription className="text-sm">
										{deal.propertyCity}, {deal.propertyState} {deal.propertyZip}
									</CardDescription>
								</CardHeader>
								<CardContent className="p-4 pt-0">
									<div className="mb-3 space-y-2">
										<div className="flex items-center justify-between text-sm">
											<span className="text-muted-foreground">
												Purchase Price
											</span>
											<span className="font-semibold">
												${deal.purchasePrice.toLocaleString()}
											</span>
										</div>
										{deal.estimatedARV && (
											<div className="flex items-center justify-between text-sm">
												<span className="text-muted-foreground">Est. ARV</span>
												<span className="font-semibold">
													${deal.estimatedARV.toLocaleString()}
												</span>
											</div>
										)}
										{deal.projectedROI && (
											<div className="flex items-center justify-between text-sm">
												<span className="text-muted-foreground">
													Projected ROI
												</span>
												<span className="font-semibold text-green-600 dark:text-green-400">
													{deal.projectedROI}%
												</span>
											</div>
										)}
									</div>

									<div className="space-y-1">
										<div className="flex items-center justify-between text-xs">
											<span className="text-muted-foreground">Progress</span>
											<span className="font-medium">
												{deal.completionPercentage}%
											</span>
										</div>
										<Progress
											value={deal.completionPercentage}
											className="h-2"
										/>
									</div>
								</CardContent>
							</Card>
						</Link>
					))}
				</div>

				{/* Empty State */}
				{filteredDeals.length === 0 && (
					<Card className="border-dashed">
						<CardContent className="flex flex-col items-center justify-center py-12 text-center">
							<div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
								<Briefcase className="h-10 w-10 text-primary" />
							</div>
							<h3 className="mb-2 font-semibold text-lg">No deals found</h3>
							<p className="mb-6 max-w-sm text-muted-foreground text-sm">
								{searchQuery || statusFilter !== "all"
									? "Try adjusting your search or filters"
									: "Get started by creating your first deal"}
							</p>
							<Button
								className="gap-2"
								onClick={() => setIsCreateModalOpen(true)}
							>
								<Plus className="h-4 w-4" />
								Create Your First Deal
							</Button>
						</CardContent>
					</Card>
				)}
			</div>
		</PageContainer>
	);
}
