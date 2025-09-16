import type React from "react";

interface ForeclosureData {
	active: boolean | null;
	documentType: string | null;
	recordingDate: string | null;
	originalLoanAmount: number | null;
	estimatedBankValue: number | null;
}

interface LiensData {
	taxLiens: string | null;
}

interface ForeclosuresProps {
	foreclosureData: ForeclosureData;
	liensData: LiensData;
}

const ForeclosuresComponent: React.FC<ForeclosuresProps> = ({
	foreclosureData,
	liensData,
}) => {
	return (
		<div>
			{/* Foreclosures Section */}
			<div className="my-2 rounded-lg bg-card p-6 shadow-md">
				<h3 className="mb-2 text-lg font-semibold text-foreground">
					Foreclosures
				</h3>
				<p className="mb-4 text-sm text-muted-foreground">
					Foreclosures recorded against the property.
				</p>
				<div className="grid grid-cols-2 gap-4 text-center text-sm font-semibold text-muted-foreground md:grid-cols-6">
					<div>Active</div>
					<div>Document Type</div>
					<div>Recording Date</div>
					<div>Original Loan Amount</div>
					<div>Est. Bank Value</div>
				</div>
				<div className="mt-2 grid grid-cols-2 gap-4 text-center text-sm text-foreground md:grid-cols-6">
					<div>
						{foreclosureData.active !== null
							? foreclosureData.active
								? "Yes"
								: "No"
							: "-"}
					</div>
					<div>{foreclosureData.documentType || "-"}</div>
					<div>{foreclosureData.recordingDate || "-"}</div>
					<div>
						{foreclosureData.originalLoanAmount
							? `$${foreclosureData.originalLoanAmount.toLocaleString()}`
							: "-"}
					</div>
					<div>
						{foreclosureData.estimatedBankValue
							? `$${foreclosureData.estimatedBankValue.toLocaleString()}`
							: "-"}
					</div>
				</div>
			</div>

			{/* Liens Section */}
			<div className="rounded-lg bg-card p-6 shadow-md">
				<h3 className="mb-2 text-lg font-semibold text-foreground">Liens</h3>
				<p className="mb-4 text-sm text-muted-foreground">
					Liens recorded against the property.
				</p>
				<div className="grid grid-cols-2 gap-4 text-center text-sm font-semibold text-muted-foreground md:grid-cols-6">
					<div>Tax Lien(s)</div>
				</div>
				<div className="mt-2 grid grid-cols-2 gap-4 text-center text-sm text-foreground md:grid-cols-6">
					<div>{liensData.taxLiens || "No"}</div>
				</div>
			</div>
		</div>
	);
};

export default ForeclosuresComponent;
