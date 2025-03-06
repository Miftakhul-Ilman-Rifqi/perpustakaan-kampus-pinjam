import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { SuperadminService } from './superadmin.service';
import {
  RegisterSuperadminRequest,
  SuperadminResponse,
} from '../model/superadmin.model';
import { WebResponse } from '../model/web.model';
import { Auth } from '../common/auth.decorator';

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

  @Get('/current')
  @HttpCode(200)
  async get(@Auth() superadmin: Superadmin): Promise<WebResponse<UserResponse>> {
    const result = await this.userService.get(user);
    return {
      data: result,
    };
  }
}
