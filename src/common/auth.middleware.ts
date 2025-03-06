import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from './prisma.service';
import { Superadmin } from '@prisma/client';

// Extend Express Request type
interface RequestWithSuperadmin extends Request {
  superadmin?: Superadmin;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private prismaService: PrismaService) {}

  async use(req: RequestWithSuperadmin, res: Response, next: NextFunction) {
    const token = req.headers.authorization;
    if (token) {
      const superadmin = await this.prismaService.superadmin.findFirst({
        where: { token },
      });

      if (superadmin) {
        req.superadmin = superadmin;
      }
    }
    next();
  }
}
