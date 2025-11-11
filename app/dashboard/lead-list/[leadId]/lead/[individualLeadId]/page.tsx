import { Breadcrumbs } from "@/components/breadcrumbs";
import PageContainer from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	buildLeadDetailPath,
	fetchLeadDetail,
} from "@/lib/server/leads/leadListService";
import type { LeadList, LeadTypeGlobal } from "@/types/_dashboard/leads";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface LeadDetailPageProps {
	params: {
		leadId: string;
		individualLeadId: string;
	};
	searchParams?: Record<string, string | string[] | undefined>;
}

export async function generateMetadata(
	props: LeadDetailPageProps,
): Promise<Metadata> {
	const { params } = props;
	const payload = await fetchLeadDetail(params.leadId, params.individualLeadId);
	if (!payload) {
		return { title: "Lead not found" };
	}
	const { lead, list } = payload;
	const name =
		`${lead.contactInfo.firstName} ${lead.contactInfo.lastName}`.trim();
	return {
		title: `${name} • ${list.listName}`,
		description: `Detailed profile and campaign context for ${name} in ${list.listName}.`,
		openGraph: {
			title: `${name} • Lead Detail`,
			description: lead.summary,
			url: buildLeadDetailPath(params.leadId, params.individualLeadId),
		},
	};
}

export default async function LeadDetailPage({
	params,
	searchParams,
}: LeadDetailPageProps) {
	const payload = await fetchLeadDetail(params.leadId, params.individualLeadId);
	if (!payload) {
		notFound();
	}

	const { list, lead } = payload;
	const name =
		`${lead.contactInfo.firstName} ${lead.contactInfo.lastName}`.trim();
	const context = extractContext(searchParams);
	const breadcrumbs = buildBreadcrumbs(list, params.leadId, name);

	return (
		<PageContainer scrollable={true}>
			<div className="mx-auto flex w-full max-w-6xl flex-col gap-6 py-4">
				<Breadcrumbs items={breadcrumbs} />
				{context ? <ContextBanner context={context} /> : null}
				<LeadHeaderCard lead={lead} list={list} name={name} />
				<section className="grid gap-6 lg:grid-cols-3">
					<ContactCard lead={lead} />
					<PropertyCard lead={lead} />
					<ComplianceCard lead={lead} />
				</section>
				<section className="grid gap-6 lg:grid-cols-2">
					<CommunicationCard lead={lead} />
					<ActivityCard lead={lead} list={list} />
				</section>
				{lead.notes ? <NotesCard notes={lead.notes} /> : null}
			</div>
		</PageContainer>
	);
}

function buildBreadcrumbs(list: LeadList, listId: string, leadName: string) {
	return [
		{ title: "Dashboard", link: "/dashboard" },
		{ title: "Lead Lists", link: "/dashboard/lead-list" },
		{
			title: list.listName,
			link: `/dashboard/lead-list/${listId}`,
		},
		{ title: leadName, link: "#" },
	];
}

function extractContext(
	searchParams?: Record<string, string | string[] | undefined>,
): string | null {
	if (!searchParams) return null;
	const value = searchParams.context;
	if (Array.isArray(value)) return value[0] ?? null;
	return value ?? null;
}

function ContextBanner({ context }: { context: string }) {
	return (
		<Card className="border-primary/40 bg-primary/5">
			<CardHeader className="pb-2">
				<CardTitle className="text-sm font-medium text-primary">
					Deep link context
				</CardTitle>
			</CardHeader>
			<CardContent className="text-sm text-muted-foreground">
				This lead was opened from <span className="font-medium">{context}</span>
				. Review status, then continue the workflow.
			</CardContent>
		</Card>
	);
}

function LeadHeaderCard({
	lead,
	list,
	name,
}: {
	lead: LeadTypeGlobal;
	list: LeadList;
	name: string;
}) {
	return (
		<Card>
			<CardHeader className="flex flex-col gap-2 border-b border-border/60 pb-4">
				<CardTitle className="flex flex-wrap items-center gap-3 text-2xl font-semibold">
					{name}
					<Badge variant="outline" className="capitalize">
						{lead.status.toLowerCase()}
					</Badge>
					{lead.priority ? (
						<Badge variant="secondary">Priority: {lead.priority}</Badge>
					) : null}
				</CardTitle>
				<p className="text-sm text-muted-foreground">
					Member of <span className="font-medium">{list.listName}</span> ·{" "}
					{list.records} records ·{list.phone} phones · {list.emails} emails
				</p>
			</CardHeader>
			<CardContent className="grid gap-4 pt-4 md:grid-cols-3">
				<DetailStat label="Bedrooms" value={lead.bed} />
				<DetailStat label="Bathrooms" value={lead.bath} />
				<DetailStat label="Square feet" value={formatNumber(lead.sqft)} />
			</CardContent>
		</Card>
	);
}

