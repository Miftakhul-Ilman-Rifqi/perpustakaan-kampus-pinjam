import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { SuperadminModule } from './superadmin/superadmin.module';
import { StudentModule } from './student/student.module';
import { APP_GUARD } from '@nestjs/core';
import { AbilitiesGuard } from './common/casl/abilities.guard';
import { BookModule } from './book/book.module';
import { LoanModule } from './loan/loan.module';
import { ThrottlerModule } from '@nestjs/throttler/dist/throttler.module';
import { ThrottlerGuard } from '@nestjs/throttler/dist/throttler.guard';

@Module({
  imports: [
    CommonModule,
    SuperadminModule,
    StudentModule,
    BookModule,
    LoanModule,
    // konfigurasi default untuk seluruh aplikasi
    ThrottlerModule.forRoot([
      {
        ttl: 5000, // 5 detik
        limit: 1, // 1 request per detik
      },
    ]),
    // ThrottlerModule.forRoot([
    //   {
    //     name: 'default', // Nama throttler
    //     ttl: 5000,
    //     limit: 1,
    //   },
    //   {
    //     name: 'medium', // Throttler khusus untuk login
    //     ttl: 60000,
    //     limit: 1,
    //   },
    // ]),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AbilitiesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
