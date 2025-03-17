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
  CreateLoanRequest,
  GetLoanRequest,
  LoanResponse,
  RemoveLoanRequest,
  SearchLoanRequest,
  UpdateLoanRequest,
} from '../model/loan.model';
import { LoanValidation } from './loan.validation';
import { Loan, LoanStatus } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

interface Filter {
  student?: {
    nim?: { contains: string };
    full_name?: { contains: string };
  };
  status?: LoanStatus;
}

@Injectable()
export class LoanService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER)
    private logger: Logger,
    private prismaService: PrismaService,
  ) {}

  private toLoanResponse(
    loan: Loan & {
      student: { nim: string; full_name: string };
      book: { title: string };
    },
  ): LoanResponse {
    return {
      id: loan.id,
      nim: loan.student.nim,
      full_name: loan.student.full_name,
      title: loan.book.title,
      status: loan.status,
    };
  }

  async create(request: CreateLoanRequest): Promise<LoanResponse> {
    const createRequest = this.validationService.validate(
      LoanValidation.CREATE,
      request,
    ) as CreateLoanRequest;

    try {
      return await this.prismaService.$transaction(async (prisma) => {
        // Check if student exists
        const student = await prisma.student.findUnique({
          where: { nim: createRequest.nim },
        });

        if (!student) {
          throw new HttpException('Student not found', HttpStatus.NOT_FOUND);
        }

        // Check if book exists and has stock
        const book = await prisma.book.findUnique({
          where: { id: createRequest.bookId },
        });

        if (!book) {
          throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
        }

        if (book.stock <= 0) {
          throw new HttpException('Book out of stock', HttpStatus.BAD_REQUEST);
        }

        // Check if student has pending loans
        const pendingLoans = await prisma.loan.count({
          where: {
            studentId: student.id,
            status: LoanStatus.APPROVED,
          },
        });

        if (pendingLoans > 0) {
          throw new HttpException(
            'Student has pending loans',
            HttpStatus.BAD_REQUEST,
          );
        }

        // Reduce book stock
        await prisma.book.update({
          where: { id: book.id },
          data: { stock: book.stock - 1 },
        });

        // Create loan
        const loan = await prisma.loan.create({
          data: {
            studentId: student.id,
            bookId: book.id,
            status: LoanStatus.APPROVED,
          },
          include: {
            student: {
              select: {
                nim: true,
                full_name: true,
              },
            },
            book: {
              select: {
                title: true,
              },
            },
          },
        });

        return this.toLoanResponse(loan);
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error('Failed to create loan:', error.stack);
      throw new HttpException(
        'Failed to create loan',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async get(request: GetLoanRequest): Promise<LoanResponse> {
    const getRequest = this.validationService.validate(
      LoanValidation.GET,
      request,
    ) as GetLoanRequest;

    try {
      return await this.prismaService.$transaction(async (prisma) => {
        const loan = await prisma.loan.findUniqueOrThrow({
          where: { id: getRequest.id },
          include: {
            student: {
              select: {
                nim: true,
                full_name: true,
              },
            },
            book: {
              select: {
                title: true,
              },
            },
          },
        });

        return this.toLoanResponse(loan);
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2025':
            throw new HttpException('Loan not found', HttpStatus.NOT_FOUND);
          default:
            break;
        }
      }

      this.logger.error(`Failed to get loan: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to get loan',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(request: UpdateLoanRequest): Promise<LoanResponse> {
    const updateRequest = this.validationService.validate(
      LoanValidation.UPDATE,
      request,
    ) as UpdateLoanRequest;

    try {
      return await this.prismaService.$transaction(async (prisma) => {
        // Check if loan exists
        const existingLoan = await prisma.loan.findUnique({
          where: { id: updateRequest.id },
        });

        if (!existingLoan) {
          throw new HttpException('Loan not found', HttpStatus.NOT_FOUND);
        }

        // Check if status transition is valid
        if (existingLoan.status === LoanStatus.RETURNED) {
          throw new HttpException(
            'Invalid status transition',
            HttpStatus.BAD_REQUEST,
          );
        }

        // If returning a book, increase book stock
        if (updateRequest.status === LoanStatus.RETURNED) {
          await prisma.book.update({
            where: { id: existingLoan.bookId },
            data: {
              stock: {
                increment: 1,
              },
            },
          });
        }

        // Update loan status
        const loan = await prisma.loan.update({
          where: { id: updateRequest.id },
          data: { status: updateRequest.status },
          include: {
            student: {
              select: {
                nim: true,
                full_name: true,
              },
            },
            book: {
              select: {
                title: true,
              },
            },
          },
        });

        return this.toLoanResponse(loan);
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(`Failed to update loan: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to update loan',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async list(): Promise<LoanResponse[]> {
    try {
      return await this.prismaService.$transaction(async (prisma) => {
        const loans = await prisma.loan.findMany({
          include: {
            student: {
              select: {
                nim: true,
                full_name: true,
              },
            },
            book: {
              select: {
                title: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        return loans.map((loan) => this.toLoanResponse(loan));
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(`Failed to list loans: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to list loans',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(request: RemoveLoanRequest): Promise<boolean> {
    const removeRequest = this.validationService.validate(
      LoanValidation.REMOVE,
      request,
    ) as RemoveLoanRequest;

    try {
      return await this.prismaService.$transaction(async (prisma) => {
        // Check if loan exists
        const loan = await prisma.loan.findUnique({
          where: { id: removeRequest.id },
        });

        if (!loan) {
          throw new HttpException('Data not found', HttpStatus.NOT_FOUND);
        }

        // If loan is approved, increase book stock
        if (loan.status === LoanStatus.APPROVED) {
          await prisma.book.update({
            where: { id: loan.bookId },
            data: {
              stock: {
                increment: 1,
              },
            },
          });
        }

        // Delete loan
        await prisma.loan.delete({
          where: { id: removeRequest.id },
        });

        return true;
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(`Failed to remove loan: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to remove loan',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async search(request: SearchLoanRequest): Promise<{
    data: LoanResponse[];
    paging: {
      current_page: number;
      size: number;
      total_page: number;
    };
  }> {
    const searchRequest = this.validationService.validate(
      LoanValidation.SEARCH,
      {
        ...request,
        page: request.page || 1,
        size: request.size || 10,
      },
    ) as SearchLoanRequest;

    try {
      return await this.prismaService.$transaction(async (prisma) => {
        const filter: Filter = {};

        if (searchRequest.nim || searchRequest.full_name) {
          filter.student = {};

          if (searchRequest.nim) {
            filter.student.nim = { contains: searchRequest.nim };
          }

          if (searchRequest.full_name) {
            filter.student.full_name = { contains: searchRequest.full_name };
          }
        }

        if (searchRequest.status) {
          filter.status = searchRequest.status;
        }

        const skip = (searchRequest.page - 1) * searchRequest.size;

        const loans = await prisma.loan.findMany({
          where: filter,
          include: {
            student: {
              select: {
                nim: true,
                full_name: true,
              },
            },
            book: {
              select: {
                title: true,
              },
            },
          },
          take: searchRequest.size,
          skip: skip,
          orderBy: {
            createdAt: 'desc',
          },
        });

        const total = await prisma.loan.count({
          where: filter,
        });

        return {
          data: loans.map((loan) => this.toLoanResponse(loan)),
          paging: {
            current_page: searchRequest.page,
            size: searchRequest.size,
            total_page: Math.ceil(total / searchRequest.size),
          },
        };
      });
    } catch (error) {
      this.logger.error(
        `Failed to search loans: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        'Failed to search loans',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
