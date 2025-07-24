'use client';

import React from 'react';

interface PropertyDetails {
  [key: string]: any; // Allows any key-value pair
}

interface PropertyCardProps {
  property: PropertyDetails;
}

const PropertyCardDataComponent: React.FC<PropertyCardProps> = ({
  property
}) => {
  // Helper function to format keys for better readability
  // const formatKey = (key: string) => {
  //   return key
  //     .replace(/_/g, ' ') // Replace underscores with spaces
  //     .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
  // };

  // Function to render the property details with labels and values
  const renderPropertyDetails = (label: string, value: any) => {
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
        Property Information
      </h2>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {renderPropertyDetails('Bedrooms', property.beds)}
        {renderPropertyDetails('Full Bathrooms', property.full_baths)}
        {renderPropertyDetails('Partial Bathrooms', property.half_baths ?? '-')}
        {renderPropertyDetails(
          'Living Area',
          `${property.sqft?.toLocaleString()} SqFt.`
        )}
        {renderPropertyDetails('Stories', property.stories)}
        {renderPropertyDetails('Property Use', property.property_use)}
        {renderPropertyDetails('Residential Units', property.residential_units)}
        {renderPropertyDetails('Basement', property.basement)}
        {renderPropertyDetails('Basement Size', property.basement_size)}
        {renderPropertyDetails('Parking Spaces', property.parking_garage)}
        {renderPropertyDetails('Fireplaces', property.fireplaces)}
        {renderPropertyDetails('Air Conditioning', property.air_conditioning)}
        {renderPropertyDetails('Heating', property.heating)}
        {renderPropertyDetails('Heating Fuel', property.heating_fuel)}
        {renderPropertyDetails('Water Source', property.water_source ?? '-')}
        {renderPropertyDetails(
          'Garage',
          property.garage ?? 'Type Not Specified'
        )}
        {renderPropertyDetails('Garage Size', property.garage_size)}
        {renderPropertyDetails('Carport', property.carport ?? 'No')}
        {renderPropertyDetails('Porch', property.porch)}
        {renderPropertyDetails('Patio', property.patio)}
        {renderPropertyDetails('Pool', property.pool ?? 'No')}
      </div>
    </div>
  );
};

export default PropertyCardDataComponent;
