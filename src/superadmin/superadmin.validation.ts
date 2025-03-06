import { z, ZodType } from 'zod';

export class SuperadminValidation {
  static readonly REGISTER: ZodType = z.object({
    username: z.string().min(1).max(30),
    password: z.string().min(1).max(100),
    full_name: z.string().min(1).max(100),
  });

  static readonly LOGIN: ZodType = z.object({
    username: z.string().min(1).max(30),
    password: z.string().min(1).max(100),
  });
}
