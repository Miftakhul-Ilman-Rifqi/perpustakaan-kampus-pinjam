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
  GetStudentRequest,
  SearchStudentRequest,
  StudentResponse,
} from '../model/student.model';
import { StudentValidation } from './student.validation';
import { Student } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

interface Filter {
  full_name?: { contains: string };
  nim?: { contains: string };
}

@Injectable()
export class StudentService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER)
    private logger: Logger,
    private prismaService: PrismaService,
  ) {}

  private toStudentResponse(student: Student): StudentResponse {
    return {
      id: student.id,
      full_name: student.full_name,
      nim: student.nim,
    };
  }

  async get(request: GetStudentRequest): Promise<StudentResponse> {
    const getRequest = this.validationService.validate(
      StudentValidation.GET,
      request,
    ) as GetStudentRequest;

    try {
      return await this.prismaService.$transaction(async (prisma) => {
        const student = await prisma.student.findUniqueOrThrow({
          where: { id: getRequest.id },
        });

        return this.toStudentResponse(student);
      });
    } catch (error) {
      // Handle Prisma error
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2025': // Not found (invalid ID)
            throw new HttpException('Student not found', HttpStatus.NOT_FOUND);
          default:
            break;
        }
      }

      this.logger.error(`Failed to get student: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to get student',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async list(): Promise<StudentResponse[]> {
    try {
      return await this.prismaService.$transaction(async (prisma) => {
        const students = await prisma.student.findMany({
          orderBy: {
            full_name: 'asc',
          },
        });

        return students.map((student) => this.toStudentResponse(student));
      });
    } catch (error) {
      this.logger.error(
        `Failed to list students: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        'Failed to list students',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async search(request: SearchStudentRequest): Promise<{
    data: StudentResponse[];
    paging: {
      current_page: number;
      size: number;
      total_page: number;
    };
  }> {
    const searchRequest = this.validationService.validate(
      StudentValidation.SEARCH,
      {
        ...request,
        page: request.page || 1,
        size: request.size || 10,
      },
    ) as SearchStudentRequest;

    const filters: Filter[] = [];

    if (searchRequest.full_name) {
      filters.push({
        full_name: {
          contains: searchRequest.full_name,
        },
      });
    }

    if (searchRequest.nim) {
      filters.push({
        nim: {
          contains: searchRequest.nim,
        },
      });
    }

    try {
      // Using Prisma transaction for consistency
      return await this.prismaService.$transaction(async (prisma) => {
        const skip = (searchRequest.page - 1) * searchRequest.size;

        const students = await prisma.student.findMany({
          where: {
            AND: filters,
          },
          take: searchRequest.size,
          skip: skip,
        });

        const total = await prisma.student.count({
          where: {
            AND: filters,
          },
        });

        return {
          data: students.map((student) => this.toStudentResponse(student)),
          paging: {
            current_page: searchRequest.page,
            size: searchRequest.size,
            total_page: Math.ceil(total / searchRequest.size),
          },
        };
      });
    } catch (error) {
      this.logger.error(
        `Failed to search students: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        'Failed to search students',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
