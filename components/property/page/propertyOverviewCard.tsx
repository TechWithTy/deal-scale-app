'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Pencil } from 'lucide-react';

interface PropertyOverviewCardProps {
  property: any; // Replace with your property type if available
}

const PropertyOverviewCard: React.FC<PropertyOverviewCardProps> = ({
  property
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [ownerName, setOwnerName] = useState(property.agent);
  const [tempOwnerName, setTempOwnerName] = useState(property.agent);

  const inputRef = useRef<HTMLInputElement>(null);

  const equity =
    property.estimated_value && property.mortgage_balance
      ? property.estimated_value - property.mortgage_balance
      : 0;

  const equityPercentage = property.estimated_value
    ? (equity / property.estimated_value) * 100
    : 0;

  let equityStatus = 'Low';
  if (equityPercentage > 70) {
    equityStatus = 'High';
  } else if (equityPercentage > 40) {
    equityStatus = 'Medium';
  }

  const handleSave = () => {
    setOwnerName(tempOwnerName);
    setIsEditing(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        handleSave();
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <Card className="mt-10 dark:bg-gray-800 dark:text-white">
      <CardContent className="p-6 sm:p-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* Owner Name */}
          <div className="text-center lg:text-left">
            <h2 className="mb-2 font-semibold">Owner Name</h2>
            <div className="flex items-center justify-center space-x-2 lg:justify-start">
              {isEditing ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={tempOwnerName}
                  onChange={(e) => setTempOwnerName(e.target.value)}
                  maxLength={50}
                  onKeyDown={handleKeyDown}
                  className="w-full max-w-xs rounded border border-gray-300 p-1 dark:bg-gray-700 dark:text-white"
                />
              ) : (
                <span>{ownerName}</span>
              )}

              {!isEditing && (
                <Pencil
                  onClick={() => setIsEditing(true)}
                  className="h-4 w-4 cursor-pointer text-blue-500"
                />
              )}
            </div>
          </div>

          {/* Mortgages */}
          <div className="text-center lg:text-left">
            <h2 className="mb-2 font-semibold">
              Mortgages
              <span className="ml-2 rounded-full bg-gray-200 px-2 text-sm dark:bg-gray-700 dark:text-gray-300">
                0
              </span>
            </h2>
            <div>-</div>
          </div>

          {/* Equity */}
          <div className="text-center lg:text-left">
            <h2 className="mb-2 font-semibold">
              Equity <span className="text-sm text-gray-500">(est.)</span>
            </h2>
            <div className="flex items-center justify-center lg:justify-start">
              {property.estimated_value
                ? `$${equity.toLocaleString()} | ${equityPercentage.toFixed(
                    2
                  )}%`
                : 'N/A'}
              <span
                className={`ml-2 text-sm text-${
                  equityStatus === 'High'
                    ? 'green'
                    : equityStatus === 'Medium'
                    ? 'yellow'
                    : 'red'
                }-500`}
              >
                {equityStatus}
              </span>
            </div>
            <Progress
              value={equityPercentage}
              className="mt-2 h-2 rounded-full bg-blue-500"
            />
          </div>

          {/* Occupancy */}
          <div className="text-center lg:text-left">
            <h2 className="mb-2 font-semibold">Occupancy</h2>
            <div>Owner Occupied</div>
          </div>

          {/* Taxes */}
          <div className="text-center lg:text-left">
            <h2 className="mb-2 font-semibold">Taxes</h2>
            <div>
              $
              {property.hoa_fee
                ? `${property.hoa_fee.toLocaleString()}/mo`
                : 'N/A'}
            </div>
          </div>

          {/* Est. Value */}
          <div className="text-center lg:text-left">
            <h2 className="mb-2 font-semibold">Est. Value</h2>
            <div>
              $
              {property.estimated_value
                ? property.estimated_value.toLocaleString()
                : 'N/A'}
            </div>
          </div>

          {/* Last Sale */}
          <div className="text-center lg:text-left">
            <h2 className="mb-2 font-semibold">Last Sale</h2>
            <div>{property.last_sold_date || '-'}</div>
          </div>

          {/* MLS */}
          <div className="text-center lg:text-left">
            <h2 className="mb-2 font-semibold">MLS</h2>
            <div>{property.mls_id || 'Inactive'}</div>
          </div>

          {/* FMR */}
          <div className="text-center lg:text-left">
            <h2 className="mb-2 font-semibold">
              FMR <span className="text-sm text-gray-500">(HUD)</span>
            </h2>
            <div>$2,750.00/mo</div>
          </div>

          {/* Rent */}
          <div className="text-center lg:text-left">
            <h2 className="mb-2 font-semibold">
              Rent <span className="text-sm text-gray-500">(est.)</span>
            </h2>
            <div>$2,750.00/mo</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyOverviewCard;
