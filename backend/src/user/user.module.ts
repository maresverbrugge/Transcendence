import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoginService } from '../authentication//login/login.service';
import { ErrorHandlingService } from 'src/error-handling/error-handling.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, LoginService, ErrorHandlingService],
  exports: [UserService], // If other modules need to use UserService
})
export class UserModule {}
