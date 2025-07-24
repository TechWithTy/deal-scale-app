import React from 'react';

interface Sale {
  date_of_sale: string;
  amount: number;
  purchase_method: string;
  document_type: string;
  transaction_type: string;
  seller_names: string;
  buyer_names: string;
}

interface LastSaleProps {
  sale: Sale;
}

export const LastSaleTable: React.FC<LastSaleProps> = ({ sale }) => {
  return (
    <div className="mx-auto w-full max-w-[800px]">
      <h3 className="mb-4 text-center text-lg font-semibold dark:text-white">
        Last Sale
      </h3>

      <div className="mb-4 grid grid-cols-1 gap-y-4 border-b bg-white p-4 sm:grid-cols-2 sm:gap-y-2 dark:border-gray-700 dark:bg-gray-800">
        <div>
          <span className="font-semibold">Date of Sale</span>
          <div>{sale.date_of_sale}</div>
        </div>
        <div>
          <span className="font-semibold">Amount</span>
          <div>{sale.amount.toLocaleString()}</div>
        </div>
        <div>
          <span className="font-semibold">Purchase Method</span>
          <div>{sale.purchase_method}</div>
        </div>
        <div>
          <span className="font-semibold">Document Type</span>
          <div>{sale.document_type}</div>
        </div>
        <div>
          <span className="font-semibold">Transaction Type</span>
          <div>{sale.transaction_type}</div>
        </div>
        <div>
          <span className="font-semibold">Seller Name(s)</span>
          <div>{sale.seller_names}</div>
        </div>
        <div>
          <span className="font-semibold">Buyer Name(s)</span>
          <div>{sale.buyer_names}</div>
        </div>
      </div>
    </div>
  );
};

interface Mortgage {
  loan_position: string;
  recording_date: string;
  loan_amount: string;
  est_rate?: string;
  document_number: string;
  deed_type: string;
  lender_name: string;
  lender_type: string;
  grantee_names: string;
  loan_type: string;
}

interface CurrentMortgageProps {
  mortgage: Mortgage;
}

export const CurrentMortgageTable: React.FC<CurrentMortgageProps> = ({
  mortgage
}) => {
  return (
    <div className="mx-auto w-full max-w-[800px]">
      <h3 className="mb-4 text-center text-lg font-semibold dark:text-white">
        Current Mortgage
      </h3>

      <div className="mb-4 grid grid-cols-1 gap-y-4 border-b bg-white p-4 sm:grid-cols-2 sm:gap-y-2 dark:border-gray-700 dark:bg-gray-800">
        <div>
          <span className="font-semibold">Loan Position</span>
          <div>{mortgage.loan_position}</div>
        </div>
        <div>
          <span className="font-semibold">Recording Date</span>
          <div>{mortgage.recording_date}</div>
        </div>
        <div>
          <span className="font-semibold">Loan Amount</span>
          <div>{mortgage.loan_amount.toLocaleString()}</div>
        </div>
        <div>
          <span className="font-semibold">Est. Rate</span>
          <div>{mortgage.est_rate || '-'}</div>
        </div>
        <div>
          <span className="font-semibold">Document Number</span>
          <div>{mortgage.document_number}</div>
        </div>
        <div>
          <span className="font-semibold">Deed Type</span>
          <div>{mortgage.deed_type}</div>
        </div>
        <div>
          <span className="font-semibold">Lender Name</span>
          <div>{mortgage.lender_name}</div>
        </div>
        <div>
          <span className="font-semibold">Lender Type</span>
          <div>{mortgage.lender_type}</div>
        </div>
        <div>
          <span className="font-semibold">Grantee Name(s)</span>
          <div>{mortgage.grantee_names}</div>
        </div>
        <div>
          <span className="font-semibold">Loan Type</span>
          <div>{mortgage.loan_type}</div>
        </div>
      </div>
    </div>
  );
};
