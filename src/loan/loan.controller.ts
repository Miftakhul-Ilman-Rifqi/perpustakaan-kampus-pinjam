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
import { LoanService } from './loan.service';
import {
  CreateLoanRequest,
  GetLoanRequest,
  LoanResponse,
  RemoveLoanRequest,
  SearchLoanRequest,
  UpdateLoanRequest,
} from '../model/loan.model';
import { LoanStatus } from '@prisma/client';

@Controller(`/api/loans`)
export class LoanController {
  constructor(private loanService: LoanService) {}

  @Get('/search')
  @UseGuards(AbilitiesGuard)
  @CanManage('Loan')
  @HttpCode(HttpStatus.OK)
  async search(
    @Query('nim') nim?: string,
    @Query('full_name') full_name?: string,
    @Query('status') status?: LoanStatus,
    @Query('page', new ParseIntPipe({ optional: true }))
    page: number = 1,
    @Query('size', new ParseIntPipe({ optional: true }))
    size: number = 10,
  ): Promise<WebResponse<LoanResponse[]>> {
    const request: SearchLoanRequest = {
      nim,
      full_name,
      status,
      page,
      size,
    };

    const result = await this.loanService.search(request);
    return {
      data: result.data,
      paging: result.paging,
    };
  }

  @Post()
  @UseGuards(AbilitiesGuard)
  @CanManage('Loan')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() request: CreateLoanRequest,
  ): Promise<WebResponse<LoanResponse>> {
    const result = await this.loanService.create(request);
    return { data: result };
  }

  @Get('/:id')
  @UseGuards(AbilitiesGuard)
  @CanManage('Loan')
  @HttpCode(HttpStatus.OK)
  async get(@Param('id') id: string): Promise<WebResponse<LoanResponse>> {
    const request: GetLoanRequest = { id };
    const result = await this.loanService.get(request);
    return { data: result };
  }

  @Patch('/:id')
  @UseGuards(AbilitiesGuard)
  @CanManage('Loan')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateData: { status: LoanStatus },
  ): Promise<WebResponse<LoanResponse>> {
    const request: UpdateLoanRequest = { id, ...updateData };
    const result = await this.loanService.update(request);
    return { data: result };
  }

  @Delete('/:id')
  @UseGuards(AbilitiesGuard)
  @CanManage('Loan')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<WebResponse<boolean>> {
    const request: RemoveLoanRequest = { id };
    const result = await this.loanService.remove(request);
    return { data: result };
  }

  @Get()
  @UseGuards(AbilitiesGuard)
  @CanManage('Loan')
  @HttpCode(HttpStatus.OK)
  async list(): Promise<WebResponse<LoanResponse[]>> {
    const result = await this.loanService.list();
    return { data: result };
  }
}
