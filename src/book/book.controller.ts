import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
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
  UpdateBookRequest,
} from '../model/book.model';

@Controller(`/api/books`)
export class BookController {
  constructor(private bookService: BookService) {}

  @Post()
  @UseGuards(AbilitiesGuard)
  @CanManage('Book')
  @HttpCode(HttpStatus.CREATED)
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
  async get(@Param('id') id: string): Promise<WebResponse<BookResponse>> {
    const request: GetBookRequest = { id };
    const result = await this.bookService.get(request);
    return { data: result };
  }

  @Patch('/:id')
  @UseGuards(AbilitiesGuard)
  @CanManage('Book')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateBookRequest>,
  ): Promise<WebResponse<BookResponse>> {
    const request: UpdateBookRequest = { id, ...updateData };
    const result = await this.bookService.update(request);
    return { data: result };
  }

  // @Get('/search')
  // @UseGuards(AbilitiesGuard)
  // @CheckAbilities({ action: 'manage', subject: 'Student' }) // SUPERADMIN dan OPERATOR (keduanya bisa search/read)
  // @HttpCode(HttpStatus.OK)
  // async search(
  //   @Query('full_name') full_name?: string,
  //   @Query('nim') nim?: string,
  //   @Query('page', new ParseIntPipe({ optional: true }))
  //   page: number = 1,
  //   @Query('size', new ParseIntPipe({ optional: true }))
  //   size: number = 10,
  // ): Promise<WebResponse<StudentResponse[]>> {
  //   const request: SearchStudentRequest = {
  //     full_name,
  //     nim,
  //     page,
  //     size,
  //   };

  //   const result = await this.studentService.search(request);
  //   return {
  //     data: result.data,
  //     paging: result.paging,
  //   };
  // }

  // @Get('/:id')
  // @UseGuards(AbilitiesGuard)
  // @CanManage('Student')
  // // @CheckAbilities({ action: 'manage', subject: 'Student' }) // Hanya SUPERADMIN (yang bisa melakukan semua aksi)
  // @HttpCode(HttpStatus.OK)
  // async get(@Param('id') id: string): Promise<WebResponse<StudentResponse>> {
  //   const request: GetStudentRequest = { id };
  //   const result = await this.studentService.get(request);
  //   return { data: result };
  // }

  // @Get()
  // @UseGuards(AbilitiesGuard)
  // @CanManage('Student')
  // // @CheckAbilities({ action: 'manage', subject: 'Student' }) // SUPERADMIN dan OPERATOR (keduanya bisa read)
  // @HttpCode(HttpStatus.OK)
  // async list(): Promise<WebResponse<StudentResponse[]>> {
  //   const result = await this.studentService.list();
  //   return { data: result };
  // }
}
