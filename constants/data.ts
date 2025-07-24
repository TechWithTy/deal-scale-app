import { NavItem } from '@/types';
import { LeadTypeGlobal } from '@/types/_dashboard/leads';
import { faker } from '@faker-js/faker';
export const APP_TESTING_MODE = true;

// Function to generate mock leads
// Function to generate mock leads

export function generateMockLeads(count: number): LeadTypeGlobal[] {
  const leads: LeadTypeGlobal[] = [];

  for (let i = 0; i < count; i++) {
    const lead: LeadTypeGlobal = {
      id: i + 1,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.number(), // Generate North American style phone number
      summary: faker.lorem.sentence(), // Random summary
      bed: faker.number.int({ min: 1, max: 5 }), // Random number of bedrooms (1-5)
      bath: faker.number.int({ min: 1, max: 4 }), // Random number of bathrooms (1-4)
      sqft: faker.number.int({ min: 500, max: 5000 }), // Random square footage (500-5000 sqft)
      status: faker.helpers.arrayElement([
        'New Lead',
        'Contacted',
        'Closed',
        'Lost'
      ]), // Random lead status
      followUp:
        faker.helpers.maybe(
          () => faker.date.future().toISOString().split('T')[0],
          { probability: 0.5 }
        ) || null, // Ensure null if undefined
      lastUpdate: faker.date.recent().toISOString().split('T')[0], // Recent date as last update
      address1: faker.location.streetAddress(), // Random street address
      campaignID:
        faker.helpers.maybe(() => faker.string.uuid(), { probability: 0.8 }) ||
        undefined, // Ensure null if undefined
      socials: {
        facebook: faker.internet.url(), // Random Facebook link
        linkedin: faker.internet.url(), // Random LinkedIn link
        instagram: faker.internet.url(), // Random Instagram link
        twitter: faker.internet.url() // Random Twitter link
      }
    };

    leads.push(lead);
  }

  return leads;
}
export const mockGeneratedLeads = APP_TESTING_MODE && generateMockLeads(100);

