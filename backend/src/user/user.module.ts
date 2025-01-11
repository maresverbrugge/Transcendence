import { Module } from '@nestjs/common';

import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoginService } from '../authentication//login/login.service';
import { AchievementService } from './achievement.service';
import { ErrorHandlingService } from 'src/error-handling/error-handling.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, LoginService, AchievementService, ErrorHandlingService],
  exports: [UserService, AchievementService],
})
export class UserModule {}
