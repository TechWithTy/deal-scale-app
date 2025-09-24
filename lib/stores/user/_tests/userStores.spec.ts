import { test, expect } from '@playwright/test';
import { UserStores } from '../userProfile';

test('UserStores grouped export exposes expected namespaces', () => {
  expect(UserStores).toHaveProperty('profile');
  expect(UserStores).toHaveProperty('session');
  expect(UserStores).toHaveProperty('ai');
  expect(UserStores).toHaveProperty('campaigns');
  expect(UserStores).toHaveProperty('leads');
  expect(UserStores).toHaveProperty('skipTrace');
  expect(UserStores).toHaveProperty('company');
  expect(UserStores).toHaveProperty('credits');
  expect(UserStores).toHaveProperty('permissions');
});
