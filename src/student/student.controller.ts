import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
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
import { CheckAbilities } from '../common/casl/abilities.decorator';

@Controller(`/api/student`)
export class StudentController {
  constructor(private studentService: StudentService) {}

  @Get('/:id')
  @UseGuards(AbilitiesGuard)
  // @CanReadOne('Student')
  @CheckAbilities({ action: 'manage', subject: 'Student' }) // Hanya SUPERADMIN (yang bisa melakukan semua aksi)
  @HttpCode(HttpStatus.OK)
  async get(@Param('id') id: string): Promise<WebResponse<StudentResponse>> {
    const request: GetStudentRequest = { id };
    const result = await this.studentService.get(request);
    return { data: result };
  }

  @Get()
  @UseGuards(AbilitiesGuard)
  // @CanRead('Student')
  @CheckAbilities({ action: 'manage', subject: 'Student' }) // SUPERADMIN dan OPERATOR (keduanya bisa read)
  @HttpCode(HttpStatus.OK)
  async list(): Promise<WebResponse<StudentResponse[]>> {
    const result = await this.studentService.list();
    return { data: result };
  }

  @Post('/search')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: 'manage', subject: 'Student' }) // SUPERADMIN dan OPERATOR (keduanya bisa search/read)
  @HttpCode(HttpStatus.OK)
  async search(
    @Body() request: SearchStudentRequest,
  ): Promise<WebResponse<StudentResponse[]>> {
    const result = await this.studentService.search(request);
    return {
      data: result.data,
      paging: result.paging,
    };
  }
}
