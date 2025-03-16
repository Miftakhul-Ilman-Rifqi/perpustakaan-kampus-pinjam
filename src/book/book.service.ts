import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import {
  BookResponse,
  CreateBookRequest,
  GetBookRequest,
  RemoveBookRequest,
  SearchBookRequest,
  UpdateBookRequest,
} from '../model/book.model';
import { BookValidation } from './book.validation';
import { Book } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

interface Filter {
  id?: { contains: string };
  title?: { contains: string };
}

@Injectable()
export class BookService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER)
    private logger: Logger,
    private prismaService: PrismaService,
  ) {}

  private toBookResponse(book: Book): BookResponse {
    return {
      id: book.id,
      title: book.title,
      stock: book.stock,
    };
  }

  async create(request: CreateBookRequest): Promise<BookResponse> {
    const createRequest = this.validationService.validate(
      BookValidation.CREATE,
      request,
    ) as CreateBookRequest;

    try {
      return await this.prismaService.$transaction(async (prisma) => {
        const book = await prisma.book.create({
          data: {
            title: createRequest.title,
            stock: createRequest.stock,
          },
        });

        return this.toBookResponse(book);
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new HttpException(
          'Book title already exists.',
          HttpStatus.CONFLICT,
        );
      }
      this.logger.error('Failed to create book:', error.stack);
      throw new HttpException(
        'Failed to create book.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async get(request: GetBookRequest): Promise<BookResponse> {
    const getRequest = this.validationService.validate(
      BookValidation.GET,
      request,
    ) as GetBookRequest;

    try {
      return await this.prismaService.$transaction(async (prisma) => {
        const book = await prisma.book.findUniqueOrThrow({
          where: { id: getRequest.id },
        });

        return this.toBookResponse(book);
      });
    } catch (error) {
      // Handle Prisma error
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2025': // Not found (invalid ID)
            throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
          default:
            break;
        }
      }

      this.logger.error(`Failed to get book: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to get book',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(request: UpdateBookRequest): Promise<BookResponse> {
    const updateRequest = this.validationService.validate(
      BookValidation.UPDATE,
      request,
    ) as UpdateBookRequest;

    try {
      return await this.prismaService.$transaction(async (prisma) => {
        // Update buku
        const book = await prisma.book.update({
          where: {
            id: updateRequest.id,
          },
          data: {
            title: updateRequest.title,
            stock: updateRequest.stock,
          },
        });

        return this.toBookResponse(book);
      });
    } catch (error) {
      // Handle Prisma error
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2002': // Unique constraint (title already exists)
            throw new HttpException(
              'Book title already exists',
              HttpStatus.CONFLICT,
            );
          case 'P2025': // Not found (invalid ID)
            throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
          default:
            break;
        }
      }

      this.logger.error(`Failed to update book: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to update book',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async list(): Promise<BookResponse[]> {
    try {
      return await this.prismaService.$transaction(async (prisma) => {
        const books = await prisma.book.findMany({});

        return books.map((book) => this.toBookResponse(book));
      });
    } catch (error) {
      this.logger.error(`Failed to list books: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to list books',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(request: RemoveBookRequest): Promise<boolean> {
    const removeRequest = this.validationService.validate(
      BookValidation.REMOVE,
      request,
    ) as RemoveBookRequest;

    try {
      return await this.prismaService.$transaction(async (prisma) => {
        await prisma.book.delete({
          where: {
            id: removeRequest.id,
          },
        });

        return true;
      });
    } catch (error) {
      // Handle Prisma error
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2003':
            throw new HttpException(
              'Book has active loans',
              HttpStatus.BAD_REQUEST,
            );
          case 'P2025': // Not found (invalid ID)
            throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
          default:
            break;
        }
      }

      throw new HttpException(
        'Failed to remove book',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async search(request: SearchBookRequest): Promise<{
    data: BookResponse[];
    paging: {
      current_page: number;
      size: number;
      total_page: number;
    };
  }> {
    const searchRequest = this.validationService.validate(
      BookValidation.SEARCH,
      {
        ...request,
        page: request.page || 1,
        size: request.size || 10,
      },
    ) as SearchBookRequest;

    const filters: Filter[] = [];

    if (searchRequest.id) {
      filters.push({
        id: {
          contains: searchRequest.id,
        },
      });
    }

    if (searchRequest.title) {
      filters.push({
        title: {
          contains: searchRequest.title,
        },
      });
    }

    try {
      // Using Prisma transaction for consistency
      return await this.prismaService.$transaction(async (prisma) => {
        const skip = (searchRequest.page - 1) * searchRequest.size;

        const books = await prisma.book.findMany({
          where: {
            AND: filters,
          },
          take: searchRequest.size,
          skip: skip,
        });

        const total = await prisma.book.count({
          where: {
            AND: filters,
          },
        });

        return {
          data: books.map((book) => this.toBookResponse(book)),
          paging: {
            current_page: searchRequest.page,
            size: searchRequest.size,
            total_page: Math.ceil(total / searchRequest.size),
          },
        };
      });
    } catch (error) {
      this.logger.error(
        `Failed to search books: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        'Failed to search books',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
