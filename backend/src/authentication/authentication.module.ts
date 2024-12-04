import { Module } from '@nestjs/common';
import { LoginController } from './login/login.controller';
import { LoginService } from './login/login.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { TwoFactorController } from './two-factor/two-factor.controller';
import { TwoFactorService } from './two-factor/two-factor.service';
import { UserService } from 'src/user/user.service';

@Module({
  controllers: [LoginController, TwoFactorController],
  providers: [LoginService, TwoFactorService, PrismaService, UserService],
})
export class LoginModule {}
