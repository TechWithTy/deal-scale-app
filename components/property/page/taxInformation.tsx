'use client';

import React from 'react';

interface TaxDetails {
  // apn: string;
  tax_year: number;
  tax_amount: string;
  assessment_year: number;
  total_assessed_value: string;
  market_land_value: string;
  market_value: string;
  market_improvement_value: string;
  assessed_land_value: string;
  assessed_improvement_value: string;
  county: string;
}

interface TaxInformationProps {
  taxInfo: TaxDetails;
}

const TaxInformationComponent: React.FC<TaxInformationProps> = ({
  taxInfo
}) => {
  const renderTaxDetails = (label: string, value: any) => (
    <div className="mb-4 flex flex-col items-start">
      <span className="font-semibold text-gray-500 dark:text-gray-400">
        {label}
      </span>
      <span className="dark:text-gray-300">{value ?? '-'}</span>
    </div>
  );

  return (
    <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800 dark:shadow-lg">
      <h2 className="mb-4 text-xl font-bold dark:text-white">
        Tax Information
      </h2>
      <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
        Most recent taxes for this property.
      </p>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {/* {renderTaxDetails('APN', taxInfo.apn)} */}
        {renderTaxDetails('Tax Year', taxInfo.tax_year)}
        {renderTaxDetails('Tax Amount', taxInfo.tax_amount)}
        {renderTaxDetails('Assessment Year', taxInfo.assessment_year)}
        {renderTaxDetails('Total Assessed Value', taxInfo.total_assessed_value)}
        {renderTaxDetails('Market Land Value', taxInfo.market_land_value)}
        {renderTaxDetails('Market Value', taxInfo.market_value)}
        {renderTaxDetails(
          'Market Improvement Value',
          taxInfo.market_improvement_value
        )}
        {renderTaxDetails('Assessed Land Value', taxInfo.assessed_land_value)}
        {renderTaxDetails(
          'Assessed Improvement Value',
          taxInfo.assessed_improvement_value
        )}
        {renderTaxDetails('County', taxInfo.county)}
      </div>
    </div>
  );
};

export default TaxInformationComponent;
