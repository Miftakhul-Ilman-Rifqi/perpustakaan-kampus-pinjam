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
  UpdateBookRequest,
} from '../model/book.model';
import { BookValidation } from './book.validation';
import { Book } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

// interface Filter {
//   full_name?: { contains: string };
//   nim?: { contains: string };
// }

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
        // Buat buku baru
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
        error.code === 'P2002' // Unique constraint failed
      ) {
        throw new HttpException(
          'Book title already exists.',
          HttpStatus.CONFLICT,
        );
      }
      this.logger.error('Gagal membuat buku:', error.stack);
      throw new HttpException(
        'Gagal membuat buku.',
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
      const book = await this.prismaService.book.findUnique({
        where: {
          id: getRequest.id,
        },
      });

      if (!book) {
        throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
      }

      return this.toBookResponse(book);
    } catch (error) {
      this.logger.error(`Failed to get book: ${error.message}`, error.stack);
      throw error;
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

  // async remove(request: RemoveBookRequest): Promise<boolean> {
  //   const removeRequest = this.validationService.validate(
  //     BookValidation.REMOVE,
  //     request,
  //   ) as RemoveBookRequest;

  //   try {
  //     // Di sini Anda bisa menambahkan logika untuk memeriksa apakah buku sedang dipinjam
  //     // Misalnya jika ada model Loan, periksa apakah ada pinjaman aktif untuk buku ini

  //     await this.prismaService.book.delete({
  //       where: {
  //         id: removeRequest.id,
  //       },
  //     });

  //     return true;
  //   } catch (error) {
  //     this.logger.error(`Failed to remove book: ${error.message}`, error.stack);

  //     // Jika error terkait foreign key constraint (buku sedang dipinjam)
  //     if (error.code === 'P2003') {
  //       throw new HttpException(
  //         'Book has active loans',
  //         HttpStatus.BAD_REQUEST,
  //       );
  //     }

  //     throw error;
  //   }
  // }

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

  // async get(request: GetStudentRequest): Promise<StudentResponse> {
  //   const getRequest = this.validationService.validate(
  //     StudentValidation.GET,
  //     request,
  //   );

  //   // Using Prisma transaction for safety
  //   return await this.prismaService.$transaction(async (prisma) => {
  //     const student = await prisma.student.findUnique({
  //       where: { id: getRequest.id },
  //     });

  //     if (!student) {
  //       throw new HttpException('Student not found', HttpStatus.NOT_FOUND);
  //     }

  //     return {
  //       id: student.id,
  //       full_name: student.full_name,
  //       nim: student.nim,
  //     };
  //   });
  // }

  // async list(): Promise<StudentResponse[]> {
  //   // Using Prisma transaction for consistency
  //   return await this.prismaService.$transaction(async (prisma) => {
  //     const students = await prisma.student.findMany();

  //     if (students.length === 0) {
  //       throw new HttpException('Data not found', HttpStatus.NOT_FOUND);
  //     }

  //     return students.map((student) => ({
  //       id: student.id,
  //       full_name: student.full_name,
  //       nim: student.nim,
  //     }));
  //   });
  // }

  // async search(request: SearchStudentRequest): Promise<{
  //   data: StudentResponse[];
  //   paging: {
  //     current_page: number;
  //     size: number;
  //     total_page: number;
  //   };
  // }> {
  //   const searchRequest = this.validationService.validate(
  //     StudentValidation.SEARCH,
  //     {
  //       ...request,
  //       page: request.page || 1,
  //       size: request.size || 10,
  //     },
  //   ) as SearchStudentRequest;

  //   const filters: Filter[] = [];

  //   if (searchRequest.full_name) {
  //     filters.push({
  //       full_name: {
  //         contains: searchRequest.full_name,
  //       },
  //     });
  //   }

  //   if (searchRequest.nim) {
  //     filters.push({
  //       nim: {
  //         contains: searchRequest.nim,
  //       },
  //     });
  //   }

  //   const skip = (searchRequest.page - 1) * searchRequest.size;

  //   // Using Prisma transaction for consistency
  //   return await this.prismaService.$transaction(async (prisma) => {
  //     const students = await prisma.student.findMany({
  //       where: {
  //         AND: filters,
  //       },
  //       take: searchRequest.size,
  //       skip: skip,
  //     });

  //     const total = await prisma.student.count({
  //       where: {
  //         AND: filters,
  //       },
  //     });

  //     return {
  //       data: students.map((student) => ({
  //         id: student.id,
  //         full_name: student.full_name,
  //         nim: student.nim,
  //       })),
  //       paging: {
  //         current_page: searchRequest.page,
  //         size: searchRequest.size,
  //         total_page: Math.ceil(total / searchRequest.size),
  //       },
  //     };
  //   });
  // }
}
