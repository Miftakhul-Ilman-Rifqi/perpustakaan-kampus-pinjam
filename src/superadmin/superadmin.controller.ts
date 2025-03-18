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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SkipThrottle } from '../common/throttler/throttler.decorator';

@ApiTags('Superadmin')
@Controller(`/api/superadmins`)
// Default rate limit untuk semua endpoint dalam controller ini
@SkipThrottle(false)
export class SuperadminController {
  constructor(private superadminService: SuperadminService) {}

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  // Menggunakan rate limiter dengan konfigurasi dinamis untuk login
  // Membatasi percobaan login menjadi 3 kali dalam 10 menit
  // @Throttle(3, 600000)
  // @Throttle({ name: 'default' })
  @ApiOperation({ summary: 'Login superadmin' })
  @ApiResponse({
    status: 200,
    description: 'Login sukses',
    type: SuperadminResponse,
  })
  @ApiResponse({ status: 400, description: 'Input tidak valid' })
  @ApiResponse({ status: 401, description: 'Kredensial tidak valid' })
  @ApiResponse({ status: 429, description: 'Terlalu banyak percobaan login' })
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
  // Melewati rate limiter untuk endpoint logout
  @SkipThrottle(true)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout superadmin' })
  @ApiResponse({
    status: 200,
    description: 'Logout sukses',
  })
  @ApiResponse({ status: 401, description: 'Tidak terautentikasi' })
  async logout(): Promise<WebResponse<boolean>> {
    await Promise.resolve(true);
    return { data: true };
  }
}
