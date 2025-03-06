import { HttpException, Inject, Injectable, Logger } from '@nestjs/common';
import {
  RegisterSuperadminRequest,
  SuperadminResponse,
} from '../model/superadmin.model';
import { ValidationService } from '../common/validation.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from '../common/prisma.service';
import { SuperadminValidation } from './superadmin.validation';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SuperadminService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER)
    private logger: Logger,
    private prismaService: PrismaService,
  ) {}

  async register(
    request: RegisterSuperadminRequest,
  ): Promise<SuperadminResponse> {
    const registerRequest = this.validationService.validate(
      SuperadminValidation.REGISTER,
      request,
    ) as RegisterSuperadminRequest;

    const totalUserWithSameUsername = await this.prismaService.superadmin.count(
      {
        where: {
          username: registerRequest.username,
        },
      },
    );

    if (totalUserWithSameUsername != 0) {
      throw new HttpException('Username already exists', 400);
    }

    registerRequest.password = await bcrypt.hash(registerRequest.password, 10);

    const superadmin = await this.prismaService.superadmin.create({
      data: registerRequest,
    });

    return {
      username: superadmin.username,
      full_name: superadmin.full_name,
    };
  }

  async login(request: LoginUserRequest): Promise<UserResponse> {
    this.logger.debug(`UserService.login(${JSON.stringify(request)})`);
    const loginRequest = this.validationService.validate(
      UserValidation.LOGIN,
      request,
    );

    let user = await this.prismaService.user.findUnique({
      where: {
        username: loginRequest.username,
      },
    });

    if (!user) {
      throw new HttpException('Username or password is invalid', 401);
    }

    const isPasswordValid = await bcrypt.compare(
      loginRequest.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new HttpException('Username or password is invalid', 401);
    }

    user = await this.prismaService.user.update({
      where: {
        username: loginRequest.username,
      },
      data: {
        token: uuid(),
      },
    });
    return {
      username: user.username,
      name: user.name,
      token: user.token ?? undefined,
    };
  }
}
