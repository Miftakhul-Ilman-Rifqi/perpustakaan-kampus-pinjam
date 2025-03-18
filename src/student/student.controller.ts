import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StudentService } from './student.service';
import {
  GetStudentRequest,
  SearchStudentRequest,
  StudentResponse,
} from '../model/student.model';
import { WebResponse } from '../model/web.model';
import { AbilitiesGuard } from '../common/casl/abilities.guard';
import { CanManage, CheckAbilities } from '../common/casl/abilities.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Student')
@Controller(`/api/students`)
export class StudentController {
  constructor(private studentService: StudentService) {}

  @Get('/search')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: 'manage', subject: 'Student' })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mencari mahasiswa berdasarkan filter' })
  @ApiQuery({
    name: 'full_name',
    required: false,
    description: 'Filter berdasarkan nama lengkap',
  })
  @ApiQuery({
    name: 'nim',
    required: false,
    description: 'Filter berdasarkan NIM',
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
          items: { $ref: '#/components/schemas/StudentResponse' },
        },
        paging: { $ref: '#/components/schemas/Paging' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Tidak terautentikasi' })
  @ApiResponse({ status: 403, description: 'Tidak memiliki akses' })
  async search(
    @Query('full_name') full_name?: string,
    @Query('nim') nim?: string,
    @Query('page', new ParseIntPipe({ optional: true }))
    page: number = 1,
    @Query('size', new ParseIntPipe({ optional: true }))
    size: number = 10,
  ): Promise<WebResponse<StudentResponse[]>> {
    const request: SearchStudentRequest = {
      full_name,
      nim,
      page,
      size,
    };
    const result = await this.studentService.search(request);
    return {
      data: result.data,
      paging: result.paging,
    };
  }

  @Get('/:id')
  @UseGuards(AbilitiesGuard)
  @CanManage('Student')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mendapatkan detail mahasiswa berdasarkan ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID mahasiswa' })
  @ApiResponse({
    status: 200,
    description: 'Detail mahasiswa berhasil didapatkan',
    schema: {
      properties: {
        data: { $ref: '#/components/schemas/StudentResponse' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Tidak terautentikasi' })
  @ApiResponse({ status: 403, description: 'Tidak memiliki akses' })
  @ApiResponse({ status: 404, description: 'Mahasiswa tidak ditemukan' })
  async get(@Param('id') id: string): Promise<WebResponse<StudentResponse>> {
    const request: GetStudentRequest = { id };
    const result = await this.studentService.get(request);
    return { data: result };
  }

  @Get()
  @UseGuards(AbilitiesGuard)
  @CanManage('Student')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mendapatkan semua data mahasiswa' })
  @ApiResponse({
    status: 200,
    description: 'Daftar mahasiswa berhasil didapatkan',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/StudentResponse' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Tidak terautentikasi' })
  @ApiResponse({ status: 403, description: 'Tidak memiliki akses' })
  async list(): Promise<WebResponse<StudentResponse[]>> {
    const result = await this.studentService.list();
    return { data: result };
  }
}
