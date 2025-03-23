import { Module, forwardRef } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';

import { LoginController } from './login/login.controller';
import { LoginService } from './login/login.service';
import { TwoFactorController } from './two-factor/two-factor.controller';
import { TwoFactorService } from './two-factor/two-factor.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ChatModule } from 'src/chat/chat.module';
import { ErrorHandlingService } from 'src/error-handling/error-handling.service';

@Module({
  imports: [CacheModule.register({ isGlobal: true }), PrismaModule, forwardRef(() => ChatModule)],
  controllers: [LoginController, TwoFactorController],
  providers: [LoginService, TwoFactorService, ErrorHandlingService],
  exports: [LoginService],
})
export class LoginModule {}
