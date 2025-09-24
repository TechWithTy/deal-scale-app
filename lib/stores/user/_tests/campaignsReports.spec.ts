import { test, expect } from 'vitest';
import { useUserCampaignReportsStore } from '../userProfile';

test('Campaign reports summaries are accessible', () => {
  const s = useUserCampaignReportsStore.getState();

  const channels = s.channelTotals();
  expect(channels).toHaveProperty('text');
  expect(channels).toHaveProperty('dm');
  expect(channels).toHaveProperty('call');
  expect(channels).toHaveProperty('social');

  const status = s.statusCounts();
  expect(typeof status).toBe('object');

  const transfers = s.transferBreakdown();
  expect(typeof transfers).toBe('object');
});
