import * as z from 'zod';
import { validateImageDimensions } from './profile-form-schema';

export const baseSetupSchema = z.object({
  companyLogo: z
    .any()
    .refine((file) => file instanceof File, {
      message: 'You must upload a file.'
    })
    .refine(
      (file) =>
        file && ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      {
        message: 'Logo must be a JPEG, PNG, or WebP image.'
      }
    )
    .refine((file) => file && file.size <= 5 * 1024 * 1024, {
      message: 'Logo must be less than 5MB in size.'
    })
    .refine(
      async (file) => {
        if (!file) return false;
        const isValidDimensions = await validateImageDimensions(
          file,
          100,
          100,
          1000,
          1000
        ); // Min 100x100, Max 1000x1000
        return isValidDimensions;
      },
      {
        message: 'Logo dimensions must be between 100x100 and 1000x1000 pixels.'
      }
    ),

  companyBanner: z
    .any()
    .refine((file) => file instanceof File, {
      message: 'You must upload a file.'
    })
    .refine(
      (file) =>
        file && ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      {
        message: 'Banner must be a JPEG, PNG, or WebP image.'
      }
    )
    .refine((file) => file && file.size <= 5 * 1024 * 1024, {
      message: 'Banner must be less than 5MB in size.'
    })
    .refine(
      async (file) => {
        if (!file) return false;
        const isValidDimensions = await validateImageDimensions(
          file,
          1200,
          400,
          1200,
          400
        ); // Banner dimensions fixed to 1200x400 pixels
        return isValidDimensions;
      },
      {
        message: 'Banner dimensions must be 1200x400 pixels.'
      }
    ),

  explainerVideoUrl: z
    .string()
    .url({ message: 'Please enter a valid URL for the explainer video.' })
    .optional(), // Optional field for video URL

  assets: z
    .array(
      z
        .any()
        .refine((file) => file instanceof File, {
          message: 'You must upload a file.'
        })
        .refine(
          (file) =>
            file &&
            ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
          {
            message: 'Asset must be a JPEG, PNG, or WebP image.'
          }
        )
        .refine((file) => file && file.size <= 5 * 1024 * 1024, {
          message: 'Asset must be less than 5MB in size.'
        })
    )
    .max(12, { message: 'You can upload up to 12 assets.' }) // Allow up to 12 images
});
