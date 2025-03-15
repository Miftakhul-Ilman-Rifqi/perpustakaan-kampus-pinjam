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
        this.logger.error(
          `Gagal membuat buku, judul sudah ada: ${createRequest.title}`,
          error.stack,
        ); // Pakai error.stack untuk detail error
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
