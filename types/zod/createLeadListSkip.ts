import { z } from 'zod';

export const skipTraceNestedSchema = z
  .object({
    recordsToSkip: z
      .number()
      .min(1, { message: 'You must skip at least 1 lead.' }),
    redoSkipTrace: z.boolean(),
    totalLeads: z.number().min(1)
  })
  .superRefine(({ recordsToSkip, totalLeads }, ctx) => {
    if (recordsToSkip > totalLeads) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Cannot skip more leads than available.',
        path: ['recordsToSkip'] // Attach the error to the `recordsToSkip` field
      });
    }
  });
