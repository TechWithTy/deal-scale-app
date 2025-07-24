import {
  SocialMediaCampaign,
  campaignStatusesGB
} from '@/types/_dashboard/campaign';
import { faker } from '@faker-js/faker';
import { generateRandomAction } from './social';
import { APP_TESTING_MODE } from '@/constants/data';

export const generateSampleSocialMediaCampaign = (
  platform: 'Twitter' | 'LinkedIn' | 'Instagram'
): SocialMediaCampaign => {
  const actionsCount = faker.number.int({ min: 5, max: 15 });

  return {
    id: faker.string.uuid(),
    platform: platform,
    name: faker.company.name(),
    status: faker.helpers.arrayElement(campaignStatusesGB),
    createdAt: faker.date.past().toISOString(),
    startDate: faker.date.past().toISOString(),
    endDate: faker.date.future().toISOString(),
    senderHandle: faker.internet.userName(),
    receiverHandle: faker.internet.userName(),
    hashtags: faker.lorem
      .words(3)
      .split(' ')
      .map((word) => `#${word}`),

    actions: Array.from({ length: actionsCount }, () => generateRandomAction())
  };
};

// Generate an array of sample social media campaigns
export const generateSampleSocialMediaCampaigns = (
  count = 100
): SocialMediaCampaign[] => {
  const platforms: Array<'Twitter' | 'LinkedIn' | 'Instagram'> = [
    'Twitter',
    'LinkedIn',
    'Instagram'
  ];
  return Array.from({ length: count }, () => {
    const randomPlatform = faker.helpers.arrayElement(platforms);
    return generateSampleSocialMediaCampaign(randomPlatform);
  });
};

export const mockSocialMediaCampaigns =
  APP_TESTING_MODE && generateSampleSocialMediaCampaigns();
