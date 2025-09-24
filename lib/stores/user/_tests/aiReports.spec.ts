import { test, expect } from 'vitest';
import { useAIReportsStore } from '../userProfile';

test('AI reports provide DM, Social, and Kanban summaries', () => {
  const s = useAIReportsStore.getState();

  const dm = s.directMailSummary();
  expect(dm).toHaveProperty('sent');
  expect(dm).toHaveProperty('delivered');
  expect(dm).toHaveProperty('failed');

  const social = s.socialSummary();
  expect(social).toHaveProperty('totalCampaigns');
  expect(social).toHaveProperty('totalActions');

  const kanban = s.kanbanSummary();
  expect(kanban).toHaveProperty('totalTasks');
});
