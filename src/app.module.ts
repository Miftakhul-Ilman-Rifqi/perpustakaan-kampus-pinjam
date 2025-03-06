import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { SuperadminModule } from './superadmin/superadmin.module';

@Module({
  imports: [CommonModule, SuperadminModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
