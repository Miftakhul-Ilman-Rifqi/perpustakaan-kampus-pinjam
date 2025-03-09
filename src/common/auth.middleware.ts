import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from './prisma.service';
import { Superadmin } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

// Extend Express Request type
interface RequestWithSuperadmin extends Request {
  superadmin?: Superadmin;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    @Inject(WINSTON_MODULE_PROVIDER)
    private logger: Logger,
    private configService: ConfigService,
  ) {}

  async use(req: RequestWithSuperadmin, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    this.logger.info(
      `Authorization header: ${authHeader || 'No authorization header provided'}`,
    );

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];

      try {
        const publicKey = this.configService.get<string>('JWT_PUBLIC_KEY');
        if (!publicKey) {
          throw new Error('JWT public key not configured');
        }

        // Definisikan interface untuk payload
        interface JwtPayload {
          sub: string;
          username: string;
        }

        const payload = this.jwtService.verify<JwtPayload>(token, {
          publicKey: publicKey.replace(/\\n/g, '\n'), // Handle newline characters
          algorithms: ['RS256'],
        });

        const superadmin = await this.prismaService.superadmin.findUnique({
          where: { id: payload.sub },
        });

        // Tambahkan pengecekan keberadaan superadmin
        if (!superadmin) {
          this.logger.warn(`Superadmin not found for token: ${token}`);
          return next(); // Lanjut tanpa auth
        }

        // Tambahkan pengecekan token kedaluwarsa
        const isTokenExpired = this.jwtService.verify<
          JwtPayload & { exp: number }
        >(token, {
          ignoreExpiration: true,
        });

        if (isTokenExpired.exp * 1000 < Date.now()) {
          this.logger.warn(`Expired token used: ${token}`);
          return next();
        }

        if (superadmin) {
          req.superadmin = superadmin;
          this.logger.info(
            `Superadmin found and attached to request: ${superadmin.id}`,
          );
        } else {
          this.logger.warn(`Superadmin not found for ID: ${payload.sub}`);
        }
      } catch (error: any) {
        // Log error jika diperlukan
        this.logger.error(`JWT Error: ${error.message}`);
      }
    }
    next();
  }
}
