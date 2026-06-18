import { Facebook, Instagram, Linkedin, type LucideIcon } from "lucide-react";
import type * as React from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../components/ui/select";
import { CashBuyerProfilePanel } from "./CashBuyerProfilePanel";
import type { DemoLead, DemoRow, SocialLink } from "./types";

interface LeadCardProps {
	lead: DemoLead;
	rowId: string;
	setData: React.Dispatch<React.SetStateAction<DemoRow[]>>;
}

function getLeadSocialLinks(lead: DemoLead): SocialLink[] {
	return Array.isArray(lead.socials) ? lead.socials : [];
}

function getSocialIcon(label: string): { Icon: LucideIcon; className: string } {
	const normalizedLabel = label.toLowerCase();

	if (normalizedLabel.includes("facebook")) {
		return { Icon: Facebook, className: "text-blue-600" };
	}
	if (normalizedLabel.includes("linkedin")) {
		return { Icon: Linkedin, className: "text-sky-700" };
	}
	return { Icon: Instagram, className: "text-pink-600" };
}

export function getPrimarySocialUrl(lead: DemoLead) {
	return getLeadSocialLinks(lead)[0]?.url ?? "";
}

export function LeadCard({ lead, rowId, setData }: LeadCardProps) {
	const updateStatus = (status: DemoLead["status"]) => {
		setData((prev) =>
			prev.map((row) =>
				row.id === rowId
					? {
							...row,
							leads: row.leads.map((item) =>
								item.id === lead.id ? { ...item, status } : item,
							),
						}
					: row,
			),
		);
	};

	return (
		<div className="rounded-lg border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
			<div className="grid grid-cols-12 gap-4">
				<div className="col-span-12 space-y-3 md:col-span-8">
					<div className="flex items-start justify-between gap-3">
						<div className="min-w-0 flex-1">
							<h3 className="break-words font-semibold text-foreground text-lg">
								{lead.name}
							</h3>
							<p className="break-words text-muted-foreground text-sm">
								{lead.address}
							</p>
						</div>
						<div className="w-[130px] shrink-0">
							<Select
								value={lead.status}
								onValueChange={(value) =>
									updateStatus(value as DemoLead["status"])
								}
							>
								<SelectTrigger className="h-8">
									<SelectValue placeholder="Status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="New Lead">New Lead</SelectItem>
									<SelectItem value="Contacted">Contacted</SelectItem>
									<SelectItem value="Qualified">Qualified</SelectItem>
									<SelectItem value="Do Not Contact">Do Not Contact</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="space-y-2">
						<div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
							<span className="text-muted-foreground text-sm w-12 shrink-0">
								Phone
							</span>
							<span className="font-medium tabular-nums break-all">
								{lead.phone}
							</span>
						</div>
						<div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
							<span className="text-muted-foreground text-sm w-12 shrink-0">
								Email
							</span>
							<a
								href={`mailto:${lead.email}`}
								className="break-words font-medium text-primary underline-offset-2 hover:underline"
							>
								{lead.email}
							</a>
						</div>
					</div>

					<div className="break-words text-muted-foreground text-xs">
						<span className="font-medium">Associated Address:</span>{" "}
						{lead.associatedAddress}
					</div>

					<div className="flex flex-wrap gap-1.5 text-[11px]">
						<span
							className={`inline-flex items-center rounded-full border px-2 py-1 ${(lead.isIPhone ?? lead.isIphone) ? "border-emerald-400 text-emerald-600" : "border-red-300 text-red-600"}`}
						>
							iPhone: {(lead.isIPhone ?? lead.isIphone) ? "Yes" : "No"}
						</span>
						<span
							className={`inline-flex items-center rounded-full border px-2 py-1 ${lead.addressVerified ? "border-emerald-400 text-emerald-600" : "border-red-300 text-red-600"}`}
						>
							Address: {lead.addressVerified ? "Verified" : "Unverified"}
						</span>
						<span
							className={`inline-flex items-center rounded-full border px-2 py-1 ${lead.phoneVerified ? "border-emerald-400 text-emerald-600" : "border-red-300 text-red-600"}`}
						>
							Phone: {lead.phoneVerified ? "Verified" : "Unverified"}
						</span>
						<span
							className={`inline-flex items-center rounded-full border px-2 py-1 ${lead.emailVerified ? "border-emerald-400 text-emerald-600" : "border-red-300 text-red-600"}`}
						>
							Email: {lead.emailVerified ? "Verified" : "Unverified"}
						</span>
						{getLeadSocialLinks(lead).length > 0 ? (
							getLeadSocialLinks(lead).map((social) => {
								const isSocialVerified =
									social.verified ?? lead.socialVerified ?? false;
								return (
									<span
										key={`badge-${social.label}`}
										className={`inline-flex items-center rounded-full border px-2 py-1 ${isSocialVerified ? "border-emerald-400 text-emerald-600" : "border-red-300 text-red-600"}`}
									>
										{social.label}:{" "}
										{isSocialVerified ? "Verified" : "Unverified"}
									</span>
								);
							})
						) : (
							<span
								className={`inline-flex items-center rounded-full border px-2 py-1 ${lead.socialVerified ? "border-emerald-400 text-emerald-600" : "border-red-300 text-red-600"}`}
							>
								Social: {lead.socialVerified ? "Verified" : "Unverified"}
							</span>
						)}
					</div>
				</div>

				<div className="col-span-12 md:col-span-4">
					<h4 className="mb-2 font-medium text-muted-foreground text-sm">
						Social Media
					</h4>
					<div className="flex min-h-[24px] flex-wrap gap-2">
						{getLeadSocialLinks(lead).map((social) => {
							const { Icon, className } = getSocialIcon(social.label);
							const isSocialVerified =
								social.verified ?? lead.socialVerified ?? false;

							return (
								<div key={social.label} className="relative">
									<a
										href={social.url}
										target="_blank"
										rel="noreferrer"
										aria-label={`Open ${social.label} profile`}
										title={`${social.label} (${isSocialVerified ? "Verified" : "Unverified"})`}
										className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
									>
										<Icon
											className={`h-4 w-4 ${className}`}
											aria-hidden="true"
										/>
									</a>
									{isSocialVerified ? (
										<div
											title="Verified profile"
											className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-background bg-emerald-500 text-[8px] font-bold text-white shadow-sm pointer-events-none"
										>
											✓
										</div>
									) : (
										<div
											title="Unverified profile"
											className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-background bg-red-500 text-[8px] font-bold text-white shadow-sm pointer-events-none"
										>
											✗
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>
			</div>
			<CashBuyerProfilePanel lead={lead} />
		</div>
	);
}
