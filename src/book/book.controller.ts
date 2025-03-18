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
import { BookService } from './book.service';
import {
  BookResponse,
  CreateBookRequest,
  GetBookRequest,
  RemoveBookRequest,
  SearchBookRequest,
  UpdateBookRequest,
} from '../model/book.model';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Book')
@Controller(`/api/books`)
export class BookController {
  constructor(private bookService: BookService) {}

  @Get('/search')
  @UseGuards(AbilitiesGuard)
  @CanManage('Book')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mencari buku berdasarkan filter' })
  @ApiQuery({
    name: 'id',
    required: false,
    description: 'Filter berdasarkan ID buku',
  })
  @ApiQuery({
    name: 'title',
    required: false,
    description: 'Filter berdasarkan judul buku',
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
          items: { $ref: '#/components/schemas/BookResponse' },
        },
        paging: { $ref: '#/components/schemas/Paging' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Tidak terautentikasi' })
  @ApiResponse({ status: 403, description: 'Tidak memiliki akses' })
  async search(
    @Query('id') id?: string,
    @Query('title') title?: string,
    @Query('page', new ParseIntPipe({ optional: true }))
    page: number = 1,
    @Query('size', new ParseIntPipe({ optional: true }))
    size: number = 10,
  ): Promise<WebResponse<BookResponse[]>> {
    const request: SearchBookRequest = {
      id,
      title,
      page,
      size,
    };
    const result = await this.bookService.search(request);
    return {
      data: result.data,
      paging: result.paging,
    };
  }

  @Post()
  @UseGuards(AbilitiesGuard)
  @CanManage('Book')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Membuat buku baru' })
  @ApiBody({ type: CreateBookRequest })
  @ApiCreatedResponse({
    description: 'Buku berhasil dibuat',
    schema: {
      properties: {
        data: { $ref: '#/components/schemas/BookResponse' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Request tidak valid' })
  @ApiResponse({ status: 401, description: 'Tidak terautentikasi' })
  @ApiResponse({ status: 403, description: 'Tidak memiliki akses' })
  async create(
    @Body() request: CreateBookRequest,
  ): Promise<WebResponse<BookResponse>> {
    const result = await this.bookService.create(request);
    return { data: result };
  }

  @Get('/:id')
  @UseGuards(AbilitiesGuard)
  @CanManage('Book')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mendapatkan detail buku berdasarkan ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID buku' })
  @ApiResponse({
    status: 200,
    description: 'Detail buku berhasil didapatkan',
    schema: {
      properties: {
        data: { $ref: '#/components/schemas/BookResponse' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Tidak terautentikasi' })
  @ApiResponse({ status: 403, description: 'Tidak memiliki akses' })
  @ApiResponse({ status: 404, description: 'Buku tidak ditemukan' })
  async get(@Param('id') id: string): Promise<WebResponse<BookResponse>> {
    const request: GetBookRequest = { id };
    const result = await this.bookService.get(request);
    return { data: result };
  }

  @Patch('/:id')
  @UseGuards(AbilitiesGuard)
  @CanManage('Book')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mengupdate buku' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID buku' })
  @ApiBody({
    type: CreateBookRequest,
    description: 'Data untuk update buku (partial)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Buku berhasil diupdate',
    schema: {
      properties: {
        data: { $ref: '#/components/schemas/BookResponse' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Request tidak valid' })
  @ApiResponse({ status: 401, description: 'Tidak terautentikasi' })
  @ApiResponse({ status: 403, description: 'Tidak memiliki akses' })
  @ApiResponse({ status: 404, description: 'Buku tidak ditemukan' })
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateBookRequest>,
  ): Promise<WebResponse<BookResponse>> {
    const request: UpdateBookRequest = { id, ...updateData };
    const result = await this.bookService.update(request);
    return { data: result };
  }

  @Delete('/:id')
  @UseGuards(AbilitiesGuard)
  @CanManage('Book')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Menghapus buku' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID buku' })
  @ApiResponse({
    status: 200,
    description: 'Buku berhasil dihapus',
    schema: {
      properties: {
        data: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Tidak terautentikasi' })
  @ApiResponse({ status: 403, description: 'Tidak memiliki akses' })
  @ApiResponse({ status: 404, description: 'Buku tidak ditemukan' })
  async remove(@Param('id') id: string): Promise<WebResponse<boolean>> {
    const request: RemoveBookRequest = { id };
    const result = await this.bookService.remove(request);
    return { data: result };
  }

  @Get()
  @UseGuards(AbilitiesGuard)
  @CanManage('Book')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mendapatkan semua data buku' })
  @ApiResponse({
    status: 200,
    description: 'Daftar buku berhasil didapatkan',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/BookResponse' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Tidak terautentikasi' })
  @ApiResponse({ status: 403, description: 'Tidak memiliki akses' })
  async list(): Promise<WebResponse<BookResponse[]>> {
    const result = await this.bookService.list();
    return { data: result };
  }
}
