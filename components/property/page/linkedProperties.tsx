import type React from "react";

// Define the structure for linked property data
interface LinkedProperty {
	id: string;
	address: string;
	estimatedValue: number | null;
	openLoanAmount: number | null;
	equity: number | null;
}

interface LinkedPropertiesProps {
	totalProperties: number;
	totalOpenLoanAmount: number | null;
	totalEstimatedValue: number | null;
	totalEquity: number | null;
	linkedProperties: LinkedProperty[];
}

const LinkedPropertiesComponent: React.FC<LinkedPropertiesProps> = ({
	totalProperties,
	totalOpenLoanAmount,
	totalEstimatedValue,
	totalEquity,
	linkedProperties,
}) => {
	return (
		<div className="rounded-lg bg-card p-6 shadow-md text-card-foreground">
			{/* Header Boxes */}
			<div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
				<div className="rounded-lg border border-border p-4 text-center">
					<h3 className="text-sm font-semibold text-muted-foreground">
						Total Properties Owned
					</h3>
					<p className="text-lg text-foreground">{totalProperties || "-"}</p>
				</div>
				<div className="rounded-lg border border-border p-4 text-center">
					<h3 className="text-sm font-semibold text-muted-foreground">
						Total Open Loan Amount
					</h3>
					<p className="text-lg text-foreground">
						{totalOpenLoanAmount !== null
							? `$${totalOpenLoanAmount.toLocaleString()}`
							: "-"}
					</p>
				</div>
				<div className="rounded-lg border border-border p-4 text-center">
					<h3 className="text-sm font-semibold text-muted-foreground">
						Total Estimated Value
					</h3>
					<p className="text-lg text-foreground">
						{totalEstimatedValue !== null
							? `$${totalEstimatedValue.toLocaleString()}`
							: "-"}
					</p>
				</div>
				<div className="rounded-lg border border-border p-4 text-center">
					<h3 className="text-sm font-semibold text-muted-foreground">
						Portfolio Equity
					</h3>
					<p className="text-lg text-foreground">
						{totalEquity !== null ? `$${totalEquity.toLocaleString()}` : "-"}
					</p>
				</div>
			</div>

			{/* Linked Properties Section */}
			<div>
				<h3 className="mb-4 text-lg font-semibold text-foreground">
					Linked Properties
				</h3>
				{linkedProperties.length > 0 ? (
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{linkedProperties.map((property) => (
							<div
								key={property.id}
								className="rounded-lg border border-border p-4"
							>
								<h4 className="text-md font-semibold text-foreground">
									{property.address}
								</h4>
								<p className="text-muted-foreground">
									Estimated Value:{" "}
									{property.estimatedValue !== null
										? `$${property.estimatedValue.toLocaleString()}`
										: "N/A"}
								</p>
								<p className="text-muted-foreground">
									Open Loan Amount:{" "}
									{property.openLoanAmount !== null
										? `$${property.openLoanAmount.toLocaleString()}`
										: "N/A"}
								</p>
								<p className="text-muted-foreground">
									Equity:{" "}
									{property.equity !== null
										? `$${property.equity.toLocaleString()}`
										: "N/A"}
								</p>
							</div>
						))}
					</div>
				) : (
					<div className="py-12 text-center">
						<div className="mb-4 flex items-center justify-center">
							<svg
								className="h-12 w-12 text-muted-foreground"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
								aria-labelledby="no-results-title"
								role="img"
							>
								<title id="no-results-title">No results found icon</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m0 0l3-3m-6 0l3 3"
								/>
							</svg>
						</div>
						<p className="text-sm text-muted-foreground">No results found</p>
						<p className="text-xs text-muted-foreground">
							We couldn’t find any results that match your search or filtering
							criteria.
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default LinkedPropertiesComponent;
