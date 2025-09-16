import type React from "react";

interface MortgageHistoryProps {
	mortgages: Array<{
		loan_position: string;
		recording_date: string;
		loan_amount: string;
		est_rate: string;
		document_number: string;
		deed_type: string;
		lender_name: string;
		lender_type: string;
		grantee_names: string;
		loan_type: string;
	}>;
}

export const MortgageHistoryTable: React.FC<MortgageHistoryProps> = ({
	mortgages,
}) => {
	return (
		<div className="w-full">
			<h3 className="mb-4 text-center text-lg font-semibold text-foreground">
				Mortgage History
			</h3>
			<div className="mx-auto max-w-[800px]">
				{mortgages.map((mortgage) => (
					<div
						key={mortgage.document_number}
						className="mb-4 grid grid-cols-1 gap-y-4 border-b border-border bg-card p-4 sm:grid-cols-2 sm:gap-y-2"
					>
						<div>
							<span className="font-semibold text-muted-foreground">
								Loan Position
							</span>
							<div className="text-foreground">{mortgage.loan_position}</div>
						</div>
						<div>
							<span className="font-semibold text-muted-foreground">
								Recording Date
							</span>
							<div className="text-foreground">{mortgage.recording_date}</div>
						</div>

						<div>
							<span className="font-semibold text-muted-foreground">
								Loan Amount
							</span>
							<div className="text-foreground">{mortgage.loan_amount}</div>
						</div>
						<div>
							<span className="font-semibold text-muted-foreground">
								Est. Rate
							</span>
							<div className="text-foreground">{mortgage.est_rate || "-"}</div>
						</div>

						<div>
							<span className="font-semibold text-muted-foreground">
								Document Number
							</span>
							<div className="text-foreground">{mortgage.document_number}</div>
						</div>
						<div>
							<span className="font-semibold text-muted-foreground">
								Deed Type
							</span>
							<div className="text-foreground">{mortgage.deed_type}</div>
						</div>

						<div>
							<span className="font-semibold text-muted-foreground">
								Lender Name
							</span>
							<div className="text-foreground">{mortgage.lender_name}</div>
						</div>
						<div>
							<span className="font-semibold text-muted-foreground">
								Lender Type
							</span>
							<div className="text-foreground">{mortgage.lender_type}</div>
						</div>

						<div>
							<span className="font-semibold text-muted-foreground">
								Grantee Name(s)
							</span>
							<div className="text-foreground">{mortgage.grantee_names}</div>
						</div>
						<div>
							<span className="font-semibold text-muted-foreground">
								Loan Type
							</span>
							<div className="text-foreground">{mortgage.loan_type}</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

interface SaleHistoryProps {
	sales: Array<{
		date_of_sale: string;
		amount: string;
		purchase_method: string;
		document_type: string;
		transaction_type: string;
		seller_names: string;
		buyer_names: string;
	}>;
}

export const SaleHistoryTable: React.FC<SaleHistoryProps> = ({ sales }) => {
	return (
		<div className="mt-6 w-full">
			<h3 className="mb-4 text-center text-lg font-semibold text-foreground">
				Sale History
			</h3>
			<div className="mx-auto max-w-[800px]">
				{sales.map((sale) => (
					<div
						key={sale.seller_names + sale.buyer_names + sale.date_of_sale}
						className="mb-4 grid grid-cols-1 gap-y-4 border-b border-border bg-card p-4 sm:grid-cols-2 sm:gap-y-2"
					>
						<div>
							<span className="font-semibold text-muted-foreground">
								Date of Sale
							</span>
							<div className="text-foreground">{sale.date_of_sale}</div>
						</div>
						<div>
							<span className="font-semibold text-muted-foreground">
								Amount
							</span>
							<div className="text-foreground">{sale.amount}</div>
						</div>

						<div>
							<span className="font-semibold text-muted-foreground">
								Purchase Method
							</span>
							<div className="text-foreground">{sale.purchase_method}</div>
						</div>
						<div>
							<span className="font-semibold text-muted-foreground">
								Document Type
							</span>
							<div className="text-foreground">{sale.document_type}</div>
						</div>

						<div>
							<span className="font-semibold text-muted-foreground">
								Transaction Type
							</span>
							<div className="text-foreground">{sale.transaction_type}</div>
						</div>
						<div>
							<span className="font-semibold text-muted-foreground">
								Seller Name(s)
							</span>
							<div className="text-foreground">{sale.seller_names}</div>
						</div>

						<div>
							<span className="font-semibold text-muted-foreground">
								Buyer Name(s)
							</span>
							<div className="text-foreground">{sale.buyer_names}</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
