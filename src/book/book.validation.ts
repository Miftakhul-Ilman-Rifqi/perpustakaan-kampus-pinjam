import { z, ZodType } from 'zod';

export class BookValidation {
  static readonly CREATE: ZodType = z.object({
    title: z.string().min(1).max(255),
    stock: z.number().min(1).positive(),
  });

  static readonly GET: ZodType = z.object({
    id: z.string().uuid(),
  });

  static readonly UPDATE: ZodType = z.object({
    id: z.string().uuid(),
    title: z.string().min(1).max(255).optional(),
    stock: z.number().min(0).positive().optional(),
  });

  static readonly REMOVE: ZodType = z.object({
    id: z.string().uuid(),
  });

  static readonly SEARCH: ZodType = z.object({
    id: z.string().uuid().optional(),
    title: z.string().min(1).optional(),
    page: z.number().min(1).positive().default(1),
    size: z.number().min(1).max(100).positive().default(10),
  });
}
