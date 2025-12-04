"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
	DealStakeholder,
	PermissionLevel,
	StakeholderRole,
} from "@/types/_dashboard/dealRoom";
import { Mail, Phone, Plus, Shield, User, Users } from "lucide-react";

const ROLE_LABELS: Record<StakeholderRole, string> = {
	buyer: "Buyer",
	seller: "Seller",
	agent: "Real Estate Agent",
	lender: "Lender",
	inspector: "Inspector",
	attorney: "Attorney",
	"title-company": "Title Company",
	contractor: "Contractor",
	"property-manager": "Property Manager",
	partner: "Investment Partner",
};

const PERMISSION_LABELS: Record<PermissionLevel, string> = {
	owner: "Owner",
	editor: "Can Edit",
	viewer: "View Only",
};

const PERMISSION_COLORS: Record<PermissionLevel, string> = {
	owner:
		"bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
	editor: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
	viewer: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

interface StakeholderListProps {
	stakeholders: DealStakeholder[];
	onAddStakeholder?: () => void;
	onEditPermissions?: (stakeholderId: string) => void;
}

export function StakeholderList({
	stakeholders,
	onAddStakeholder,
	onEditPermissions,
}: StakeholderListProps) {
	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase();
	};

	const getTimeAgo = (dateString: string | undefined) => {
		if (!dateString) return "Never";
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMins / 60);
		const diffDays = Math.floor(diffHours / 24);

		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays === 1) return "Yesterday";
		if (diffDays < 7) return `${diffDays}d ago`;
		return date.toLocaleDateString();
	};

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2 text-lg">
						<Users className="h-5 w-5" />
						Stakeholders
						<Badge variant="outline">{stakeholders.length}</Badge>
					</CardTitle>
					{onAddStakeholder && (
						<Button size="sm" variant="outline" onClick={onAddStakeholder}>
							<Plus className="mr-1.5 h-4 w-4" />
							Add
						</Button>
					)}
				</div>
			</CardHeader>
			<CardContent className="space-y-2 p-4 pt-0">
				{stakeholders.length === 0 ? (
					<p className="py-4 text-center text-muted-foreground text-sm">
						No stakeholders added yet
					</p>
				) : (
					stakeholders.map((stakeholder) => (
						<div
							key={stakeholder.id}
							className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
						>
							{/* Avatar */}
							<Avatar className="h-10 w-10">
								<AvatarImage src={stakeholder.avatar} alt={stakeholder.name} />
								<AvatarFallback className="bg-primary/10 font-semibold text-primary text-sm">
									{getInitials(stakeholder.name)}
								</AvatarFallback>
							</Avatar>

							{/* Info */}
							<div className="flex-1 min-w-0 space-y-1">
								<div className="flex items-start justify-between gap-2">
									<div className="min-w-0">
										<p className="truncate font-medium text-sm">
											{stakeholder.name}
										</p>
										<p className="text-muted-foreground text-xs">
											{ROLE_LABELS[stakeholder.role]}
											{stakeholder.company && ` • ${stakeholder.company}`}
										</p>
									</div>
									<Badge
										variant="outline"
										className={PERMISSION_COLORS[stakeholder.permissionLevel]}
									>
										<Shield className="mr-1 h-3 w-3" />
										{PERMISSION_LABELS[stakeholder.permissionLevel]}
									</Badge>
								</div>

								{/* Contact Info */}
								<div className="flex flex-wrap gap-3 text-xs">
									{stakeholder.email && (
										<a
											href={`mailto:${stakeholder.email}`}
											className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
										>
											<Mail className="h-3 w-3" />
											{stakeholder.email}
										</a>
									)}
									{stakeholder.phone && (
										<a
											href={`tel:${stakeholder.phone}`}
											className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
										>
											<Phone className="h-3 w-3" />
											{stakeholder.phone}
										</a>
									)}
								</div>

								{/* Last Active */}
								<p className="text-muted-foreground text-xs">
									Last active: {getTimeAgo(stakeholder.lastActive)}
								</p>
							</div>
						</div>
					))
				)}
			</CardContent>
		</Card>
	);
}
