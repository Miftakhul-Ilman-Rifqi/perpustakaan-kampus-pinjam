import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
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
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

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

    try {
      return await this.prismaService.$transaction(async (prisma) => {
        const superadmin = await prisma.superadmin.findUnique({
          where: { username: loginRequest.username },
        });

        if (!superadmin) {
          throw new HttpException(
            'Invalid credentials',
            HttpStatus.UNAUTHORIZED,
          );
        }

        const isValid = await bcrypt.compare(
          loginRequest.password,
          superadmin.password,
        );

        if (!isValid) {
          throw new HttpException(
            'Invalid credentials',
            HttpStatus.UNAUTHORIZED,
          );
        }

        const payload = { sub: superadmin.id, username: superadmin.username };
        const token = this.jwtService.sign(payload);

        return {
          username: superadmin.username,
          full_name: superadmin.full_name,
          token,
        };
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (error instanceof PrismaClientKnownRequestError) {
        this.logger.error(
          `Database error during login: ${error.code}`,
          error.stack,
        );
      }

      this.logger.error(`Failed to login: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to login',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
