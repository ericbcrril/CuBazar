import { z } from 'zod';
import { objectIdSchema } from '../../shared/utils/objectId';

export const updateAvailabilitySchema = z.object({
  body: z.object({
    isAvailable: z.boolean(),
  }),
});

export const userIdSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});