function ContactCard({ lead }: { lead: LeadTypeGlobal }) {
	const contact = lead.contactInfo;
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base font-semibold">Contact</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3 text-sm">
				<DetailRow label="Email" value={contact.email} />
				<DetailRow label="Phone" value={contact.phone} />
				<DetailRow label="Address" value={lead.address1.fullStreetLine} />
				<DetailRow
					label="City"
					value={`${lead.address1.city}, ${lead.address1.state} ${lead.address1.zipCode}`}
				/>
				{contact.domain ? (
					<DetailRow label="Domain" value={contact.domain} />
				) : null}
			</CardContent>
		</Card>
	);
}

function PropertyCard({ lead }: { lead: LeadTypeGlobal }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base font-semibold">
					Property insight
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3 text-sm">
				<DetailRow label="Summary" value={lead.summary} />
				{lead.propertyValue ? (
					<DetailRow
						label="Estimated value"
						value={`$${formatNumber(lead.propertyValue)}`}
					/>
				) : null}
				{lead.yearBuilt ? (
					<DetailRow label="Year built" value={String(lead.yearBuilt)} />
				) : null}
				{lead.tags ? <DetailRow label="Tags" value={lead.tags} /> : null}
			</CardContent>
		</Card>
	);
}

function ComplianceCard({ lead }: { lead: LeadTypeGlobal }) {
	const dncStatus = lead.dncList ? "On DNC" : "Callable";
	const tcpaStatus = lead.tcpaOptedIn ? "Opted in" : "No consent";
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base font-semibold">Compliance</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4 text-sm">
				<div className="space-y-2">
					<p className="font-medium">Do Not Call</p>
					<Badge variant={lead.dncList ? "destructive" : "secondary"}>
						{dncStatus}
					</Badge>
					{lead.dncSource ? (
						<p className="text-muted-foreground">Source: {lead.dncSource}</p>
					) : null}
				</div>
				<Separator />
				<div className="space-y-2">
					<p className="font-medium">TCPA</p>
					<Badge variant={lead.tcpaOptedIn ? "secondary" : "outline"}>
						{tcpaStatus}
					</Badge>
					{lead.tcpaConsentDate ? (
						<p className="text-muted-foreground">
							Consent on {formatDate(lead.tcpaConsentDate)}
						</p>
					) : null}
					{lead.tcpaSource ? (
						<p className="text-muted-foreground">Source: {lead.tcpaSource}</p>
					) : null}
				</div>
			</CardContent>
		</Card>
	);
}

function CommunicationCard({ lead }: { lead: LeadTypeGlobal }) {
	const channels = lead.communicationPreferences ?? [];
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base font-semibold">
					Communication preferences
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3 text-sm">
				<DetailRow
					label="Preferred channels"
					value={channels.length ? channels.join(", ") : "Not specified"}
				/>
				{lead.isIphone !== undefined ? (
					<DetailRow
						label="Device"
						value={lead.isIphone ? "iPhone" : "Other"}
					/>
				) : null}
				{lead.socialHandle ? (
					<DetailRow label="Social handle" value={lead.socialHandle} />
				) : null}
				{lead.socialSummary ? (
					<DetailRow label="Social notes" value={lead.socialSummary} />
				) : null}
			</CardContent>
		</Card>
	);
}

function ActivityCard({
	lead,
	list,
}: { lead: LeadTypeGlobal; list: LeadList }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base font-semibold">
					Activity & timeline
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3 text-sm">
				<DetailRow label="Last update" value={formatDate(lead.lastUpdate)} />
				{lead.followUp ? (
					<DetailRow label="Next follow-up" value={formatDate(lead.followUp)} />
				) : null}
				<DetailRow label="List upload" value={list.uploadDate} />
				{lead.leadSource ? (
					<DetailRow label="Lead source" value={lead.leadSource} />
				) : null}
			</CardContent>
		</Card>
	);
}

function NotesCard({ notes }: { notes: string }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base font-semibold">Notes</CardTitle>
			</CardHeader>
			<CardContent className="text-sm leading-relaxed text-muted-foreground">
				{notes}
			</CardContent>
		</Card>
	);
}

function DetailRow({
	label,
	value,
}: {
	label: string;
	value: string;
}) {
	return (
		<div>
			<p className="text-xs uppercase tracking-wide text-muted-foreground">
				{label}
			</p>
			<p className="font-medium text-foreground">{value}</p>
		</div>
	);
}

function DetailStat({
	label,
	value,
}: {
	label: string;
	value: number | string;
}) {
	return (
		<div>
			<p className="text-xs uppercase tracking-wide text-muted-foreground">
				{label}
			</p>
			<p className="text-lg font-semibold text-foreground">{value}</p>
		</div>
	);
}

function formatNumber(value: number | undefined): string {
	if (value === undefined || Number.isNaN(value)) return "—";
	return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
		value,
	);
}

function formatDate(value: string | null | undefined): string {
	if (!value) return "—";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	}).format(date);
}
