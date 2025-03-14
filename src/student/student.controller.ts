import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Query,
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
import { CanManage, CheckAbilities } from '../common/casl/abilities.decorator';

@Controller(`/api/student`)
export class StudentController {
  constructor(private studentService: StudentService) {}

  @Get('/search')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: 'manage', subject: 'Student' }) // SUPERADMIN dan OPERATOR (keduanya bisa search/read)
  @HttpCode(HttpStatus.OK)
  async search(
    @Query('full_name') full_name?: string,
    @Query('nim') nim?: string,
    @Query('page', new ParseIntPipe({ optional: true }))
    page: number = 1,
    @Query('size', new ParseIntPipe({ optional: true }))
    size: number = 10,
  ): Promise<WebResponse<StudentResponse[]>> {
    const request: SearchStudentRequest = {
      full_name,
      nim,
      page,
      size,
    };

    const result = await this.studentService.search(request);
    return {
      data: result.data,
      paging: result.paging,
    };
  }

  @Get('/:id')
  @UseGuards(AbilitiesGuard)
  @CanManage('Student')
  // @CheckAbilities({ action: 'manage', subject: 'Student' }) // Hanya SUPERADMIN (yang bisa melakukan semua aksi)
  @HttpCode(HttpStatus.OK)
  async get(@Param('id') id: string): Promise<WebResponse<StudentResponse>> {
    const request: GetStudentRequest = { id };
    const result = await this.studentService.get(request);
    return { data: result };
  }

  @Get()
  @UseGuards(AbilitiesGuard)
  @CanManage('Student')
  // @CheckAbilities({ action: 'manage', subject: 'Student' }) // SUPERADMIN dan OPERATOR (keduanya bisa read)
  @HttpCode(HttpStatus.OK)
  async list(): Promise<WebResponse<StudentResponse[]>> {
    const result = await this.studentService.list();
    return { data: result };
  }
}
