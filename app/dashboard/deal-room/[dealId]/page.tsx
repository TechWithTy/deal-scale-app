"use client";

import { Breadcrumbs } from "@/components/breadcrumbs";
import PageContainer from "@/components/layout/page-container";
import { AIQuickActionsPopover } from "@/components/deal-room/AIQuickActionsPopover";
import { ChecklistProgress } from "@/components/deal-room/ChecklistProgress";
import { DealTimeline } from "@/components/deal-room/DealTimeline";
import { DocumentFolderTree } from "@/components/deal-room/DocumentFolderTree";
import { StakeholderList } from "@/components/deal-room/StakeholderList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
	sampleDeals,
	sampleDocuments,
	sampleStakeholders,
	sampleChecklistTasks,
	sampleMilestones,
} from "@/constants/dealRoomData";
import type { DealStatus, DocumentCategory } from "@/types/_dashboard/dealRoom";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Share2,
	Upload,
	DollarSign,
	TrendingUp,
	Calendar,
	Home,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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

export default function DealRoomDetailPage() {
	const params = useParams();
	const dealId = params.dealId as string;

	// Find deal by ID (in real app, fetch from API)
	const deal = sampleDeals.find((d) => d.id === dealId) || sampleDeals[0];
	const documents = sampleDocuments.filter((d) => d.dealId === dealId);
	const stakeholders = sampleStakeholders.filter((s) => s.dealId === dealId);
	const tasks = sampleChecklistTasks.filter((t) => t.dealId === dealId);
	const milestones = sampleMilestones.filter((m) => m.dealId === dealId);

	const breadcrumbItems = [
		{ title: "Dashboard", link: "/dashboard" },
		{ title: "Deal Room", link: "/dashboard/deal-room" },
		{ title: deal.propertyAddress, link: `/dashboard/deal-room/${dealId}` },
	];

	const handleViewDocument = (doc: any) => {
		toast.info(`Viewing ${doc.name}`);
	};

	const handleDownloadDocument = (doc: any) => {
		toast.success(`Downloading ${doc.name}`);
	};

	const handleToggleTask = (taskId: string) => {
		toast.success("Task updated");
	};

	const [isUploading, setIsUploading] = useState(false);
	const [showCategorySelect, setShowCategorySelect] = useState(false);
	const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

	const handleUploadDocument = (category?: DocumentCategory) => {
		if (category) {
			// Category already specified (from folder upload button)
			openFilePicker(category);
		} else {
			// No category - show selector first
			setShowCategorySelect(true);
		}
	};

	const openFilePicker = (category: DocumentCategory) => {
		const input = document.createElement("input");
		input.type = "file";
		input.multiple = true;
		input.accept = ".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png";

		input.onchange = (e) => {
			const files = (e.target as HTMLInputElement).files;
			if (files && files.length > 0) {
				setIsUploading(true);
				// Simulate upload
				setTimeout(() => {
					setIsUploading(false);
					const categoryLabel = {
						"property-info": "Property Information",
						financials: "Financial Documents",
						"due-diligence": "Due Diligence",
						legal: "Legal Documents",
						financing: "Financing",
						closing: "Closing Documents",
						"post-closing": "Post-Closing",
					}[category];

					toast.success(`${files.length} file(s) uploaded successfully`, {
						description: `Added to ${categoryLabel}`,
					});
					setShowCategorySelect(false);
				}, 1500);
			}
		};

		input.click();
	};

	const handleShareDeal = () => {
		// Copy current URL to clipboard
		const url = window.location.href;
		navigator.clipboard
			.writeText(url)
			.then(() => {
				toast.success("Share link copied!", {
					description: "Deal room URL copied to clipboard",
				});
			})
			.catch(() => {
				toast.error("Failed to copy link");
			});
	};

	const CATEGORY_OPTIONS: {
		value: DocumentCategory;
		label: string;
		description: string;
	}[] = [
		{
			value: "property-info",
			label: "Property Information",
			description: "Listing, photos, comps",
		},
		{
			value: "financials",
			label: "Financial Documents",
			description: "P&L, rent rolls, tax records",
		},
		{
			value: "due-diligence",
			label: "Due Diligence",
			description: "Inspections, appraisals, surveys",
		},
		{
			value: "legal",
			label: "Legal Documents",
			description: "Contracts, title, disclosures",
		},
		{
			value: "financing",
			label: "Financing",
			description: "Loan docs, proof of funds",
		},
		{
			value: "closing",
			label: "Closing Documents",
			description: "Settlement, insurance, walkthrough",
		},
		{
			value: "post-closing",
			label: "Post-Closing",
			description: "Warranties, utilities, vendors",
		},
	];

	return (
		<PageContainer scrollable>
			<div className="mx-auto w-full max-w-7xl space-y-6">
				{/* Category Selection Dialog */}
				<Dialog open={showCategorySelect} onOpenChange={setShowCategorySelect}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Choose Document Category</DialogTitle>
							<DialogDescription>
								Select where to upload your documents
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-2 py-4">
							{CATEGORY_OPTIONS.map((option) => (
								<Button
									key={option.value}
									variant="outline"
									className="h-auto justify-start p-4 text-left"
									onClick={() => {
										openFilePicker(option.value);
									}}
								>
									<div>
										<p className="font-medium">{option.label}</p>
										<p className="text-muted-foreground text-xs">
											{option.description}
										</p>
									</div>
								</Button>
							))}
						</div>
					</DialogContent>
				</Dialog>

				{/* Breadcrumbs */}
				<Breadcrumbs items={breadcrumbItems} />

				{/* Deal Header */}
				<div className="space-y-4">
					{/* Property Image Banner */}
					<div className="relative h-64 w-full overflow-hidden rounded-lg bg-gradient-to-br from-muted to-muted/50 md:h-80">
						{deal.propertyPhoto ? (
							<Image
								src={deal.propertyPhoto}
								alt={deal.propertyAddress}
								fill
								className="object-cover"
							/>
						) : (
							<div className="flex h-full w-full items-center justify-center">
								<Home className="h-20 w-20 text-muted-foreground/30" />
							</div>
						)}
						<div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent" />
						<div className="absolute bottom-0 left-0 right-0 p-6">
							<div className="flex items-end justify-between gap-4">
								<div>
									<h1 className="mb-1 font-bold text-3xl text-white md:text-4xl">
										{deal.propertyAddress}
									</h1>
									<p className="text-lg text-white/90">
										{deal.propertyCity}, {deal.propertyState} {deal.propertyZip}
									</p>
								</div>
								<Badge className={`${STATUS_COLORS[deal.status]} text-sm`}>
									{STATUS_LABELS[deal.status]}
								</Badge>
							</div>
						</div>
					</div>

					{/* Metrics Grid - Full Width */}
					<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
						<Card>
							<CardContent className="p-4">
								<p className="mb-1 text-muted-foreground text-xs">
									Purchase Price
								</p>
								<p className="font-bold text-2xl">
									${deal.purchasePrice.toLocaleString()}
								</p>
							</CardContent>
						</Card>
						{deal.estimatedARV && (
							<Card>
								<CardContent className="p-4">
									<p className="mb-1 text-muted-foreground text-xs">Est. ARV</p>
									<p className="font-bold text-2xl">
										${deal.estimatedARV.toLocaleString()}
									</p>
								</CardContent>
							</Card>
						)}
						{deal.projectedROI && (
							<Card>
								<CardContent className="p-4">
									<p className="mb-1 text-muted-foreground text-xs">
										Projected ROI
									</p>
									<p className="font-bold text-green-600 text-2xl dark:text-green-400">
										{deal.projectedROI}%
									</p>
								</CardContent>
							</Card>
						)}
						{deal.daysUntilClosing !== undefined && (
							<Card>
								<CardContent className="p-4">
									<p className="mb-1 text-muted-foreground text-xs">
										Days to Close
									</p>
									<p className="font-bold text-2xl">{deal.daysUntilClosing}</p>
								</CardContent>
							</Card>
						)}
					</div>

					{/* Progress & Actions Card */}
					<Card>
						<CardContent className="p-6">
							<div className="mb-4 space-y-2">
								<div className="flex items-center justify-between text-sm">
									<span className="font-medium">Overall Progress</span>
									<span className="font-semibold">
										{deal.completionPercentage}%
									</span>
								</div>
								<Progress value={deal.completionPercentage} className="h-3" />
							</div>

							{/* Quick Actions */}
							<div className="flex flex-wrap gap-2">
								<AIQuickActionsPopover
									dealId={dealId}
									propertyAddress={deal.propertyAddress}
									userTier="basic"
								/>
								<Button
									size="sm"
									onClick={() => handleUploadDocument()}
									disabled={isUploading}
								>
									<Upload className="mr-2 h-4 w-4" />
									{isUploading ? "Uploading..." : "Upload Document"}
								</Button>
								<Button size="sm" variant="outline" onClick={handleShareDeal}>
									<Share2 className="mr-2 h-4 w-4" />
									Share Deal Room
								</Button>
								<Link href="/dashboard/calculators">
									<Button size="sm" variant="outline">
										<TrendingUp className="mr-2 h-4 w-4" />
										Run Analysis
									</Button>
								</Link>
							</div>
						</CardContent>
					</Card>
				</div>

				<Separator />

				{/* Main Content Grid */}
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
					{/* Left Column: Documents & Checklist */}
					<div className="space-y-6 lg:col-span-2">
						<DocumentFolderTree
							documents={documents}
							onUpload={handleUploadDocument}
							onViewDocument={handleViewDocument}
							onDownloadDocument={handleDownloadDocument}
						/>

						<ChecklistProgress
							tasks={tasks}
							onToggleTask={handleToggleTask}
							onAddTask={() => toast.info("Add task dialog")}
						/>
					</div>

					{/* Right Column: Timeline & Stakeholders */}
					<div className="space-y-6">
						<DealTimeline
							milestones={milestones}
							closingDate={deal.closingDate}
						/>

						<StakeholderList
							stakeholders={stakeholders}
							onAddStakeholder={() => toast.info("Add stakeholder dialog")}
							onEditPermissions={(id) =>
								toast.info(`Edit permissions for ${id}`)
							}
						/>
					</div>
				</div>
			</div>
		</PageContainer>
	);
}
