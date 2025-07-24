'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { X } from 'lucide-react';
import PropertyCard from './propertyCard';
import { PropertyDetails } from '@/types/_dashboard/maps';
import { Drawer, DrawerContent, DrawerClose } from '@/components/ui/drawer';
import { usePropertyStore } from '@/lib/stores/leadSearch/drawer'; // Zustand store import
import SkipTraceDialog from './utils/createListModal';
import { MockUserProfile } from '@/constants/_faker/profile/userProfile';
interface PropertyListProps {
  properties: PropertyDetails[];
}

const MIN_DRAWER_HEIGHT = 100; // Set a minimum height for the drawer to prevent it from being closed completely.
const cardLoadOptions = [12, 24, 48, 96]; // You can add more options if needed
const PropertyListView: React.FC<PropertyListProps> = ({ properties }) => {
  const {
    isDrawerOpen,
    setIsDrawerOpen,
    drawerHeight,
    setDrawerHeight,
    visibleProperties,
    progressValue,
    listSizeLabel,
    hasMore,
    isLoading,
    loadMoreProperties
  } = usePropertyStore();

  // State to manage the max cards per load
  const [maxCardsPerLoad, setMaxCardsPerLoad] = useState(6); // Default to 6 cards per load

  // Start resizing the drawer
  const startResizing = (event: React.MouseEvent) => {
    event.preventDefault();
    window.addEventListener('mousemove', resizeDrawer);
    window.addEventListener('mouseup', stopResizing);
  };

  // Resize the drawer's height
  const resizeDrawer = (event: globalThis.MouseEvent) => {
    const newHeight = window.innerHeight - event.clientY;
    if (newHeight >= MIN_DRAWER_HEIGHT && newHeight <= window.innerHeight) {
      setDrawerHeight(newHeight); // Update drawer height using Zustand
    }
  };

  // Stop resizing
  const stopResizing = () => {
    window.removeEventListener('mousemove', resizeDrawer);
    window.removeEventListener('mouseup', stopResizing);
  };

  // Handle dropdown change for max cards per load
  const handleMaxCardsChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setMaxCardsPerLoad(parseInt(event.target.value));
  };

  // Don't render anything if there are not enough properties
  if (properties.length <= 1) {
    return null;
  }

  return (
    <div
      style={{ position: 'absolute', right: 0, width: '400px', height: '100%' }}
    >
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="p-0" style={{ maxHeight: drawerHeight }}>
          {/* Drawer header and resize bar */}
          <div
            className="flex cursor-ns-resize items-center justify-between bg-secondary p-4"
            onMouseDown={startResizing}
          >
            <h2 className="text-lg font-semibold">
              {properties.length} Properties Fetched
            </h2>
            <DrawerClose asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDrawerOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>

          {/* Drawer content */}
          <CardContent
            className="overflow-auto"
            style={{ height: drawerHeight - 60 }}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  List Size ({listSizeLabel})
                </h3>
                <div className="flex items-center space-x-4">
                  <span>Specific</span>
                  <Progress value={progressValue} className="flex-1" />
                  <span>Broad</span>
                </div>
                <p>Your list size is defined by your search and filters.</p>
                {progressValue === 75 && (
                  <p className="font-semibold text-red-600">
                    Your list is too broad.
                  </p>
                )}

                {/* Replace "Create List" button with the SkipTraceDialog */}
                <div className="flex justify-center">
                  <SkipTraceDialog
                    properties={properties}
                    availableListNames={MockUserProfile.companyInfo.leadLists.map(
                      (list) => list.listName
                    )} // Extract and pass available list names
                    costPerRecord={0.1} // Example cost per record, you can change as needed
                  />
                </div>
              </div>

              {/* Property List */}
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {visibleProperties.map((property, index) => (
                  <div key={index} className="p-4">
                    <PropertyCard property={property} />
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              <div className="flex justify-center py-4">
                <Button
                  onClick={() => loadMoreProperties(maxCardsPerLoad)} // Pass the selected maxCardsPerLoad value
                  disabled={!hasMore || isLoading} // Disable when loading or no more properties
                >
                  {isLoading ? 'Loading...' : 'Load More Properties'}
                </Button>
              </div>

              {/* Dropdown for Max Cards per Load */}
              <div className="flex justify-center py-4">
                <label htmlFor="maxCardsDropdown" className="mr-2">
                  Max Cards per Load:
                </label>
                <select
                  id="maxCardsDropdown"
                  value={maxCardsPerLoad}
                  onChange={handleMaxCardsChange}
                  className="rounded border px-2 py-1"
                >
                  {cardLoadOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default PropertyListView;
