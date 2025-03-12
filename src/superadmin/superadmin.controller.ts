import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { SuperadminService } from './superadmin.service';
import {
  LoginSuperadminRequest,
  SuperadminResponse,
} from '../model/superadmin.model';
import { WebResponse } from '../model/web.model';

@Controller(`/api/superadmin`)
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
  @HttpCode(HttpStatus.OK)
  async logout(): Promise<WebResponse<boolean>> {
    await Promise.resolve(true);
    return { data: true };
  }
}
