import type React from "react";

interface MLSData {
	mls: string;
	mls_id: string;
	list_date: string;
	list_price: number;
	sold_price: number;
	status: string;
	property_url: string;
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
						<td className="font-semibold text-muted-foreground">List Date:</td>
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
