import { Module } from '@nestjs/common';
import { LoanService } from './loan.service';
import { LoanController } from './loan.controller';

@Module({
  providers: [LoanService],
  controllers: [LoanController],
  exports: [],
  imports: [],
})
export class LoanModule {}
