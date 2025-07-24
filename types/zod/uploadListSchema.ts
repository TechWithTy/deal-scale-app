import { z } from 'zod';

// Define supported file types and max file size (200 MB)
const fileExtensions = ['csv', 'xlsx'];
const maxFileSize = 200 * 1024 * 1024; // 200MB in bytes

// Zod schema for the modal form
export const uploadListSchema = z.object({
  listName: z
    .string()
    .min(1, 'List Name is required')
    .max(100, 'List Name must be 100 characters or less'),

  skipTracedFile: z
    .any()
    .refine(
      (file: File | undefined) =>
        file instanceof File && file.size <= maxFileSize,
      {
        message: 'File is required and must be smaller than 200MB'
      }
    )
    .refine((file: File | undefined) => {
      if (file) {
        const extension = file.name.split('.').pop()?.toLowerCase();
        return fileExtensions.includes(extension || '');
      }
      return false;
    }, 'File must be a .csv or .xlsx'),

  // First name validation (must match one of the available options)
  firstNameField: z.string().min(1, 'You must match a column for First Name'),

  lastNameField: z.string().min(1, 'You must match a column for Last Name'),

  streetAddressField: z
    .string()
    .min(1, 'You must match a column for Street Address'),

  cityField: z.string().min(1, 'You must match a column for City'),

  stateField: z.string().min(1, 'You must match a column for State'),

  zipCodeField: z
    .string()
    .min(1, 'You must match a column for ZIP Code')
    .refine((zip) => /^[0-9]{5}(?:-[0-9]{4})?$/.test(zip), {
      message: 'Invalid ZIP Code format'
    }),

  phone1Field: z
    .string()
    .min(1, 'You must match a column for Phone 1')
    .refine((phone) => /^\d{10}$/.test(phone), {
      message: 'Phone number must be a 10-digit number'
    }),

  phone2Field: z
    .string()
    .optional() // Optional field
    .refine(
      (phone) => {
        // Handle the case where phone is undefined or an empty string
        if (phone === undefined || phone === '') return true;
        // Ensure phone is a 10-digit number if provided
        return /^\d{10}$/.test(phone);
      },
      {
        message: 'Phone number must be a 10-digit number'
      }
    ),
  emailField: z
    .string()
    .optional()
    .refine(
      (value) =>
        value === undefined ||
        value === '' ||
        z.string().email().safeParse(value).success,
      {
        message: 'Invalid email address'
      }
    )
});
