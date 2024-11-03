import { Module } from '@nestjs/common';
import { TwoFactorService } from './two-factor.service';
import { TwoFactorController } from './two-factor.controller';

@Module({
  providers: [TwoFactorService],
  controllers: [TwoFactorController]
})
export class TwoFactorModule {}
