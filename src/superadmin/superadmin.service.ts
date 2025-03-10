import { HttpException, Inject, Injectable, Logger } from '@nestjs/common';
import {
  LoginSuperadminRequest,
  SuperadminResponse,
} from '../model/superadmin.model';
import { ValidationService } from '../common/validation.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from '../common/prisma.service';
import { SuperadminValidation } from './superadmin.validation';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class SuperadminService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER)
    private logger: Logger,
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(request: LoginSuperadminRequest): Promise<SuperadminResponse> {
    const loginRequest = this.validationService.validate(
      SuperadminValidation.LOGIN,
      request,
    ) as LoginSuperadminRequest;

    const superadmin = await this.prismaService.superadmin.findUnique({
      where: { username: loginRequest.username },
    });

    if (!superadmin) {
      throw new HttpException('Invalid credentials', 401);
    }

    const isValid = await bcrypt.compare(
      loginRequest.password,
      superadmin.password,
    );

    if (!isValid) {
      throw new HttpException('Invalid credentials', 401);
    }

    const payload = { sub: superadmin.id, username: superadmin.username };
    const token = this.jwtService.sign(payload); // Otomatis pakai private key dari config

    return {
      username: superadmin.username,
      full_name: superadmin.full_name,
      token,
    };
  }
}
