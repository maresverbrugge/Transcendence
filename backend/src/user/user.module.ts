import { Module } from '@nestjs/common';

import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoginService } from '../authentication//login/login.service';
import { AchievementService } from './achievement.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, LoginService, AchievementService],
  exports: [UserService, AchievementService], // If other modules need to use UserService
})
export class UserModule {}
