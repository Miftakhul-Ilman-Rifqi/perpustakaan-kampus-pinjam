import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { SuperadminModule } from './superadmin/superadmin.module';
import { StudentModule } from './student/student.module';

@Module({
  imports: [CommonModule, SuperadminModule, StudentModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
