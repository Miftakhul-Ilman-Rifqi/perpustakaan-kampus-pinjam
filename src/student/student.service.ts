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

    // Using Prisma transaction for safety
    return await this.prismaService.$transaction(async (prisma) => {
      const student = await prisma.student.findUnique({
        where: { id: getRequest.id },
      });

      if (!student) {
        throw new HttpException('Student not found', HttpStatus.NOT_FOUND);
      }

      return this.toStudentResponse(student);
    });
  }

  async list(): Promise<StudentResponse[]> {
    // Using Prisma transaction for consistency
    return await this.prismaService.$transaction(async (prisma) => {
      const students = await prisma.student.findMany();

      if (students.length === 0) {
        throw new HttpException('Data not found', HttpStatus.NOT_FOUND);
      }

      return students.map((student) => this.toStudentResponse(student));
    });
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

    const skip = (searchRequest.page - 1) * searchRequest.size;

    // Using Prisma transaction for consistency
    return await this.prismaService.$transaction(async (prisma) => {
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
  }
}
