import { z } from 'zod';

// Define the Zod schema for form validation
export const leadSchema = z.object({
  // Required fields
  listName: z.string().min(1, 'List Name is required'),
  skipTracedFile: z.instanceof(File).refine(
    (file) => file.size > 0, // Ensure file is not empty
    { message: 'Skip-traced list is required' }
  ),

  // Mapping fields (required to map to a header)
  firstNameField: z.string().min(1, 'First Name is required'),
  lastNameField: z.string().min(1, 'Last Name is required'),
  streetAddressField: z.string().min(1, 'Street Address is required'),
  cityField: z.string().min(1, 'City is required'),
  stateField: z.string().min(1, 'State is required'),
  zipCodeField: z.string().min(1, 'ZIP Code is required'),
  phone1Field: z.string().min(1, 'Phone 1 is required'),

  // Optional fields (can be empty or mapped)
  phone2Field: z.string().optional(),
  emailField: z.string().optional(),

  // Social media fields are optional
  facebookField: z.string().optional(),
  linkedinField: z.string().optional(),
  instagramField: z.string().optional(),
  twitterField: z.string().optional()
});
