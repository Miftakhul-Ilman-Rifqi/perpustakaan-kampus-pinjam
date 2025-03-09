import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SuperadminService } from './superadmin.service';
import {
  LoginSuperadminRequest,
  SuperadminResponse,
} from '../model/superadmin.model';
import { WebResponse } from '../model/web.model';
import { Auth } from '../common/auth.decorator';
import { Superadmin } from '@prisma/client';
import { CaslGuard } from '../common/casl.guard';

@Controller(`/api/superadmin`)
export class SuperadminController {
  constructor(private superadminService: SuperadminService) {}

  @Post('/login')
  @HttpCode(200)
  async login(
    @Body() request: LoginSuperadminRequest,
  ): Promise<WebResponse<SuperadminResponse>> {
    const result = await this.superadminService.login(request);
    return { data: result };
  }

  @Delete('/current')
  @UseGuards(CaslGuard)
  @HttpCode(200)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async logout(@Auth() _superadmin: Superadmin): Promise<WebResponse<boolean>> {
    await Promise.resolve(true);
    return { data: true };
  }
}
