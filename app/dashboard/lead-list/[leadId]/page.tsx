import { Breadcrumbs } from "@/components/breadcrumbs";
import PageContainer from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchPublicApiLeadList } from "@/lib/server/leads/publicApiLeadDetails";
import { findLeadListById } from "@/lib/server/leads/leadListService";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: { leadId: string } };

export default async function LeadListDetailPage({ params }: Props) {
	const list =
		(await fetchPublicApiLeadList(params.leadId)) ?? findLeadListById(params.leadId);
	if (!list) notFound();

	return (
		<PageContainer scrollable={true}>
			<div className="mx-auto flex w-full max-w-6xl flex-col gap-6 py-4">
				<Breadcrumbs
					items={[
						{ title: "Dashboard", link: "/dashboard" },
						{ title: "Lead Lists", link: "/dashboard/lead-list" },
						{ title: list.listName, link: "#" },
					]}
				/>
				<Card>
					<CardHeader>
						<CardTitle className="flex flex-wrap items-center gap-3">
							{list.listName}
							<Badge variant="secondary">{list.records} records</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent className="grid gap-3 text-sm md:grid-cols-3">
						<Stat label="Phones" value={list.phone} />
						<Stat label="Emails" value={list.emails} />
						<Stat label="Uploaded" value={formatDate(list.uploadDate)} />
					</CardContent>
				</Card>
				<section className="grid gap-3">
					{list.leads.length ? (
						list.leads.map((lead) => (
							<Link
								className="rounded-lg border bg-card p-4 transition hover:bg-muted"
								href={`/dashboard/lead-list/${list.id}/lead/${lead.id}`}
								key={lead.id}
							>
								<div className="flex flex-wrap items-center justify-between gap-2">
									<p className="font-medium">
										{lead.contactInfo.firstName} {lead.contactInfo.lastName}
									</p>
									<Badge variant="outline">{lead.status}</Badge>
								</div>
								<p className="mt-1 text-muted-foreground text-sm">
									{lead.contactInfo.email ||
										lead.contactInfo.phone ||
										"No contact on file"}
								</p>
							</Link>
						))
					) : (
						<Card>
							<CardContent className="pt-6 text-muted-foreground text-sm">
								This lead list has no returned leads yet.
							</CardContent>
						</Card>
					)}
				</section>
			</div>
		</PageContainer>
	);
}

function Stat({ label, value }: { label: string; value: number | string }) {
	return (
		<div className="rounded-md border bg-background p-3">
			<p className="text-muted-foreground text-xs">{label}</p>
			<p className="font-semibold">{value}</p>
		</div>
	);
}

function formatDate(value: string) {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}
