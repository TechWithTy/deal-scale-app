import { TextMessage } from '@/types/goHighLevel/text';
import { faker } from '@faker-js/faker';
import { APP_TESTING_MODE } from '../../data';

// Generate a single sample TextMessage
export const generateSampleTextMessage = (): TextMessage => {
  return {
    id: faker.string.uuid(),
    type: faker.number.int({ min: 1, max: 3 }), // 1 for SMS, 3 for EMAIL
    messageType: faker.helpers.arrayElement(['TYPE_SMS', 'TYPE_EMAIL']),
    locationId: faker.string.uuid(),
    contactId: faker.string.uuid(),
    conversationId: faker.string.uuid(),
    dateAdded: faker.date.past().toISOString(),
    body: faker.lorem.sentence(),
    direction: faker.helpers.arrayElement(['inbound', 'outbound']),
    status: faker.helpers.arrayElement([
      'pending',
      'scheduled',
      'sent',
      'delivered',
      'read',
      'undelivered',
      'connected',
      'failed',
      'opened'
    ]),
    contentType: 'text/plain',
    attachments: faker.datatype.boolean() ? [faker.internet.url()] : [], // Randomly generate attachments
    meta: {
      email: {
        messageIds: [faker.string.uuid()]
      }
    },
    source: faker.helpers.arrayElement([
      'workflow',
      'bulk_actions',
      'campaign',
      'api',
      'app'
    ]),
    userId: faker.datatype.boolean() ? faker.string.uuid() : undefined
  };
};

export const generateSampleTextMessages = (count = 100): TextMessage[] => {
  return Array.from({ length: count }, generateSampleTextMessage);
};

export const mockTexts = APP_TESTING_MODE && generateSampleTextMessages();
