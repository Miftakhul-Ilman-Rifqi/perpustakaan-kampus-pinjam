import { Request } from 'express';
import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Superadmin } from '@prisma/client';

interface RequestWithSuperadmin extends Request {
  superadmin?: Superadmin;
}

export const Auth = createParamDecorator(
  (data: unknown, context: ExecutionContext): Superadmin => {
    const request = context.switchToHttp().getRequest<RequestWithSuperadmin>();
    const superadmin = request.superadmin;

    if (!superadmin) {
      throw new HttpException(
        'Authentication required',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return superadmin;
  },
);
