'use client';
import { Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import StatCard from './statCard';
import { useCampaignStore } from '@/lib/stores/campaigns'; // Import the Zustand store
import {
  SocialMediaCampaign,
  CallCampaign,
  Stat
} from '@/types/_dashboard/campaign'; // Types for campaigns

import { EmailCampaign } from '@/types/goHighLevel/email';
import { GHLTextMessageCampaign } from '@/types/goHighLevel/text';

import {
  mockUserProfile,
  MockUserProfile
} from '@/constants/_faker/profile/userProfile';

import { HelpCircle } from 'lucide-react';
import PropertySearchModal from '@/components/reusables/tutorials/walkthroughModal';
import { campaignSteps } from '@/_tests/tours/campaignTour';
import { Heading } from '@/components/ui/heading';
const creditsRemaining =
  mockUserProfile.subscription.aiCredits.allotted -
  mockUserProfile.subscription.aiCredits.used;

const CampaignHeader: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0); // Track the currently animated card
  const [animationComplete, setAnimationComplete] = useState(false); // Track if the animation is completed
  const [activeFilter, setActiveFilter] = useState('all'); // Track the active filter
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  // Zustand's setCampaignType and filterCampaignsByStatus functions
  const [isTourOpen, setIsTourOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleStartTour = () => setIsTourOpen(true);
  const handleCloseTour = () => setIsTourOpen(false);

  const setCampaignType = useCampaignStore((state) => state.setCampaignType);
  const filterCampaignsByStatus = useCampaignStore(
    (state) => state.filterCampaignsByStatus
  );
  // const filteredCampaigns = useCampaignStore(
  //   (state) => state.filteredCampaigns
  // ); // Filtered campaigns after applying the filter

  // Function to handle filter clicks
  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    filterCampaignsByStatus(
      filter as 'all' | 'scheduled' | 'active' | 'completed'
    );
  };

  // Function to handle card click and trigger campaign type change
  const handleCardClick = (statType: string) => {
    switch (statType) {
      case 'email':
        setCampaignType('email');
        break;
      case 'call':
        setCampaignType('call');
        break;
      case 'text':
        setCampaignType('text');
        break;
      case 'dm': // For social media campaigns
        setCampaignType('social');
        break;
      default:
        break;
    }
  };

  // Example past 24-hour data
  const past24HoursData = {
    totalConversations: 150,
    totalDMs: 120,
    totalTextCampaigns: 100,
    totalEmailCampaigns: 80,
    totalCalls: 70
  };

  // Assume you have these arrays from your campaign data
  const socialCampaigns: SocialMediaCampaign[] =
    MockUserProfile.companyInfo.campaigns.socialCampaigns; // Replace with actual data
  const textCampaigns: GHLTextMessageCampaign[] =
    MockUserProfile.companyInfo.campaigns.textCampaigns; // Replace with actual data
  const emailCampaigns: EmailCampaign[] =
    MockUserProfile.companyInfo.campaigns.emailCampaigns; // Replace with actual data
  const callCampaigns: CallCampaign[] =
    MockUserProfile.companyInfo.campaigns.callCampaigns; // Replace with actual data

  // Calculate total campaigns, conversations, and actions
  const totalSocialCampaigns = socialCampaigns.length;
  const totalTextCampaigns = textCampaigns.length;
  const totalEmailCampaigns = emailCampaigns.length;
  const totalCallCampaigns = callCampaigns.length;

  // Calculate total conversations (sum of texts and emails)
  const totalTextMessages = textCampaigns.reduce(
    (sum, campaign) => sum + campaign.totalMessages,
    0
  );
  const totalEmailMessages = emailCampaigns.reduce(
    (sum, campaign) => sum + campaign.emails.length,
    0
  );
  const totalConversations = totalTextMessages + totalEmailMessages;

  // Calculate total campaigns across all types
  const totalCampaigns =
    totalSocialCampaigns +
    totalTextCampaigns +
    totalEmailCampaigns +
    totalCallCampaigns;

  // Calculate total calls (inbound + outbound)
  // const totalCalls = callCampaigns.reduce(
  //   (sum, campaign) => sum + campaign.calls,
  //   0
  // );

  // Aggregate other campaign data as needed (e.g., DMs)
  const totalDMs = socialCampaigns.reduce(
    (sum, campaign) => sum + campaign.actions.length,
    0
  );

  const campaignFilters = [
    { label: 'All Campaigns', value: 'all', color: 'bg-gray-500' },
    {
      label: 'Scheduled Campaigns',
      value: 'scheduled',
      color: 'bg-yellow-500'
    },
    { label: 'Active Campaigns', value: 'active', color: 'bg-green-500' },
    { label: 'Completed Campaigns', value: 'completed', color: 'bg-blue-500' }
  ];

  // Now define your `stats` array
  const stats: Stat[] = [
    {
      title: 'Total Campaigns',
      value: totalCampaigns,
      statType: 'total',
      colSpan: 2,
      click: false
    },
    {
      title: 'Total Conversations',
      value: totalConversations,
      statType: 'conversations',
      click: false,
      past24hours: past24HoursData.totalConversations // Example value for conversations in the past 24 hours
    },
    {
      title: 'Total Call Campaigns',
      value: totalCallCampaigns,
      statType: 'call',
      click: true,
      past24hours: past24HoursData.totalCalls // Example value for call campaigns in the past 24 hours
    },
    {
      title: 'Total Email Campaigns',
      value: totalEmailCampaigns,
      statType: 'email',
      click: true,
      past24hours: past24HoursData.totalEmailCampaigns // Example value for email campaigns in the past 24 hours
    },
    {
      title: 'Total Text Campaigns',
      value: totalTextCampaigns,
      statType: 'text',
      colSpan: 2,
      click: true,
      past24hours: past24HoursData.totalTextCampaigns // Example value for text campaigns in the past 24 hours
    },

    {
      title: 'Total Social Campaigns',
      value: totalDMs,
      statType: 'dm',
      click: true,
      past24hours: past24HoursData.totalDMs // Example value for DMs in the past 24 hours
    }
  ];

  useEffect(() => {
    // Check if the animation has already been completed from localStorage
    const isAnimationComplete =
      localStorage.getItem('animationComplete') === 'true';

    // If animation is already complete, no need to run the effect
    if (isAnimationComplete) {
      setAnimationComplete(true); // Skip the animation
      return;
    }

    let currentIndex = 2; // Start from the third card (skip the first two)

    const interval = setInterval(() => {
      // Update active index
      setActiveIndex(currentIndex);

      // Stop the loop after reaching the last card
      if (currentIndex === stats.length - 1) {
        clearInterval(interval);

        // Let the last card animate for 3 more seconds
        setTimeout(() => {
          setAnimationComplete(true); // Mark animation as complete

          // Store the completion state in localStorage
          localStorage.setItem('animationComplete', 'true');
        }, 3000); // Keep the last card animated for 3 seconds
      } else {
        currentIndex++; // Increment index for the next card
      }
    }, 3000); // Switch active card every 3 seconds

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [stats.length]);

  return (
    <div className="p-4 dark:bg-gray-900">
      <div className="text-center">
        <Heading
          title={`Campaigns `}
          description="View and segment your campaigns."
        />

        {/* Credits Remaining Text and Help Button */}
        <div className="my-4 flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 ">
          {/* Credits Remaining */}
          <div className="text-lg font-semibold text-gray-900 dark:text-white ">
            Credits Remaining: {creditsRemaining}
          </div>

          {/* Help Button (moves to new line on mobile) */}
          <button
            onClick={handleOpenModal}
            title="Get More help"
            className="animate-bounce rounded-full bg-blue-500 p-2 text-white hover:animate-none dark:bg-green-700 dark:text-gray-300"
          >
            <HelpCircle size={20} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-500 dark:text-gray-400" />
        <input
          type="text"
          placeholder="Search"
          className="w-full rounded-md border px-4 py-2 pl-10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* Campaign Filter Buttons */}
      <div className="mb-4 flex w-full flex-wrap gap-2 sm:gap-4">
        {' '}
        {/* Use flex-wrap to allow wrapping */}
        {campaignFilters.map((filter) => {
          const isActive = activeFilter === filter.value;
          return (
            <button
              key={filter.label}
              onClick={() => handleFilterClick(filter.value)} // filter.value now exists
              className={`flex w-full items-center justify-center rounded-md px-4 py-2 sm:w-1/4 ${
                isActive
                  ? 'bg-gray-200 dark:bg-gray-700'
                  : 'bg-gray-100 dark:bg-gray-800'
              } dark:text-white`}
            >
              <span className={`h-2 w-2 rounded-full ${filter.color}`}></span>
              <span className="ml-2 text-xs sm:text-sm">
                {filter.label}
              </span>{' '}
              {/* Adjust text size for mobile */}
            </button>
          );
        })}
      </div>

      {/* Statistics Grid */}
      <div className="flex gap-4 overflow-x-auto md:grid md:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={stat.title}
            className={`min-w-[250px] md:min-w-0 ${
              index < 2 ? 'md:col-span-2' : ''
            }`} // Ensure minimum width for mobile/tablet
          >
            <StatCard
              title={stat.title}
              addedToday={stat.past24hours}
              value={stat.value}
              onClick={() => handleCardClick(stat.statType)} // Handle card clicks
              isActive={index === activeIndex} // Highlight active card
              click={stat.click} // Control card clickability
              animationComplete={animationComplete} // Handle animation completion
            />
          </div>
        ))}
      </div>

      <PropertySearchModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        videoUrl="https://www.youtube.com/embed/example-video" // Example YouTube video URL
        title="Welcome To Your Campaigns"
        subtitle="Get help viewing and sorting through your campaigns."
        // Add the following props to enable the tour
        steps={campaignSteps} // Tour steps (array of objects with content and selectors)
        isTourOpen={isTourOpen} // Boolean to track if the tour is currently open
        onStartTour={handleStartTour} // Function to start the tour (triggered by button)
        onCloseTour={handleCloseTour} // Function to close the tour
      />
    </div>
  );
};

export default CampaignHeader;
