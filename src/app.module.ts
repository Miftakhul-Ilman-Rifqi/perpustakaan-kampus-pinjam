import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { SuperadminModule } from './superadmin/superadmin.module';
import { StudentModule } from './student/student.module';
import { APP_GUARD } from '@nestjs/core';
import { AbilitiesGuard } from './common/casl/abilities.guard';
import { BookModule } from './book/book.module';

@Module({
  imports: [CommonModule, SuperadminModule, StudentModule, BookModule],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AbilitiesGuard,
    },
  ],
})
export class AppModule {}
