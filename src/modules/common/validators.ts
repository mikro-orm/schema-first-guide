import { z } from 'zod';

export const pagingParams = z
  .object({
    limit: z.number().int().positive().optional(),
    offset: z.number().int().nonnegative().optional(),
  })
  .passthrough();
