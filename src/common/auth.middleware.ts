import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from './prisma.service';
import { Superadmin } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

interface RequestWithSuperadmin extends Request {
  superadmin?: Superadmin;
}

interface JwtPayload {
  sub: string;
  username: string;
  exp?: number;
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

    // Jika tidak ada header atau bukan format Bearer
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HttpException(
        'Authentication required',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const token = authHeader.split(' ')[1];

    // Jika token kosong
    if (!token) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    try {
      const publicKey = this.configService.get<string>('JWT_PUBLIC_KEY');
      if (!publicKey) {
        throw new Error('JWT public key not configured');
      }

      const payload = this.jwtService.verify<JwtPayload>(token, {
        publicKey: publicKey.replace(/\\n/g, '\n'),
        algorithms: ['RS256'],
      });

      const superadmin = await this.prismaService.superadmin.findUnique({
        where: { id: payload.sub },
      });

      // Jika superadmin tidak ditemukan
      if (!superadmin) {
        this.logger.warn(`Superadmin not found for token: ${token}`);
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }

      // Token kedaluwarsa
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        this.logger.warn(`Expired token used: ${token}`);
        throw new HttpException('Token expired', HttpStatus.UNAUTHORIZED);
      }

      // Attach superadmin ke request
      req.superadmin = superadmin;
      this.logger.info(
        `Superadmin found and attached to request: ${superadmin.id}`,
      );
      next();
    } catch (error: any) {
      this.logger.error(`JWT Error: ${error.message}`);
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
  }
}
