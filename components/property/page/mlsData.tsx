import type React from "react";

interface MLSData {
	mls: string;
	mls_id: string;
	list_date: string;
	list_price: number;
	sold_price: number;
	status: string;
	property_url: string;
	days_on_market?: number;
	county?: string;
	date_label?: string;
	listing_type?: string;
	created_date?: string;
	last_seen_date?: string;
	state_fips?: string;
	county_fips?: string;
}

interface MLSTableProps {
	mlsData: MLSData;
}

const MLSTableComponent: React.FC<MLSTableProps> = ({ mlsData }) => {
	return (
		<div className="rounded-lg bg-card p-6 text-card-foreground shadow-md">
			<h2 className="mb-4 font-bold text-foreground text-xl">
				MLS Information
			</h2>
			<table className="w-full table-auto text-left">
				<tbody>
					<tr className="border-border border-b">
						<td className="font-semibold text-muted-foreground">MLS:</td>
						<td className="text-foreground">{mlsData.mls || "N/A"}</td>
					</tr>
					<tr className="border-border border-b">
						<td className="font-semibold text-muted-foreground">MLS ID:</td>
						<td className="text-foreground">{mlsData.mls_id || "N/A"}</td>
					</tr>
					<tr className="border-border border-b">
						<td className="font-semibold text-muted-foreground">
							{mlsData.date_label || "List Date"}:
						</td>
						<td className="text-foreground">{mlsData.list_date || "N/A"}</td>
					</tr>
					<tr className="border-border border-b">
						<td className="font-semibold text-muted-foreground">List Price:</td>
						<td className="text-foreground">
							{mlsData.list_price
								? `$${mlsData.list_price.toLocaleString()}`
								: "N/A"}
						</td>
					</tr>
					<tr className="border-border border-b">
						<td className="font-semibold text-muted-foreground">Sold Price:</td>
						<td className="text-foreground">
							{mlsData.sold_price
								? `$${mlsData.sold_price.toLocaleString()}`
								: "N/A"}
						</td>
					</tr>
					<tr className="border-border border-b">
						<td className="font-semibold text-muted-foreground">Status:</td>
						<td className="text-foreground">{mlsData.status || "N/A"}</td>
					</tr>
					{mlsData.listing_type && (
						<tr className="border-border border-b">
							<td className="font-semibold text-muted-foreground">
								Listing Type:
							</td>
							<td className="text-foreground">{mlsData.listing_type}</td>
						</tr>
					)}
					{typeof mlsData.days_on_market === "number" && (
						<tr className="border-border border-b">
							<td className="font-semibold text-muted-foreground">
								Days on Market:
							</td>
							<td className="text-foreground">{mlsData.days_on_market}</td>
						</tr>
					)}
					{mlsData.county && (
						<tr className="border-border border-b">
							<td className="font-semibold text-muted-foreground">County:</td>
							<td className="text-foreground">{mlsData.county}</td>
						</tr>
					)}
					{(mlsData.created_date || mlsData.last_seen_date) && (
						<tr className="border-border border-b">
							<td className="font-semibold text-muted-foreground">
								First/Last Seen:
							</td>
							<td className="text-foreground">
								{mlsData.created_date ? mlsData.created_date : "-"} /{" "}
								{mlsData.last_seen_date ? mlsData.last_seen_date : "-"}
							</td>
						</tr>
					)}
					{(mlsData.state_fips || mlsData.county_fips) && (
						<tr className="border-border border-b">
							<td className="font-semibold text-muted-foreground">
								Geo Codes (State/County):
							</td>
							<td className="text-foreground">
								{mlsData.state_fips ?? "-"} / {mlsData.county_fips ?? "-"}
							</td>
						</tr>
					)}
					<tr className="border-border border-b">
						<td className="font-semibold text-muted-foreground">
							Property URL:
						</td>
						<td className="text-foreground">
							<a
								href={mlsData.property_url}
								target="_blank"
								rel="noopener noreferrer"
								className="text-primary"
							>
								{mlsData.property_url ? "View Property" : "N/A"}
							</a>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
};

export default MLSTableComponent;
