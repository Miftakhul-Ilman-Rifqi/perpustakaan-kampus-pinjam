import { z, ZodType } from 'zod';
import { LoanStatus } from '@prisma/client';

export class LoanValidation {
  static readonly CREATE: ZodType = z.object({
    nim: z.string().min(1).max(20),
    bookId: z.string().uuid(),
  });

  static readonly GET: ZodType = z.object({
    id: z.string().uuid(),
  });

  static readonly UPDATE: ZodType = z.object({
    id: z.string().uuid(),
    status: z.nativeEnum(LoanStatus),
  });

  static readonly REMOVE: ZodType = z.object({
    id: z.string().uuid(),
  });

  static readonly SEARCH: ZodType = z.object({
    nim: z.string().min(1).max(20).optional(),
    full_name: z.string().min(1).optional(),
    status: z.nativeEnum(LoanStatus).optional(),
    page: z.number().min(1).positive().default(1),
    size: z.number().min(1).max(100).positive().default(10),
  });
}
