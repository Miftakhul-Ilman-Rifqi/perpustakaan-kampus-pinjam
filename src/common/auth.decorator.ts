import { Request } from 'express';
import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
} from '@nestjs/common';
import { Superadmin } from '@prisma/client';

interface RequestWithUser extends Request {
  user?: Superadmin;
}

export const Auth = createParamDecorator(
  (data: unknown, context: ExecutionContext): Superadmin => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new HttpException('Unauthorized', 401);
    }

    return user;
  },
);
