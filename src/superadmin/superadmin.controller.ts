import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { SuperadminService } from './superadmin.service';
import {
  RegisterSuperadminRequest,
  SuperadminResponse,
} from '../model/superadmin.model';
import { WebResponse } from '../model/web.model';

@Controller(`/api/superadmin`)
export class SuperadminController {
  constructor(private superadminService: SuperadminService) {}
  @Post()
  @HttpCode(200)
  async register(
    @Body() request: RegisterSuperadminRequest,
  ): Promise<WebResponse<SuperadminResponse>> {
    const result = await this.superadminService.register(request);
    return {
      data: result,
    };
  }
}
