'use client';

import React from 'react';

interface OwnershipDetails {
  owner1_name: string;
  owner2_name: string;
  ownership_length: string;
  mailing_address: string;
}

interface OwnershipProps {
  ownership: OwnershipDetails;
}

const OwnershipInformationComponent: React.FC<OwnershipProps> = ({
  ownership
}) => {
  // Function to render ownership information
  const renderOwnershipDetails = (label: string, value: any) => {
    return (
      <div className="mb-4 flex flex-col items-start">
        <span className="font-semibold text-gray-500 dark:text-gray-400">
          {label}
        </span>
        <span>
          {value !== null && value !== undefined && value !== '' ? value : '-'}
        </span>
      </div>
    );
  };

  return (
    <div className="my-2 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800 dark:shadow-lg">
      <h2 className="mb-4 text-xl font-bold dark:text-white">
        Ownership Information
      </h2>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {renderOwnershipDetails('Owner 1 Name', ownership.owner1_name)}
        {renderOwnershipDetails('Owner 2 Name', ownership.owner2_name)}
        {renderOwnershipDetails(
          'Length of Ownership',
          ownership.ownership_length
        )}
        {renderOwnershipDetails('Mailing Address', ownership.mailing_address)}
      </div>
    </div>
  );
};

export default OwnershipInformationComponent;
