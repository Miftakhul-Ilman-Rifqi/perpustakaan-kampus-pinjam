import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CaslAbilityFactory } from './casl-ability.factory';
import { RequiredRule } from './abilities.decorator';
import { Superadmin } from '@prisma/client';
import { Request } from 'express';

// Buat interface untuk request yang memiliki properti superadmin
interface RequestWithSuperadmin extends Request {
  superadmin?: Superadmin;
}

@Injectable()
export class AbilitiesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const rules = this.reflector.get<RequiredRule[]>(
      'abilities',
      context.getHandler(),
    );

    if (!rules) {
      return true; // Jika tidak ada aturan, maka akses diizinkan
    }

    // Gunakan type assertion yang lebih spesifik
    const request = context.switchToHttp().getRequest<RequestWithSuperadmin>();
    const user = request.superadmin;

    if (!user) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
      // return false; // Jika tidak ada user, maka akses ditolak
    }

    const ability = this.caslAbilityFactory.createForUser(user);
    const hasAbility = rules.every((rule) =>
      ability.can(rule.action, rule.subject),
    );

    if (!hasAbility) {
      throw new HttpException(
        'Forbidden: Insufficient permissions to access this resource',
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}
