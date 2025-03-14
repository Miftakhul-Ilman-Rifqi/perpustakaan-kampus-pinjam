import { z, ZodType } from 'zod';

export class StudentValidation {
  static readonly CREATE: ZodType = z.object({
    full_name: z.string().min(1).max(100),
    nim: z.string().min(1).max(20).optional(),
  });

  static readonly GET: ZodType = z.object({
    id: z.string().uuid(),
  });

  static readonly SEARCH: ZodType = z.object({
    full_name: z.string().min(1).optional(),
    nim: z.string().min(1).optional(),
    page: z.number().min(1).positive().default(1),
    size: z.number().min(1).max(100).positive().default(10),
  });
}
