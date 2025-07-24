'use client';
import React from 'react';
import CampaignHeader from './utils/campaignHeader';
import CampaignsMainContent from './utils/campaignTable';

const CampaignPage: React.FC = () => {
  return (
    <div className="p-8  dark:bg-gray-900">
      <CampaignHeader />
      <CampaignsMainContent />
    </div>
  );
};

export default CampaignPage;
