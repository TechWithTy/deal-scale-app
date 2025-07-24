import * as z from 'zod';
import { htmlRegex, markdownRegex } from './profile-form-schema';

// Define a color validation schema for the hex color format
const hexColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, {
  message: 'Invalid hex color code.'
});

export const examplesSetupSchema = z.object({
  outreachEmailAddress: z
    .string()
    .email({ message: 'Please enter a valid email address.' })
    .max(100, { message: 'Email cannot exceed 100 characters.' }),

  leadForwardingNumber: z
    .string()
    .min(10, { message: 'Contact number must be at least 10 digits.' })
    .max(15, { message: 'Contact number cannot exceed 15 digits.' })
    .refine((value) => /^[0-9]+$/.test(value), {
      message: 'Contact number can only contain numbers.'
    }),
  selectedVoice: z
    .string()
    .max(100, { message: 'Voice selection cannot exceed 100 characters.' })
    .optional()
    .nullable(), // Allows the field to be null or not provided
  clonedVoiceId: z
    .string()
    .min(1, { message: 'Voice ID is required if provided.' })
    .max(100, { message: 'Voice ID cannot exceed 100 characters.' })
    .optional(),
  voicemailRecordingId: z
    .string()
    .min(1, { message: 'VoiceMail ID is required if provided.' })
    .max(100, { message: 'Voice ID cannot exceed 100 characters.' })
    .optional(),
  // Required sales script field
  exampleSalesScript: z
    .string()
    .min(10, { message: 'Sales script must be at least 10 characters long.' })
    .max(1000, { message: 'Sales script cannot exceed 1000 characters.' })
    .optional(),
  exampleEmailBody: z
    .string()
    .min(10, { message: 'Email body must be at least 10 characters long.' })
    .max(5000, { message: 'Email body cannot exceed 5000 characters.' }) // Optional, adjust as needed
    .refine((value) => htmlRegex.test(value) || markdownRegex.test(value), {
      message: 'Email body must be valid Markdown or HTML.'
    })
    .optional()

  // AI Avatar validation
  //   aiAvatar: z
  //     .object({
  //       avatarKandidFile: z
  //         .string()
  //         .min(1, { message: 'Kandid avatar file is required.' }), // Path to the Kandid avatar file
  //       avatarMotionFile: z
  //         .string()
  //         .min(1, { message: 'Avatar motion file is required.' }), // Path to the avatar motion file
  //       videoDetails: z.object({
  //         title: z.string().min(1, { message: 'Video title is required.' }), // Title of the video
  //         description: z
  //           .string()
  //           .min(1, { message: 'Video description is required.' }), // Description of the video
  //         ctaText: z
  //           .string()
  //           .min(1, { message: 'Call-to-action text is required.' }), // Call-to-action text
  //         ctaLink: z.string().url({ message: 'CTA link must be a valid URL.' }) // Call-to-action URL link
  //       })
  //     })
  //     .optional(), // Optional AI avatar object

  //   // Background object validation
  //   background: z
  //     .object({
  //       backgroundVideoFile: z
  //         .string()
  //         .min(1, { message: 'Background video file is required.' }), // Path to the background video file

  //       backgroundMusic: z
  //         .string()
  //         .min(1, { message: 'Background music file is required.' }), // Path to the background music file

  //       colorScheme: z.object({
  //         primaryColor: hexColorSchema, // Primary color as a hex code
  //         secondaryColor: hexColorSchema, // Secondary color as a hex code
  //         accentColor: hexColorSchema.optional() // Optional accent color as a hex code
  //       })
  //     })
  //     .optional() // Optional background object
});
