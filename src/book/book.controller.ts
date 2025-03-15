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

@Controller(`/api/books`)
export class BookController {
  constructor(private bookService: BookService) {}

  @Get('/search')
  @UseGuards(AbilitiesGuard)
  @CanManage('Book')
  @HttpCode(HttpStatus.OK)
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

  @Delete('/:id')
  @UseGuards(AbilitiesGuard)
  @CanManage('Book')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<WebResponse<boolean>> {
    const request: RemoveBookRequest = { id };
    const result = await this.bookService.remove(request);
    return { data: result };
  }

  @Get()
  @UseGuards(AbilitiesGuard)
  @CanManage('Book')
  @HttpCode(HttpStatus.OK)
  async list(): Promise<WebResponse<BookResponse[]>> {
    const result = await this.bookService.list();
    return { data: result };
  }
}
