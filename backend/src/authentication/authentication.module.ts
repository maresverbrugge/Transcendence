import { Module } from '@nestjs/common';
import { LoginController } from './login.controller';
import { LoginService } from './login.service';
import { TwoFactorController } from './two-factor.controller';
import { TwoFactorService } from './two-factor.service';

@Module({
  controllers: [LoginController, TwoFactorController],
  providers: [LoginService, TwoFactorService],
})
export class LoginModule {}
