export const exampleLinkedPropertyData = {
	totalProperties: 3,
	totalOpenLoanAmount: 300000,
	totalEstimatedValue: 1500000,
	totalEquity: 1200000,
	linkedProperties: [
		{
			id: "1",
			address: "123 Main St",
			estimatedValue: 500000,
			openLoanAmount: 100000,
			equity: 400000,
		},
		{
			id: "2",
			address: "456 Elm St",
			estimatedValue: 700000,
			openLoanAmount: 200000,
			equity: 500000,
		},
		{
			id: "3",
			address: "789 Oak St",
			estimatedValue: 300000,
			openLoanAmount: 0,
			equity: 300000,
		},
	],
};

export const foreclosureData = {
	active: null,
	documentType: null,
	recordingDate: null,
	originalLoanAmount: null,
	estimatedBankValue: null,
};

export const liensData = {
	taxLiens: "No", // Assume we know there are no tax liens
};

export const mortgageData = [
	{
		loan_position: "First",
		recording_date: "01/02/2021",
		loan_amount: "$880,000",
		est_rate: "-",
		document_number: "949555205",
		deed_type: "Deed Of Trust",
		lender_name: "First Centennial Mortgage Corp",
		lender_type: "Mortgage Company",
		grantee_names: "Fredric M Winocur, Patricia S Winocur",
		loan_type: "Conventional",
	},
];
export const saleData = {
	date_of_sale: "23/10/2012",
	amount: 1150000, // Sale amount in dollars
	purchase_method: "Financed",
	document_type: "Warranty Deed",
	transaction_type: "Transfer",
	seller_names: "Harvey, Gary E", // Seller's name
	buyer_names: "Fredric M Winocur, Patricia S Winocur", // Buyer's name
};
export const saleHistoryData = [
	{
		date_of_sale: "23/10/2012",
		amount: "$1,150,000",
		purchase_method: "Financed",
		document_type: "Warranty Deed",
		transaction_type: "Transfer",
		seller_names: "Harvey, Gary E",
		buyer_names: "Fredric M Winocur, Patricia S Winocur",
	},
];
