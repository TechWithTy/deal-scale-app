"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
	DealDocument,
	DocumentCategory,
} from "@/types/_dashboard/dealRoom";
import {
	ChevronDown,
	ChevronRight,
	FileText,
	Download,
	Eye,
	Upload,
} from "lucide-react";
import { useState } from "react";

const CATEGORY_LABELS: Record<DocumentCategory, string> = {
	"property-info": "Property Information",
	financials: "Financial Documents",
	"due-diligence": "Due Diligence",
	legal: "Legal Documents",
	financing: "Financing",
	closing: "Closing Documents",
	"post-closing": "Post-Closing",
};

interface DocumentFolderTreeProps {
	documents: DealDocument[];
	onUpload?: (category: DocumentCategory) => void;
	onViewDocument?: (document: DealDocument) => void;
	onDownloadDocument?: (document: DealDocument) => void;
}

export function DocumentFolderTree({
	documents,
	onUpload,
	onViewDocument,
	onDownloadDocument,
}: DocumentFolderTreeProps) {
	const [expandedFolders, setExpandedFolders] = useState<Set<DocumentCategory>>(
		new Set(["property-info"]),
	);

	const toggleFolder = (category: DocumentCategory) => {
		const newExpanded = new Set(expandedFolders);
		if (newExpanded.has(category)) {
			newExpanded.delete(category);
		} else {
			newExpanded.add(category);
		}
		setExpandedFolders(newExpanded);
	};

	// Group documents by category
	const documentsByCategory = documents.reduce(
		(acc, doc) => {
			if (!acc[doc.category]) {
				acc[doc.category] = [];
			}
			acc[doc.category].push(doc);
			return acc;
		},
		{} as Record<DocumentCategory, DealDocument[]>,
	);

	const categories: DocumentCategory[] = [
		"property-info",
		"financials",
		"due-diligence",
		"legal",
		"financing",
		"closing",
		"post-closing",
	];

	const formatFileSize = (bytes: number) => {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	};

	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-lg">
					<FileText className="h-5 w-5" />
					Documents
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-1 p-4 pt-0">
				{categories.map((category) => {
					const docs = documentsByCategory[category] || [];
					const isExpanded = expandedFolders.has(category);

					return (
						<div key={category} className="space-y-1">
							{/* Folder Header */}
							<div className="flex w-full items-center gap-1 rounded-lg transition-colors hover:bg-muted">
								<button
									type="button"
									onClick={() => toggleFolder(category)}
									className="flex flex-1 items-center gap-2 p-2"
								>
									{isExpanded ? (
										<ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
									) : (
										<ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
									)}
									<span className="font-medium text-sm">
										{CATEGORY_LABELS[category]}
									</span>
									<Badge variant="outline" className="text-xs">
										{docs.length}
									</Badge>
								</button>
								<Button
									size="icon"
									variant="ghost"
									className="h-8 w-8 flex-shrink-0"
									onClick={(e) => {
										e.stopPropagation();
										onUpload?.(category);
									}}
								>
									<Upload className="h-3.5 w-3.5" />
								</Button>
							</div>

							{/* Folder Contents */}
							{isExpanded && (
								<div className="ml-6 space-y-1">
									{docs.length === 0 ? (
										<p className="py-2 text-muted-foreground text-xs">
											No documents yet
										</p>
									) : (
										docs.map((doc) => (
											<div
												key={doc.id}
												className="group/doc flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted/50"
											>
												<div className="min-w-0 flex-1">
													<p className="truncate text-sm">{doc.name}</p>
													<p className="text-muted-foreground text-xs">
														{formatFileSize(doc.fileSize)} • {doc.viewCount}{" "}
														views
													</p>
												</div>
												<div className="flex items-center gap-1 opacity-0 transition-opacity group-hover/doc:opacity-100">
													<Button
														size="icon"
														variant="ghost"
														className="h-7 w-7"
														onClick={() => onViewDocument?.(doc)}
													>
														<Eye className="h-3.5 w-3.5" />
													</Button>
													<Button
														size="icon"
														variant="ghost"
														className="h-7 w-7"
														onClick={() => onDownloadDocument?.(doc)}
													>
														<Download className="h-3.5 w-3.5" />
													</Button>
												</div>
											</div>
										))
									)}
								</div>
							)}
						</div>
					);
				})}
			</CardContent>
		</Card>
	);
}
