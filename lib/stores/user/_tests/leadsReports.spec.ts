import { test, expect } from '@playwright/test';
import { useUserLeadsReportsStore } from '../userProfile';

test('Leads reports dnc and status summaries exist', () => {
  const s = useUserLeadsReportsStore.getState();

  const dnc = s.dncSummary();
  expect(dnc).toHaveProperty('totalDNC');
  expect(dnc).toHaveProperty('byFlag');
  expect(dnc).toHaveProperty('bySource');

  const statuses = s.statusCounts();
  expect(typeof statuses).toBe('object');
});
