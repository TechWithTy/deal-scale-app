import { z } from 'zod';
import { mapFormSchema } from '../zod/propertyList';

export type AddressCoordinate = {
  address: string;
  lat: number;
  lng: number;
};
export type MapFormSchemaType = z.infer<typeof mapFormSchema>;

export type Coordinate = {
  lat: number;
  lng: number;
};
export type LeadLocationPhone = {
  ext: string | null;
  number: string | null;
  primary: boolean | null;
  type: 'Office' | 'Mobile' | 'Home' | 'Fax' | null; // Assuming these are possible values
};

export type PropertyDetails = {
  id?: string;
  agent: string;
  agent_email: string | null;
  agent_phones: LeadLocationPhone[] | null;
  alt_photos: string; // This could be a string or an array of strings if needed to split by commas
  assessed_value: number;
  beds: number;
  broker: string | null;
  broker_phone: string | null;
  broker_website: string | null;
  city: string;
  county: string;
  days_on_mls: number;
  estimated_value: number | null;
  fips_code: string;
  full_baths: number;
  full_street_line: string;
  half_baths: number | null;
  hoa_fee: number;
  last_sold_date: string; // This could also be a Date type if you want to parse it
  latitude: number;
  list_date: string; // This could also be a Date type if you want to parse it
  list_price: number;
  longitude: number;
  lot_sqft: number | null;
  mls: string;
  mls_id: string;
  nearby_schools: string;
  neighborhoods: string;
  parking_garage: number | null;
  price_per_sqft: number | null;
  primary_photo: string;
  property_url: string;
  sold_price: number;
  sqft: number | null;
  state: string;
  status: string;
  stories: number;
  street: string;
  style: string;
  text: string;
  unit: string | null;
  year_built: number;
  zip_code: string;
  //Needed
  mortgage_balance?: number;
};

export type NeededPropertyDetails = PropertyDetails & {
  mortgage_balance: number | null; // New field for mortgage balance
};
