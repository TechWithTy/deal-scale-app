import { LeadLocationPhone, PropertyDetails } from '@/types/_dashboard/maps';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import { APP_TESTING_MODE } from '../data';
// Helper function to generate random phone numbers

// Helper function to generate random phone numbers
// Generate random phone numbers with extensions
const generatePhones = (): LeadLocationPhone[] => {
  return [
    {
      ext:
        faker.helpers.maybe(() => faker.string.numeric(4), {
          probability: 0.5
        }) ?? null, // Ensures `null` instead of `undefined`
      number: faker.phone.number(), // Generates a random phone number
      primary: true,
      type: faker.helpers.arrayElement(['Office', 'Mobile', 'Home', 'Fax']) // Randomly choose one of the types
    },
    {
      ext:
        faker.helpers.maybe(() => faker.string.numeric(4), {
          probability: 0.5
        }) ?? null, // Ensures `null` instead of `undefined`
      number: faker.phone.number(),
      primary: false,
      type: faker.helpers.arrayElement(['Office', 'Mobile', 'Home', 'Fax'])
    }
  ];
};
// Helper function to generate property details
export const generateFakeProperty = (): PropertyDetails => {
  const lat = faker.location.latitude();
  const lng = faker.location.longitude();

  return {
    id: faker.string.uuid(),
    agent: faker.person.fullName(),
    agent_email: faker.internet.email(),
    agent_phones: generatePhones(),
    alt_photos: faker.image.url(),
    assessed_value: faker.number.float({
      min: 100000,
      max: 1000000,
      fractionDigits: 0
    }), // Generates integer values
    beds: faker.number.int({ min: 1, max: 6 }),
    broker: faker.company.name() ?? null,
    broker_phone: faker.phone.number() ?? null,
    broker_website: faker.internet.url() ?? null,
    city: faker.location.city(),
    county: faker.location.county(),
    days_on_mls: faker.number.int({ min: 1, max: 365 }),
    estimated_value: faker.number.float({
      min: 200000,
      max: 2000000,
      fractionDigits: 0
    }), // Generates integer values
    fips_code: faker.string.numeric(5),
    full_baths: faker.number.int({ min: 1, max: 3 }),
    full_street_line: faker.location.streetAddress(),
    half_baths: faker.number.int({ min: 0, max: 2 }),
    hoa_fee: faker.number.float({ min: 50, max: 500, fractionDigits: 2 }), // Generates float values with two decimal places
    last_sold_date: faker.date.past().toISOString(),
    latitude: Number(lat),
    list_date: faker.date.past().toISOString(),
    list_price: faker.number.int({ min: 100000, max: 2000000 }),
    longitude: Number(lng),
    lot_sqft: faker.number.int({ min: 1000, max: 10000 }),
    mls: faker.string.uuid(),
    mls_id: faker.string.uuid(),
    nearby_schools: faker.company.name(),
    neighborhoods: faker.location.city(),
    parking_garage: faker.number.int({ min: 0, max: 3 }),
    price_per_sqft: faker.number.float({
      min: 50,
      max: 500,
      fractionDigits: 2
    }), // Generates float values with two decimal places
    primary_photo: faker.image.url(),
    property_url: faker.internet.url(),
    sold_price: faker.number.int({ min: 100000, max: 2000000 }),
    sqft: faker.number.int({ min: 500, max: 5000 }),
    state: faker.location.state(),
    status: faker.helpers.arrayElement(['active', 'sold', 'pending']),
    stories: faker.number.int({ min: 1, max: 3 }),
    street: faker.location.street(),
    style: faker.helpers.arrayElement([
      'Modern',
      'Victorian',
      'Colonial',
      'Contemporary'
    ]),
    text: faker.lorem.sentence(),
    unit:
      faker.helpers.maybe(() => faker.string.alpha(3), { probability: 0.3 }) ??
      null,
    year_built: faker.number.int({ min: 1900, max: 2023 }),
    zip_code: faker.location.zipCode(),
    mortgage_balance: faker.helpers.maybe(
      () => faker.number.int({ min: 10000, max: 1000000 }),
      { probability: 0.5 }
    )
  };
};

// Generate a list of fake properties
export const generateFakeProperties = (count: number): PropertyDetails[] => {
  return Array.from({ length: count }, generateFakeProperty);
};

export const MockInHouseLeadAgrigator =
  APP_TESTING_MODE && generateFakeProperties(100);
