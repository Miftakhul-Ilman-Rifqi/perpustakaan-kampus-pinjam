import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SuperadminService } from './superadmin.service';
import {
  LoginSuperadminRequest,
  SuperadminResponse,
} from '../model/superadmin.model';
import { WebResponse } from '../model/web.model';
import { AbilitiesGuard } from '../common/casl/abilities.guard';
import { CanManage } from '../common/casl/abilities.decorator';

@Controller(`/api/superadmins`)
export class SuperadminController {
  constructor(private superadminService: SuperadminService) {}

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() request: LoginSuperadminRequest,
  ): Promise<WebResponse<SuperadminResponse>> {
    const result = await this.superadminService.login(request);
    return { data: result };
  }

  @Delete('/current')
  @UseGuards(AbilitiesGuard)
  @CanManage('Superadmin')
  @HttpCode(HttpStatus.OK)
  async logout(): Promise<WebResponse<boolean>> {
    await Promise.resolve(true);
    return { data: true };
  }
}
