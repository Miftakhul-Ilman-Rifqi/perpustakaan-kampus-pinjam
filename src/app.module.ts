import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { SuperadminModule } from './superadmin/superadmin.module';
import { CaslModule } from './casl/casl.module';

@Module({
  imports: [CommonModule, SuperadminModule, CaslModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