export let detailed_properties_saved: PropertyDetails[] = [
  {
    agent: 'Sharon Rojo',
    agent_email: 'sandiegoteam.sharon@gmail.com',
    agent_phones: [
      { ext: '', number: '7602303610', primary: true, type: 'Office' }
    ],
    alt_photos:
      'http://ap.rdcpix.com/e3d5a7b443477ffae43fd368523d3fffl-m1016903215od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/e3d5a7b443477ffae43fd368523d3fffl-m3783361004od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/e3d5a7b443477ffae43fd368523d3fffl-m360826070od-w480_h360_x2.webp?w=1080&q=75',
    assessed_value: 383677,
    beds: 2,
    broker: null,
    broker_phone: null,
    broker_website: null,
    city: 'San Diego',
    county: 'San Diego',
    days_on_mls: 21,
    estimated_value: 570100,
    fips_code: '06073',
    full_baths: 2,
    full_street_line: '10186 Camino Ruiz Unit 72',
    half_baths: null,
    hoa_fee: 345,
    last_sold_date: '2024-08-27',
    latitude: 32.902329,
    list_date: '2024-08-06',
    list_price: 525000,
    longitude: -117.145381,
    lot_sqft: 205577,
    mls: 'MRCA',
    mls_id: 'NDP2406979',
    nearby_schools: 'San Diego Unified School District',
    neighborhoods: 'North San Diego, Mira Mesa',
    parking_garage: null,
    price_per_sqft: 662,
    primary_photo:
      'http://ap.rdcpix.com/e3d5a7b443477ffae43fd368523d3fffl-m1016903215od-w480_h360_x2.webp?w=1080&q=75',
    property_url:
      'https://www.realtor.com/realestateandhomes-detail/1870664671',
    sold_price: 535000,
    sqft: 808,
    state: 'CA',
    status: 'SOLD',
    stories: 1,
    street: '10186 Camino Ruiz',
    style: 'CONDOS',
    text: 'Take Advantage of the very recent interest rate drop and THE MOST AFFORDABLE 2/2 in 92126 - Priced to sell! Discover the perfect blend of comfort and convenience in this centrally located, FHA and VA approved, inviting 2-bedroom, 2-bath home! With 808 square feet of well-designed living space, this home offers two primary suites, stainless steel appliances and patio space with personal washer and dryer! Ideal for those seeking a cozy and functional layout. Enjoy easy access to a variety of amenities in the surrounding area, including shopping, dining, and entertainment! Low HOA - The community offers a range of fantastic features for residents, including a refreshing pool, a relaxing hot tub, and a fully-equipped gym to maintain your fitness routine. This home is not just a place to live but a lifestyle choice that combines modern amenities with a vibrant neighborhood.',
    unit: 'Unit 72',
    year_built: 1990,
    zip_code: '92126'
  },
  {
    agent: 'Hope Holmberg',
    agent_email: 'hopeshomessd@gmail.com',
    agent_phones: [
      { ext: '', number: '6198875205', primary: true, type: 'Office' }
    ],
    alt_photos:
      'http://ap.rdcpix.com/5f14a16277c21c95255b78abbe65f6e1l-m3208438834od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/5f14a16277c21c95255b78abbe65f6e1l-m3208438834od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/5f14a16277c21c95255b78abbe65f6e1l-m2217201212od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/5f14a16277c21c95255b78abbe65f6e1l-m2854522397od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/5f14a16277c21c95255b78abbe65f6e1l-m2739237533od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/5f14a16277c21c95255b78abbe65f6e1l-m2470576513od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/5f14a16277c21c95255b78abbe65f6e1l-m2575312811od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/5f14a16277c21c95255b78abbe65f6e1l-m3222296712od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/5f14a16277c21c95255b78abbe65f6e1l-m3214796675od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/5f14a16277c21c95255b78abbe65f6e1l-m508569426od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/5f14a16277c21c95255b78abbe65f6e1l-m2602863912od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/5f14a16277c21c95255b78abbe65f6e1l-m89325711od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/5f14a16277c21c95255b78abbe65f6e1l-m1417450796od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/5f14a16277c21c95255b78abbe65f6e1l-m3809634342od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/5f14a16277c21c95255b78abbe65f6e1l-m1250305648od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/5f14a16277c21c95255b78abbe65f6e1l-m926303925od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/5f14a16277c21c95255b78abbe65f6e1l-m1751121387od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/5f14a16277c21c95255b78abbe65f6e1l-m2014960998od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/5f14a16277c21c95255b78abbe65f6e1l-m1052566193od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/5f14a16277c21c95255b78abbe65f6e1l-m3335368503od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/5f14a16277c21c95255b78abbe65f6e1l-m1644485839od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/5f14a16277c21c95255b78abbe65f6e1l-m3674308503od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/5f14a16277c21c95255b78abbe65f6e1l-m3677879695od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/5f14a16277c21c95255b78abbe65f6e1l-m401897198od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/5f14a16277c21c95255b78abbe65f6e1l-m4256146013od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/5f14a16277c21c95255b78abbe65f6e1l-m3030626062od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/5f14a16277c21c95255b78abbe65f6e1l-m2606679501od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/5f14a16277c21c95255b78abbe65f6e1l-m3691229085od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/5f14a16277c21c95255b78abbe65f6e1l-m1075684000od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/5f14a16277c21c95255b78abbe65f6e1l-m2101070347od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/5f14a16277c21c95255b78abbe65f6e1l-m754116443od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/5f14a16277c21c95255b78abbe65f6e1l-m1770162923od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/5f14a16277c21c95255b78abbe65f6e1l-m4253759096od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/5f14a16277c21c95255b78abbe65f6e1l-m304511571od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/5f14a16277c21c95255b78abbe65f6e1l-m1959470017od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/5f14a16277c21c95255b78abbe65f6e1l-m4201696733od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/5f14a16277c21c95255b78abbe65f6e1l-m736703190od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/5f14a16277c21c95255b78abbe65f6e1l-m1233911096od-w480_h360_x2.webp?w=1080&q=75',
    assessed_value: 79443,
    beds: 4,
    broker: null,
    broker_phone: null,
    broker_website: null,
    city: 'San Diego',
    county: 'San Diego',
    days_on_mls: 18,
    estimated_value: 1246000,
    fips_code: '06073',
    full_baths: 2,
    full_street_line: '5082 Park Rim Dr',
    half_baths: null,
    hoa_fee: 0,
    last_sold_date: '2024-08-26',
    latitude: 32.838348,
    list_date: '2024-08-08',
    list_price: 1227000,
    longitude: -117.214187,
    lot_sqft: 19101,
    mls: 'MRCA',
    mls_id: 'NDP2407068',
    nearby_schools: 'San Diego Unified School District',
    neighborhoods: 'North Clairemont, Northern San Diego',
    parking_garage: 2,
    price_per_sqft: 692,
    primary_photo:
      'http://ap.rdcpix.com/5f14a16277c21c95255b78abbe65f6e1l-m3208438834od-w480_h360_x2.webp?w=1080&q=75',
    property_url:
      'https://www.realtor.com/realestateandhomes-detail/2673395268',
    sold_price: 1075000,
    sqft: 1553,
    state: 'CA',
    status: 'SOLD',
    stories: 1,
    street: '5082 Park Rim Dr',
    style: 'SINGLE_FAMILY',
    text: "Welcome to 5082 Park Rim Drive, a charming 4-bedroom, 2-bathroom home boasting an amazing view and nestled in a prime central San Diego location. Spanning 1, 553 square feet, this home offers unparalleled convenience and comfort. Situated on a quiet, low-traffic street, the property features a stunning canyon view, refreshing ocean breeze, and a picturesque view of Mt. Soledad. The exterior showcases a new roof installed in 2021, gutters added in 2019, and abundant shade providing a cool and relaxing environment. Inside, you'll find a cozy living room with a wood-burning fireplace, a family room with built-in bookshelves on two walls, and a dining room with built-in shelves, storage under the breakfast bar, and a large skylight filling the room with natural light. The kitchen is equipped with a built-in charcoal water filter on the sink and a spacious pantry for ample storage. The California room includes two sets of built-in storage cabinets. Each bedroom offers extended closet space for added convenience. The second bathroom has an exhaust fan for improved ventilation, a large vanity, and a door providing direct access to the backyard. The garage features built-in shelving, large cubicle storage, and a workbench with additional storage. The home has central air conditioning, ensuring a comfortable living environment year-round. Located close to Clairemont Square shopping centers, diverse dining options, and with easy access to major freeways (163, 805, 52, 5, and 15), commuting throughout the city is stress-free. This home is being sold as is and is a fantastic opportunity for those looking to add their personal touch. Ready for new memories, 5082 Park Rim Drive awaits its next owner to enjoy its many wonderful features and exceptional location. Don't miss out on this rare find in Clairemont, San Diegocontact us today to schedule a viewing.",
    unit: null,
    year_built: 1968,
    zip_code: '92117'
  },
  {
    agent: 'Paul Fan',
    agent_email: 'paulfan@willisallen.com',
    agent_phones: [
      { ext: '', number: '7608454509', primary: true, type: 'Office' }
    ],
    alt_photos:
      'http://ap.rdcpix.com/9fc1ab421275123c981482a56c558a68l-m3740842975od-w480_h360_x2.webp?w=1080&q=75',
    assessed_value: 167167,
    beds: 4,
    broker: null,
    broker_phone: null,
    broker_website: null,
    city: 'La Jolla',
    county: 'San Diego',
    days_on_mls: 4,
    estimated_value: null,
    fips_code: '06073',
    full_baths: 2,
    full_street_line: '6662 Avenida La Reina',
    half_baths: 1,
    hoa_fee: 0,
    last_sold_date: '2024-08-26',
    latitude: 32.830881,
    list_date: '2024-08-22',
    list_price: 2500000,
    longitude: -117.267984,
    lot_sqft: 8600,
    mls: 'MRCA',
    mls_id: 'NDP2407525',
    nearby_schools: 'San Diego Unified School District',
    neighborhoods: 'Muirlands, Northern San Diego, La Jolla',
    parking_garage: 2,
    price_per_sqft: 1192,
    primary_photo:
      'http://ap.rdcpix.com/9fc1ab421275123c981482a56c558a68l-m3740842975od-w480_h360_x2.webp?w=1080&q=75',
    property_url:
      'https://www.realtor.com/realestateandhomes-detail/1784542560',
    sold_price: 2450000,
    sqft: 2056,
    state: 'CA',
    status: 'SOLD',
    stories: 1,
    street: '6662 Avenida La Reina',
    style: 'SINGLE_FAMILY',
    text: 'Single story fixer in Muirlands Village with big ocean views. West facing lot with no steps. 3 bed 2.5 bath with over 2000sqft. Easy walk to Muirlands Middle and La Jolla High.',
    unit: null,
    year_built: 1955,
    zip_code: '92037'
  },
  {
    agent: 'Chris Farmer',
    agent_email: 'farmerhomes@gmail.com',
    agent_phones: [
      { ext: '', number: '(858) 668-2804', primary: true, type: 'Office' }
    ],
    alt_photos:
      'http://ap.rdcpix.com/8986e0c6c2eae72d79a68147c7e2cc13l-m3153453156od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/8986e0c6c2eae72d79a68147c7e2cc13l-m2790710802od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/8986e0c6c2eae72d79a68147c7e2cc13l-m4155681365od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/8986e0c6c2eae72d79a68147c7e2cc13l-m4188642327od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/8986e0c6c2eae72d79a68147c7e2cc13l-m2123213253od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/8986e0c6c2eae72d79a68147c7e2cc13l-m530834448od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/8986e0c6c2eae72d79a68147c7e2cc13l-m2091630944od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/8986e0c6c2eae72d79a68147c7e2cc13l-m3670181799od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/8986e0c6c2eae72d79a68147c7e2cc13l-m946827394od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/8986e0c6c2eae72d79a68147c7e2cc13l-m2530662829od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/8986e0c6c2eae72d79a68147c7e2cc13l-m1133862073od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/8986e0c6c2eae72d79a68147c7e2cc13l-m2162476779od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/8986e0c6c2eae72d79a68147c7e2cc13l-m883430934od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/8986e0c6c2eae72d79a68147c7e2cc13l-m966840924od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/8986e0c6c2eae72d79a68147c7e2cc13l-m1135231219od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/8986e0c6c2eae72d79a68147c7e2cc13l-m881778934od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/8986e0c6c2eae72d79a68147c7e2cc13l-m869355935od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/8986e0c6c2eae72d79a68147c7e2cc13l-m4283404344od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/8986e0c6c2eae72d79a68147c7e2cc13l-m1513438615od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/8986e0c6c2eae72d79a68147c7e2cc13l-m2463623652od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/8986e0c6c2eae72d79a68147c7e2cc13l-m1009576496od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/8986e0c6c2eae72d79a68147c7e2cc13l-m360523650od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/8986e0c6c2eae72d79a68147c7e2cc13l-m3175891498od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/8986e0c6c2eae72d79a68147c7e2cc13l-m3631362751od-w480_h360_x2.webp?w=1080&q=75',
    assessed_value: 290934,
    beds: 2,
    broker: null,
    broker_phone: null,
    broker_website: null,
    city: 'San Diego',
    county: 'San Diego',
    days_on_mls: 95,
    estimated_value: 539900,
    fips_code: '06073',
    full_baths: 2,
    full_street_line: '8024 Linda Vista Rd Apt 1A',
    half_baths: null,
    hoa_fee: 355,
    last_sold_date: '2024-08-26',
    latitude: 32.807142,
    list_date: '2024-05-23',
    list_price: 539000,
    longitude: -117.155224,
    lot_sqft: null,
    mls: 'SDCA',
    mls_id: '240011538',
    nearby_schools:
      'San Diego County Office Of Education School District, San Diego Unified School District',
    neighborhoods: 'Clairemont Mesa East, Northern San Diego',
    parking_garage: null,
    price_per_sqft: 551,
    primary_photo:
      'http://ap.rdcpix.com/8986e0c6c2eae72d79a68147c7e2cc13l-m3153453156od-w480_h360_x2.webp?w=1080&q=75',
    property_url:
      'https://www.realtor.com/realestateandhomes-detail/2432949109',
    sold_price: 515000,
    sqft: 934,
    state: 'CA',
    status: 'SOLD',
    stories: 1,
    street: '8024 Linda Vista Rd',
    style: 'CONDOS',
    text: "Welcome home! This gorgeous, fully remodeled single-level condo is perfectly located in Linda Vista. Upon entering, you'll notice a light and bright open floorplan that allows the living room, dining room and kitchen to flow seamlessly together. The luxury vinyl plank flooring provides a modern look along with durability. The kitchen has crisp white cabinets and quartz countertops with a nice sized slab for barstool seating. Stainless steel appliances round it out. Open the patio door to let the cool breezes flow through and create the ultimate indoor/outdoor living atmosphere. This is an end unit which provides convenience, privacy and an extra large backyard patio area. Both bedrooms are very spacious. The bathrooms are stylish, spa-like retreats. This perfect location is walking distance to Mesa College, Sharp Memorial & Rady Childrens Hospital. Enjoy excellent dining and shopping nearby. Mission Bay and San Diego's beautiful beaches are just a few miles away. Easy access to 163 & 805 freeways. Complex has 2 pools! FHA & VA approved! Come see it today and fall in love.",
    unit: 'Apt 1A',
    year_built: 1979,
    zip_code: '92111'
  },
  {
    agent: 'Thomas Van',
    agent_email: 'thomasvan@bhhscal.com',
    agent_phones: null,
    alt_photos:
      'http://ap.rdcpix.com/eca468da520daa666a963c3a8d4a13d2l-m3679573111od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/eca468da520daa666a963c3a8d4a13d2l-m1546564417od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/eca468da520daa666a963c3a8d4a13d2l-m268830881od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/eca468da520daa666a963c3a8d4a13d2l-m683564273od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/eca468da520daa666a963c3a8d4a13d2l-m3495703199od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/eca468da520daa666a963c3a8d4a13d2l-m2251834577od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/eca468da520daa666a963c3a8d4a13d2l-m3187271082od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/eca468da520daa666a963c3a8d4a13d2l-m2079118227od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/eca468da520daa666a963c3a8d4a13d2l-m104643395od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/eca468da520daa666a963c3a8d4a13d2l-m125692466od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/eca468da520daa666a963c3a8d4a13d2l-m198217850od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/eca468da520daa666a963c3a8d4a13d2l-m3288225304od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/eca468da520daa666a963c3a8d4a13d2l-m2759029152od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/eca468da520daa666a963c3a8d4a13d2l-m2657786137od-w480_h360_x2.webp?w=1080&q=75',
    assessed_value: 157630,
    beds: 4,
    broker: null,
    broker_phone: null,
    broker_website: null,
    city: 'San Diego',
    county: 'San Diego',
    days_on_mls: 41,
    estimated_value: 650700,
    fips_code: '06073',
    full_baths: 2,
    full_street_line: '5754 Olvera Ave',
    half_baths: 1,
    hoa_fee: 0,
    last_sold_date: '2024-08-26',
    latitude: 32.699737,
    list_date: '2024-07-16',
    list_price: 620000,
    longitude: -117.073783,
    lot_sqft: null,
    mls: 'SDCA',
    mls_id: '240016407',
    nearby_schools: 'San Diego Unified School District',
    neighborhoods: 'Southeastern San Diego, Valencia Park',
    parking_garage: null,
    price_per_sqft: 300,
    primary_photo:
      'http://ap.rdcpix.com/eca468da520daa666a963c3a8d4a13d2l-m3679573111od-w480_h360_x2.webp?w=1080&q=75',
    property_url:
      'https://www.realtor.com/realestateandhomes-detail/1937192053',
    sold_price: 637500,
    sqft: 2125,
    state: 'CA',
    status: 'SOLD',
    stories: 1,
    street: '5754 Olvera Ave',
    style: 'SINGLE_FAMILY',
    text: 'This beautiful home is now available in the heart of Skyline Hills. From the property there are views of Coronado and the Coronado Bridge. This home has 4 bedrooms and 2 full bathrooms with a half bathroom. With 2125 total square feet, it is one of the largest square footage layouts in the neighborhood. The primary bedroom is very spacious with plenty of room for a king size bed and additional furniture. The second bedroom sits adjacent to master bedroom and has a half bathroom attached. The remaining 2 bedrooms and full bathroom are at the rear of the home. The kitchen has a 2 sided sink with a gas stove. Tankless water heater and electrical panel on the eastside of property. This home is minutes away from the downtown San Diego, restaurants, grocery stores and more.',
    unit: null,
    year_built: 1938,
    zip_code: '92114'
  },
  {
    agent: 'Aaron Reid',
    agent_email: 'aaron.reid@camoves.com',
    agent_phones: [
      { ext: '', number: '6192245111', primary: true, type: 'Office' },
      { ext: '', number: '6199295165', primary: true, type: 'Mobile' },
      { ext: '', number: '8585392000', primary: false, type: 'Fax' }
    ],
    alt_photos:
      'http://ap.rdcpix.com/b108ca6fbd58d45bca401631f57e2635l-b112871801od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/b108ca6fbd58d45bca401631f57e2635l-b3366058514od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/b108ca6fbd58d45bca401631f57e2635l-b1722604563od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/b108ca6fbd58d45bca401631f57e2635l-b3989594335od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/b108ca6fbd58d45bca401631f57e2635l-b145128667od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/b108ca6fbd58d45bca401631f57e2635l-b3321775985od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/b108ca6fbd58d45bca401631f57e2635l-b2326597059od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/b108ca6fbd58d45bca401631f57e2635l-b2094197368od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/b108ca6fbd58d45bca401631f57e2635l-b1962050628od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/b108ca6fbd58d45bca401631f57e2635l-b1341606372od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/b108ca6fbd58d45bca401631f57e2635l-b26792513od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/b108ca6fbd58d45bca401631f57e2635l-b2149608725od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/b108ca6fbd58d45bca401631f57e2635l-b3098708090od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/b108ca6fbd58d45bca401631f57e2635l-b2545345038od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/b108ca6fbd58d45bca401631f57e2635l-b2742938654od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/b108ca6fbd58d45bca401631f57e2635l-b116059630od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/b108ca6fbd58d45bca401631f57e2635l-b2068275357od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/b108ca6fbd58d45bca401631f57e2635l-b2961879092od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/b108ca6fbd58d45bca401631f57e2635l-b3115346338od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/b108ca6fbd58d45bca401631f57e2635l-b3006187346od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/b108ca6fbd58d45bca401631f57e2635l-b639596446od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/b108ca6fbd58d45bca401631f57e2635l-b1307447491od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/b108ca6fbd58d45bca401631f57e2635l-b2006676061od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/b108ca6fbd58d45bca401631f57e2635l-b2623169729od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/b108ca6fbd58d45bca401631f57e2635l-b3908349576od-w480_h360_x2.webp?w=1080&q=75',
    assessed_value: 566447,
    beds: 2,
    broker: null,
    broker_phone: null,
    broker_website: null,
    city: 'San Diego',
    county: 'San Diego',
    days_on_mls: 18,
    estimated_value: 984400,
    fips_code: '06073',
    full_baths: 2,
    full_street_line: '2129 Lincoln Ave',
    half_baths: null,
    hoa_fee: 0,
    last_sold_date: '2024-08-26',
    latitude: 32.750076,
    list_date: '2024-08-08',
    list_price: 949000,
    longitude: -117.141792,
    lot_sqft: 2988,
    mls: 'SDCA',
    mls_id: '240018625',
    nearby_schools: 'San Diego Unified School District',
    neighborhoods: 'North Park, Central San Diego',
    parking_garage: 2,
    price_per_sqft: 1019,
    primary_photo:
      'http://ap.rdcpix.com/b108ca6fbd58d45bca401631f57e2635l-b112871801od-w480_h360_x2.webp?w=1080&q=75',
    property_url:
      'https://www.realtor.com/realestateandhomes-detail/2214210776',
    sold_price: 974000,
    sqft: 956,
    state: 'CA',
    status: 'SOLD',
    stories: 1,
    street: '2129 Lincoln Ave',
    style: 'SINGLE_FAMILY',
    text: 'This charming 2 bed 2 bath craftsman home is light, bright, and tucked away in a nice quiet part of North Park. Kitchen and bathrooms have been tastefully remodeled. The master bedroom is its own personal oasis with bay doors leading to a private patio. The bay doors in the kitchen open to a large deck made of quality Trex decking, leading to a spacious backyard, and a large separate two car garage. The entire property has a private feel and is completely fenced in. Tons of extra potential, including the addition of an ADU. Walking distance to parks, shopping, restaurants, the Lafayette Hotel & Club, and everything North Park!',
    unit: null,
    year_built: 1941,
    zip_code: '92104'
  },
  {
    agent: 'Todd Fortney',
    agent_email: 'todd@toddfortney.com',
    agent_phones: [
      { ext: '', number: '8584873333', primary: true, type: 'Office' },
      { ext: '', number: '6195181783', primary: true, type: 'Mobile' }
    ],
    alt_photos:
      'http://ap.rdcpix.com/101ac201235868cb751f6a6bc14ddb0dl-b4033510899od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/101ac201235868cb751f6a6bc14ddb0dl-b2613143772od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/101ac201235868cb751f6a6bc14ddb0dl-b1275637865od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/101ac201235868cb751f6a6bc14ddb0dl-b2555830156od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/101ac201235868cb751f6a6bc14ddb0dl-b35738819od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/101ac201235868cb751f6a6bc14ddb0dl-b884584086od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/101ac201235868cb751f6a6bc14ddb0dl-b2109247982od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/101ac201235868cb751f6a6bc14ddb0dl-b2447161304od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/101ac201235868cb751f6a6bc14ddb0dl-b1015409319od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/101ac201235868cb751f6a6bc14ddb0dl-b2062293764od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/101ac201235868cb751f6a6bc14ddb0dl-b1439556799od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/101ac201235868cb751f6a6bc14ddb0dl-b3341666096od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/101ac201235868cb751f6a6bc14ddb0dl-b2126105878od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/101ac201235868cb751f6a6bc14ddb0dl-b3940848991od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/101ac201235868cb751f6a6bc14ddb0dl-b671664307od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/101ac201235868cb751f6a6bc14ddb0dl-b2050763889od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/101ac201235868cb751f6a6bc14ddb0dl-b3920147678od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/101ac201235868cb751f6a6bc14ddb0dl-b995364268od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/101ac201235868cb751f6a6bc14ddb0dl-b1118512973od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/101ac201235868cb751f6a6bc14ddb0dl-b3833044803od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/101ac201235868cb751f6a6bc14ddb0dl-b595959957od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/101ac201235868cb751f6a6bc14ddb0dl-b2372196842od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/101ac201235868cb751f6a6bc14ddb0dl-b4257628220od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/101ac201235868cb751f6a6bc14ddb0dl-b1560946652od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/101ac201235868cb751f6a6bc14ddb0dl-b3747068080od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/101ac201235868cb751f6a6bc14ddb0dl-b4153621997od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/101ac201235868cb751f6a6bc14ddb0dl-b2114794819od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/101ac201235868cb751f6a6bc14ddb0dl-b3920231285od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/101ac201235868cb751f6a6bc14ddb0dl-b3707473590od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/101ac201235868cb751f6a6bc14ddb0dl-b1730736571od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/101ac201235868cb751f6a6bc14ddb0dl-b3963395074od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/101ac201235868cb751f6a6bc14ddb0dl-b2647553114od-w480_h360_x2.webp?w=1080&q=75',
    assessed_value: 681126,
    beds: 4,
    broker: null,
    broker_phone: null,
    broker_website: null,
    city: 'San Diego',
    county: 'San Diego',
    days_on_mls: 95,
    estimated_value: 1385000,
    fips_code: '06073',
    full_baths: 3,
    full_street_line: '17025 Capilla Ct',
    half_baths: null,
    hoa_fee: 50,
    last_sold_date: '2024-08-26',
    latitude: 33.02487,
    list_date: '2024-05-23',
    list_price: 1399000,
    longitude: -117.086846,
    lot_sqft: 13939,
    mls: 'SDCA',
    mls_id: '240011549',
    nearby_schools:
      'Audeo Charter School III District, Poway Unified School District',
    neighborhoods: 'Rancho Bernardo, North San Diego',
    parking_garage: 2,
    price_per_sqft: 582,
    primary_photo:
      'http://ap.rdcpix.com/101ac201235868cb751f6a6bc14ddb0dl-b4033510899od-w480_h360_x2.webp?w=1080&q=75',
    property_url:
      'https://www.realtor.com/realestateandhomes-detail/1419825855',
    sold_price: 1350000,
    sqft: 2321,
    state: 'CA',
    status: 'SOLD',
    stories: 2,
    street: '17025 Capilla Ct',
    style: 'SINGLE_FAMILY',
    text: "Welcome to this stunning single-family home located in the highly sought-after Westwood neighborhood of Rancho Bernardo in San Diego, CA. This beautiful home is situated on a quiet cul-de-sac, providing a serene and peaceful environment for you and your family. With approximately 2, 321 square feet of living space, this home boasts four bedrooms and three bathrooms, providing ample space for your family to grow and thrive. As you enter the home, you will be greeted by a spacious and inviting living room that is perfect for entertaining guests or relaxing with your loved ones. The home features three bedrooms and two bathrooms upstairs, and one bedroom and one bathroom downstairs, providing flexibility and convenience for your family's needs. The large, upgraded kitchen has been recently remodeled in July 2022 with granite countertops, new cabinets, and stainless-steel appliances. The new dual pane windows installed in 2024 provide energy efficiency and a comfortable living environment. The Fujitsu zoned AC units ensure that you and your family stay cool and comfortable all year round. The new roof installed in June 2023 provides peace of mind for years to come. The interior of the home has been freshly painted in May 2024, providing a clean and modern look. The huge pie-shaped low maintenance private backyard is perfect for outdoor activities and features synthetic grass, rocks, and fruit trees, making it a perfect place to relax and unwind. This home is conveniently located close to Westwood Elementary and Westwood Community Club, making it an ideal location.",
    unit: null,
    year_built: 1971,
    zip_code: '92127'
  },
  {
    agent: 'Peggy Foos',
    agent_email: 'peggy@peggyfoos.com',
    agent_phones: [
      { ext: '', number: '8583547503', primary: true, type: 'Office' },
      { ext: '', number: '8583547503', primary: true, type: 'Mobile' }
    ],
    alt_photos:
      'http://ap.rdcpix.com/91ebbe9462767eea94745e6d2fefbc95l-m1624089698od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/91ebbe9462767eea94745e6d2fefbc95l-m940763467od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/91ebbe9462767eea94745e6d2fefbc95l-m627166451od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/91ebbe9462767eea94745e6d2fefbc95l-m30919135od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/91ebbe9462767eea94745e6d2fefbc95l-m2679789704od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/91ebbe9462767eea94745e6d2fefbc95l-m3746318615od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/91ebbe9462767eea94745e6d2fefbc95l-m555337605od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/91ebbe9462767eea94745e6d2fefbc95l-m3106182244od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/91ebbe9462767eea94745e6d2fefbc95l-m3403589029od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/91ebbe9462767eea94745e6d2fefbc95l-m115016233od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/91ebbe9462767eea94745e6d2fefbc95l-m3470558451od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/91ebbe9462767eea94745e6d2fefbc95l-m4092898430od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/91ebbe9462767eea94745e6d2fefbc95l-m3797129710od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/91ebbe9462767eea94745e6d2fefbc95l-m1973617831od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/91ebbe9462767eea94745e6d2fefbc95l-m672722839od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/91ebbe9462767eea94745e6d2fefbc95l-m2197511566od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/91ebbe9462767eea94745e6d2fefbc95l-m2505332902od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/91ebbe9462767eea94745e6d2fefbc95l-m2182340780od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/91ebbe9462767eea94745e6d2fefbc95l-m2036708394od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/91ebbe9462767eea94745e6d2fefbc95l-m1381211609od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/91ebbe9462767eea94745e6d2fefbc95l-m3768446316od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/91ebbe9462767eea94745e6d2fefbc95l-m1871936498od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/91ebbe9462767eea94745e6d2fefbc95l-m2063191344od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/91ebbe9462767eea94745e6d2fefbc95l-m2896080145od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/91ebbe9462767eea94745e6d2fefbc95l-m4004914758od-w480_h360_x2.webp?w=1080&q=75',
    assessed_value: 820000,
    beds: 2,
    broker: null,
    broker_phone: null,
    broker_website: null,
    city: 'Del Mar',
    county: 'San Diego',
    days_on_mls: 60,
    estimated_value: 989000,
    fips_code: '06073',
    full_baths: 1,
    full_street_line: '2222 Carmel Valley Rd Unit 11',
    half_baths: 1,
    hoa_fee: 300,
    last_sold_date: '2024-08-26',
    latitude: 32.934085,
    list_date: '2024-06-27',
    list_price: 999000,
    longitude: -117.254635,
    lot_sqft: null,
    mls: 'SDCA',
    mls_id: '240014740',
    nearby_schools:
      'San Diego County Office Of Education School District, Del Mar Union Elementary School District, San Dieguito Union High School District',
    neighborhoods: 'Del Mar Heights, North San Diego',
    parking_garage: 1,
    price_per_sqft: 979,
    primary_photo:
      'http://ap.rdcpix.com/91ebbe9462767eea94745e6d2fefbc95l-m1624089698od-w480_h360_x2.webp?w=1080&q=75',
    property_url:
      'https://www.realtor.com/realestateandhomes-detail/1886901066',
    sold_price: 940000,
    sqft: 960,
    state: 'CA',
    status: 'SOLD',
    stories: 2,
    street: '2222 Carmel Valley Rd',
    style: 'CONDOS',
    text: "This is the ultimate surfer/beach pad. Not your average boxy condo. This two story condo has a striking spiral staircase leading to the bedrooms with noone above. The spacious main level has an updated kitchen with newer quartz counters and stainless appliances. Airy, light and bright with easy maintenance floor coverings ideal for the sand from the beach. The small enclave of condos is convenient to Del Mar's food spots Roberto's, pizza and coffee shop! Direclty across from the Torrey Pines preserve and the beach. It doesn't get much better than this!",
    unit: 'Unit 11',
    year_built: 1974,
    zip_code: '92014'
  },
  {
    agent: 'Theresa Crowder',
    agent_email: null,
    agent_phones: [
      { ext: null, number: '8184275231', primary: true, type: null }
    ],
    alt_photos:
      'http://ap.rdcpix.com/20ca118dda7be3ed8a180ec1441735d4l-m2751835846od-w480_h360_x2.webp?w=1080&q=75',
    assessed_value: 796566,
    beds: 6,
    broker: null,
    broker_phone: null,
    broker_website: null,
    city: 'San Diego',
    county: 'San Diego',
    days_on_mls: 36,
    estimated_value: null,
    fips_code: '06073',
    full_baths: 4,
    full_street_line: '3767-71 7th Ave',
    half_baths: null,
    hoa_fee: 0,
    last_sold_date: '2024-08-26',
    latitude: 32.746396,
    list_date: '2024-07-21',
    list_price: 1100000,
    longitude: -117.158045,
    lot_sqft: 7001,
    mls: 'SDCA',
    mls_id: '240016908',
    nearby_schools: 'San Diego Unified School District',
    neighborhoods: 'Hillcrest, Uptown, Central San Diego',
    parking_garage: null,
    price_per_sqft: null,
    primary_photo:
      'http://ap.rdcpix.com/20ca118dda7be3ed8a180ec1441735d4l-m2751835846od-w480_h360_x2.webp?w=1080&q=75',
    property_url:
      'https://www.realtor.com/realestateandhomes-detail/9345783212',
    sold_price: 1145000,
    sqft: null,
    state: 'CA',
    status: 'SOLD',
    stories: 2,
    street: '3767-71 7th Ave',
    style: 'MULTI_FAMILY',
    text: "FOR INVESTORS ONLY. DO NOT DISTURB TENANTS. DRIVE BY VIEWINGS ONLY. Listing price is for 49% ownership of property only. Seller's LLC to remain 51% majority owner and existing loan will remain in place. Apartment building is currently four units---6 bedrooms, 4 baths, 3382 sq ft. Call agent on details on existing loan and ownership structure.",
    unit: null,
    year_built: 1930,
    zip_code: '92103'
  },
  {
    agent: 'Steven V Melanese',
    agent_email: null,
    agent_phones: null,
    alt_photos:
      'http://ap.rdcpix.com/534541f8939df57929129c599df48081l-m704539401od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/534541f8939df57929129c599df48081l-m2937187826od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/534541f8939df57929129c599df48081l-m1290873866od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/534541f8939df57929129c599df48081l-m2726314760od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/534541f8939df57929129c599df48081l-m3264168155od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/534541f8939df57929129c599df48081l-m864388683od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/534541f8939df57929129c599df48081l-m359373231od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/534541f8939df57929129c599df48081l-m313222245od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/534541f8939df57929129c599df48081l-m3799347930od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/534541f8939df57929129c599df48081l-m4292679397od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/534541f8939df57929129c599df48081l-m982071936od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/534541f8939df57929129c599df48081l-m1200961839od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/534541f8939df57929129c599df48081l-m1816444760od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/534541f8939df57929129c599df48081l-m151624979od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/534541f8939df57929129c599df48081l-m2624741139od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/534541f8939df57929129c599df48081l-m1934003951od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/534541f8939df57929129c599df48081l-m1621977477od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/534541f8939df57929129c599df48081l-m3804240294od-w480_h360_x2.webp?w=1080&q=75, http://ap.rdcpix.com/534541f8939df57929129c599df48081l-m170668942od-w480_h360_x2.webp?w=1080&q=75',
    assessed_value: 416158,
    beds: 2,
    broker: null,
    broker_phone: null,
    broker_website: null,
    city: 'San Diego',
    county: 'San Diego',
    days_on_mls: 74,
    estimated_value: 497138,
    fips_code: '06073',
    full_baths: 2,
    full_street_line: '3955 Faircross Pl Unit 44',
    half_baths: null,
    hoa_fee: 581,
    last_sold_date: '2024-08-26',
    latitude: 32.746707,
    list_date: '2024-06-13',
    list_price: 489000,
    longitude: -117.068583,
    lot_sqft: null,
    mls: 'MRCA',
    mls_id: 'PTP2403448',
    nearby_schools: 'San Diego Unified School District',
    neighborhoods: 'Mid-City, Redwood Village',
    parking_garage: 1,
    price_per_sqft: 435,
    primary_photo:
      'http://ap.rdcpix.com/534541f8939df57929129c599df48081l-m704539401od-w480_h360_x2.webp?w=1080&q=75',
    property_url:
      'https://www.realtor.com/realestateandhomes-detail/2472465530',
    sold_price: 465000,
    sqft: 1069,
    state: 'CA',
    status: 'SOLD',
    stories: 1,
    street: '3955 Faircross Pl',
    style: 'CONDOS',
    text: 'Welcome to this spacious 2 bedroom, 2 bathroom condo boasting an inviting open floor plan and stunning westerly views from all windows and the balcony as well. Vinyl plank flooring and fresh paint make this home feel warm and bright. Enjoy ample storage inside plus a storage closet on the balcony, plus the convenience of an in-unit washer/dryer. One parking space in the gated garage plus plenty of curbside parking makes access easy for all.',
    unit: 'Unit 44',
    year_built: 1985,
    zip_code: '92115'
  }
];

export const assignIdsToProperties = (properties: PropertyDetails[]) => {
  return properties.map((property) => ({
    ...property,
    id: uuidv4() // Assign a unique UUID to each property
  }));
};

detailed_properties_saved = assignIdsToProperties(detailed_properties_saved);
