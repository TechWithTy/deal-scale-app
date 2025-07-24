'use client';

import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
// Define the type for each tab
type TabData = {
  value: string;
  label: string;
  content: React.ReactNode; // The content can be any valid JSX
};

// Define the props for the PropertyTabsList component
interface PropertyTabsListProps {
  tabsData: TabData[]; // Array of TabData
}

// DesktopTabs component
const DesktopTabs: React.FC<PropertyTabsListProps> = ({ tabsData }) => {
  const [visibleIndex, setVisibleIndex] = useState(0); // Manage the starting index of visible tabs
  const itemsPerPage = 3; // Number of tabs visible at a time on desktop

  const tabsRef = useRef<HTMLDivElement | null>(null); // Ref to the tab container

  // Move the tabs left by 3 (or fewer if near the start)
  const handlePrev = () => {
    setVisibleIndex((prev) => Math.max(prev - itemsPerPage, 0));
  };

  // Move the tabs right by 3 (or fewer if near the end)
  const handleNext = () => {
    setVisibleIndex((prev) =>
      Math.min(prev + itemsPerPage, tabsData.length - itemsPerPage)
    );
  };

  // Get the visible tabs to display
  const visibleTabs = tabsData.slice(visibleIndex, visibleIndex + itemsPerPage);

  const scrollToTab = (tabIndex: number) => {
    const tabElement = tabsRef.current?.children[tabIndex] as
      | HTMLElement
      | undefined;
    if (tabElement) {
      tabElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  };

  useEffect(() => {
    scrollToTab(visibleIndex);
  }, [visibleIndex]);

  return (
    <Tabs defaultValue={tabsData[0]?.value || ''} className="mt-6">
      {/* Tab navigation arrows */}
      <div className="flex items-center justify-between">
        {/* Left arrow */}
        <button
          onClick={handlePrev}
          disabled={visibleIndex === 0} // Disable if we're at the start
          className="rounded bg-gray-200 p-2 hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          ←
        </button>

        {/* Scrollable Tab List */}
        <TabsList
          className="relative mx-2 flex w-full justify-center space-x-2 overflow-x-auto overflow-y-hidden rounded-lg bg-transparent px-2 py-2 sm:mx-4 sm:px-4"
          ref={tabsRef} // Attach ref to track the tab container
        >
          <div className="flex space-x-4">
            {/* Map over the visible tabs only (3 tabs at a time) */}
            {visibleTabs.map((tab, index) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                onClick={() => scrollToTab(visibleIndex + index)} // Scroll into view when clicked
                className="min-w-[60px] flex-shrink-0 rounded-lg bg-gray-100 px-2 text-center text-black hover:bg-gray-200 sm:min-w-[100px] sm:px-4 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </div>
        </TabsList>

        {/* Right arrow */}
        <button
          onClick={handleNext}
          disabled={visibleIndex >= tabsData.length - itemsPerPage} // Disable if we're at the end
          className="rounded bg-gray-200 p-2 hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          →
        </button>
      </div>

      {/* Render the content for each tab */}
      {tabsData.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};

// MobileTabs component

const MobileAccordion: React.FC<PropertyTabsListProps> = ({ tabsData }) => {
  return (
    <Accordion type="single" collapsible className="mt-6 w-full">
      {tabsData.map((tab, index) => (
        <AccordionItem key={index} value={tab.value}>
          <AccordionTrigger>{tab.label}</AccordionTrigger>
          <AccordionContent>
            <div className="p-4">{tab.content}</div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

// Main component to conditionally render Mobile or Desktop tabs
const PropertyTabsList: React.FC<PropertyTabsListProps> = ({ tabsData }) => {
  return (
    <>
      {/* Render the DesktopTabs component on larger screens */}
      <div className="hidden sm:block">
        <DesktopTabs tabsData={tabsData} />
      </div>

      {/* Render the MobileTabs component on smaller screens */}
      <div className="block sm:hidden">
        <MobileAccordion tabsData={tabsData} />
      </div>
    </>
  );
};

export default PropertyTabsList;
