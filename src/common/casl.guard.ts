import { Injectable } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Action, CaslAbilityFactory } from './casl-ability.factory';
import { Superadmin } from '@prisma/client';

interface RequestWithSuperadmin extends Request {
  superadmin?: Superadmin;
}

@Injectable()
export class CaslGuard implements CanActivate {
  constructor(
    private caslAbilityFactory: CaslAbilityFactory,
    private reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithSuperadmin>();
    const superadmin = request.superadmin;
    if (!superadmin) return false;

    const ability = this.caslAbilityFactory.createForSuperadmin(superadmin);
    return ability.can(Action.Manage, 'all'); // Gunakan enum
  }
}