export const staticMockLeadData: LeadTypeGlobal[] = [
  {
    id: 1,
    firstName: 'Candice',
    lastName: 'Schiner',
    phone: '(555) 123-4567',
    email: 'testemail@gmail.com',
    summary: 'Discussed details about the 4-bedroom property.',
    bed: 4,
    bath: 3,
    sqft: 3200,
    status: 'New Lead',
    followUp: '2023-09-12',
    lastUpdate: '2023-09-10',
    address1: '123 Main St, Springfield, IL'
  },
  {
    id: 2,
    firstName: 'John',
    lastName: 'Doe',
    phone: '(555) 234-5678',
    email: 'testemail@gmail.com',

    summary: 'Interested in selling their 2-bedroom condo.',
    bed: 2,
    bath: 2,
    sqft: 1200,
    status: 'Contacted',
    followUp: '2023-09-15',
    lastUpdate: '2023-09-11',
    address1: '456 Oak St, Chicago, IL'
  },
  {
    id: 3,
    firstName: 'Alice',
    lastName: 'Johnson',
    phone: '(555) 345-6789',
    email: 'testemail@gmail.com',

    summary: 'Looking to buy a 3-bedroom house.',
    bed: 3,
    bath: 2,
    sqft: 1800,
    status: 'New Lead',
    followUp: null,
    lastUpdate: '2023-09-09',
    address1: '789 Maple Ave, Austin, TX'
  },
  {
    id: 4,
    firstName: 'David',
    lastName: 'Smith',
    phone: '(555) 456-7890',
    email: 'testemail@gmail.com',

    summary: 'Asked for more details about the 5-bedroom house.',
    bed: 5,
    bath: 4,
    sqft: 4000,
    status: 'Closed',
    followUp: null,
    lastUpdate: '2023-09-08',
    address1: '321 Birch St, Seattle, WA'
  },
  {
    id: 5,
    firstName: 'Emma',
    lastName: 'Wilson',
    phone: '(555) 567-8901',
    email: 'testemail@gmail.com',

    summary: 'Inquired about investment opportunities in the area.',
    bed: 2,
    bath: 2,
    sqft: 1500,
    status: 'Lost',
    followUp: '2023-09-20',
    lastUpdate: '2023-09-07',
    address1: '654 Cedar Rd, Denver, CO'
  },
  {
    id: 6,
    firstName: 'James',
    lastName: 'Brown',
    phone: '(555) 678-9012',
    email: 'testemail@gmail.com',

    summary: 'Considering selling their 4-bedroom home.',
    bed: 4,
    bath: 3,
    sqft: 2500,
    status: 'Contacted',
    followUp: '2023-09-18',
    lastUpdate: '2023-09-06',
    address1: '987 Pine St, Boston, MA'
  },
  {
    id: 7,
    firstName: 'Laura',
    lastName: 'White',
    phone: '(555) 789-0123',
    email: 'testemail@gmail.com',

    summary: 'Looking for a vacation property.',
    bed: 3,
    bath: 2,
    sqft: 2000,
    status: 'New Lead',
    followUp: '2023-09-22',
    lastUpdate: '2023-09-05',
    address1: '543 Oakwood Ln, Miami, FL'
  },
  {
    id: 8,
    firstName: 'Michael',
    lastName: 'Lee',
    phone: '(555) 890-1234',
    email: 'testemail@gmail.com',

    summary: 'Interested in buying a multi-family unit.',
    bed: 6,
    bath: 5,
    sqft: 5000,
    status: 'Closed',
    followUp: null,
    lastUpdate: '2023-09-04',
    address1: '111 Redwood St, San Francisco, CA'
  },
  {
    id: 9,
    firstName: 'Olivia',
    lastName: 'Green',
    phone: '(555) 901-2345',
    email: 'testemail@gmail.com',

    summary: 'Looking for a property to rent out.',
    bed: 2,
    bath: 1,
    sqft: 1000,
    status: 'Lost',
    followUp: null,
    lastUpdate: '2023-09-03',
    address1: '222 Walnut St, Portland, OR'
  },
  {
    id: 10,
    firstName: 'Robert',
    lastName: 'Taylor',
    phone: '(555) 012-3456',
    email: 'testemail@gmail.com',

    summary: 'Asked for information on 3-bedroom homes in the area.',
    bed: 3,
    bath: 2,
    sqft: 1900,
    status: 'Contacted',
    followUp: '2023-09-19',
    lastUpdate: '2023-09-02',
    address1: '333 Willow Ave, New York, NY'
  }
];

export type Employee = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  date_of_birth: string; // Consider using a proper date type if possible
  street: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  longitude?: number; // Optional field
  latitude?: number; // Optional field
  job: string;
  profile_picture?: string | null; // Profile picture can be a string (URL) or null (if no picture)
};

export const navItems: NavItem[] = [
  {
    title: 'Property Search',
    href: '/dashboard',
    icon: 'search',
    label: 'searchProperties'
  },
  {
    title: 'Campaign Manager',
    href: '/dashboard/campaigns',
    icon: 'campaigns',
    label: 'campaigns'
  },
  {
    title: 'Leads',
    href: '/dashboard/lead',
    icon: 'user',
    label: 'leads'
  },
  {
    title: 'Lead Lists',
    href: '/dashboard/leadList',
    icon: 'scribe',
    label: 'lead-lists'
  },
  {
    title: 'Kanban',
    href: '/dashboard/kanban',
    icon: 'kanban',
    label: 'kanban'
  },

  {
    title: 'Employee',
    href: '/dashboard/employee',
    icon: 'employee',
    label: 'employee'
  },
  {
    title: 'Logout',
    href: '/',
    icon: 'logout',
    label: 'logout'
  }
];
