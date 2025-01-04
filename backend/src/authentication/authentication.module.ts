import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { PrismaService } from 'src/prisma/prisma.service';

import { LoginController } from './login/login.controller';
import { LoginService } from './login/login.service';
import { TwoFactorController } from './two-factor/two-factor.controller';
import { TwoFactorService } from './two-factor/two-factor.service';

@Module({
  imports: [CacheModule.register({ isGlobal: true })],
  controllers: [LoginController, TwoFactorController],
  providers: [LoginService, TwoFactorService, PrismaService],
})
export class LoginModule {}
