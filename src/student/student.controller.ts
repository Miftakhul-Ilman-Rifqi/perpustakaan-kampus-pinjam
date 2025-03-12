import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { StudentService } from './student.service';
import {
  GetStudentRequest,
  SearchStudentRequest,
  StudentResponse,
} from '../model/student.model';
import { WebResponse } from '../model/web.model';

@Controller(`/api/student`)
export class StudentController {
  constructor(private studentService: StudentService) {}

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async get(@Param('id') id: string): Promise<WebResponse<StudentResponse>> {
    const request: GetStudentRequest = { id };
    const result = await this.studentService.get(request);
    return { data: result };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async list(): Promise<WebResponse<StudentResponse[]>> {
    const result = await this.studentService.list();
    return { data: result };
  }

  @Post('/search')
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
