import { Module } from '@nestjs/common';
import { SuperadminService } from './superadmin.service';
import { SuperadminController } from './superadmin.controller';

@Module({
  providers: [SuperadminService],
  controllers: [SuperadminController],
  exports: [],
})
export class SuperadminModule {}
