import { Module } from '@nestjs/common';
import { CaslAbilityFactory } from '../common/casl-ability.factory';
import { CaslGuard } from '../common/casl.guard';

@Module({
  providers: [CaslAbilityFactory, CaslGuard],
  exports: [CaslAbilityFactory, CaslGuard],
})
export class CaslModule {}
