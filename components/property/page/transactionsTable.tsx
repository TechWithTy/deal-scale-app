import type React from "react";

interface Transaction {
	date_of_sale: string;
	amount: number;
	purchase_method: string;
	document_type: string;
	transaction_type: string;
	seller_names: string;
	buyer_names: string;
}

interface TransactionProps {
	transactions: Transaction[];
}

const TransactionTable: React.FC<TransactionProps> = ({ transactions }) => {
	return (
		<div className="table-container">
			<h2 className="mb-4 font-semibold text-lg">Sale History</h2>
			<table className="w-full table-auto border">
				<thead>
					<tr>
						<th>Date of Sale</th>
						<th>Amount</th>
						<th>Purchase Method</th>
						<th>Document Type</th>
						<th>Transaction Type</th>
						<th>Seller Name(s)</th>
						<th>Buyer Name(s)</th>
					</tr>
				</thead>
				<tbody>
					{transactions.map((transaction) => (
						<tr key={transaction.date_of_sale}>
							<td>{transaction.date_of_sale}</td>
							<td>${transaction.amount.toLocaleString()}</td>
							<td>{transaction.purchase_method}</td>
							<td>{transaction.document_type}</td>
							<td>{transaction.transaction_type}</td>
							<td>{transaction.seller_names}</td>
							<td>{transaction.buyer_names}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default TransactionTable;
