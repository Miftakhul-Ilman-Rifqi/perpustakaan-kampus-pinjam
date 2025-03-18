import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WebResponse } from '../model/web.model';
import { AbilitiesGuard } from '../common/casl/abilities.guard';
import { CanManage } from '../common/casl/abilities.decorator';
import { LoanService } from './loan.service';
import {
  CreateLoanRequest,
  GetLoanRequest,
  LoanResponse,
  RemoveLoanRequest,
  SearchLoanRequest,
  UpdateLoanRequest,
} from '../model/loan.model';
import { LoanStatus } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  // getSchemaPath,
} from '@nestjs/swagger';

@ApiTags('Loan')
@Controller(`/api/loans`)
export class LoanController {
  constructor(private loanService: LoanService) {}

  @Get('/search')
  @UseGuards(AbilitiesGuard)
  @CanManage('Loan')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mencari peminjaman berdasarkan filter' })
  @ApiQuery({
    name: 'nim',
    required: false,
    description: 'Filter berdasarkan NIM mahasiswa',
  })
  @ApiQuery({
    name: 'full_name',
    required: false,
    description: 'Filter berdasarkan nama mahasiswa',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter berdasarkan status peminjaman',
    enum: LoanStatus,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Nomor halaman',
    type: Number,
  })
  @ApiQuery({
    name: 'size',
    required: false,
    description: 'Jumlah data per halaman',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Pencarian berhasil',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/LoanResponse' },
        },
        paging: { $ref: '#/components/schemas/Paging' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Tidak terautentikasi' })
  @ApiResponse({ status: 403, description: 'Tidak memiliki akses' })
  async search(
    @Query('nim') nim?: string,
    @Query('full_name') full_name?: string,
    @Query('status') status?: LoanStatus,
    @Query('page', new ParseIntPipe({ optional: true }))
    page: number = 1,
    @Query('size', new ParseIntPipe({ optional: true }))
    size: number = 10,
  ): Promise<WebResponse<LoanResponse[]>> {
    const request: SearchLoanRequest = {
      nim,
      full_name,
      status,
      page,
      size,
    };
    const result = await this.loanService.search(request);
    return {
      data: result.data,
      paging: result.paging,
    };
  }

  @Post()
  @UseGuards(AbilitiesGuard)
  @CanManage('Loan')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Membuat peminjaman baru' })
  @ApiBody({ type: CreateLoanRequest })
  @ApiCreatedResponse({
    description: 'Peminjaman berhasil dibuat',
    schema: {
      properties: {
        data: { $ref: '#/components/schemas/LoanResponse' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Request tidak valid' })
  @ApiResponse({ status: 401, description: 'Tidak terautentikasi' })
  @ApiResponse({ status: 403, description: 'Tidak memiliki akses' })
  @ApiResponse({
    status: 404,
    description: 'Mahasiswa atau buku tidak ditemukan',
  })
  async create(
    @Body() request: CreateLoanRequest,
  ): Promise<WebResponse<LoanResponse>> {
    const result = await this.loanService.create(request);
    return { data: result };
  }

  @Get('/:id')
  @UseGuards(AbilitiesGuard)
  @CanManage('Loan')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mendapatkan detail peminjaman berdasarkan ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID peminjaman' })
  @ApiResponse({
    status: 200,
    description: 'Detail peminjaman berhasil didapatkan',
    schema: {
      properties: {
        data: { $ref: '#/components/schemas/LoanResponse' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Tidak terautentikasi' })
  @ApiResponse({ status: 403, description: 'Tidak memiliki akses' })
  @ApiResponse({ status: 404, description: 'Peminjaman tidak ditemukan' })
  async get(@Param('id') id: string): Promise<WebResponse<LoanResponse>> {
    const request: GetLoanRequest = { id };
    const result = await this.loanService.get(request);
    return { data: result };
  }

  @Patch('/:id')
  @UseGuards(AbilitiesGuard)
  @CanManage('Loan')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mengupdate status peminjaman' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID peminjaman' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: Object.values(LoanStatus),
          example: 'RETURNED',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Peminjaman berhasil diupdate',
    schema: {
      properties: {
        data: { $ref: '#/components/schemas/LoanResponse' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Request tidak valid' })
  @ApiResponse({ status: 401, description: 'Tidak terautentikasi' })
  @ApiResponse({ status: 403, description: 'Tidak memiliki akses' })
  @ApiResponse({ status: 404, description: 'Peminjaman tidak ditemukan' })
  async update(
    @Param('id') id: string,
    @Body() updateData: { status: LoanStatus },
  ): Promise<WebResponse<LoanResponse>> {
    const request: UpdateLoanRequest = { id, ...updateData };
    const result = await this.loanService.update(request);
    return { data: result };
  }

  @Delete('/:id')
  @UseGuards(AbilitiesGuard)
  @CanManage('Loan')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Menghapus peminjaman' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID peminjaman' })
  @ApiResponse({
    status: 200,
    description: 'Peminjaman berhasil dihapus',
    schema: {
      properties: {
        data: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Tidak terautentikasi' })
  @ApiResponse({ status: 403, description: 'Tidak memiliki akses' })
  @ApiResponse({ status: 404, description: 'Peminjaman tidak ditemukan' })
  async remove(@Param('id') id: string): Promise<WebResponse<boolean>> {
    const request: RemoveLoanRequest = { id };
    const result = await this.loanService.remove(request);
    return { data: result };
  }

  @Get()
  @UseGuards(AbilitiesGuard)
  @CanManage('Loan')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mendapatkan semua data peminjaman' })
  @ApiResponse({
    status: 200,
    description: 'Daftar peminjaman berhasil didapatkan',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/LoanResponse' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Tidak terautentikasi' })
  @ApiResponse({ status: 403, description: 'Tidak memiliki akses' })
  async list(): Promise<WebResponse<LoanResponse[]>> {
    const result = await this.loanService.list();
    return { data: result };
  }
}
