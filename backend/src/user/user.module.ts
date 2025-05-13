import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { LoginModule } from '../authentication/authentication.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AchievementService } from './achievement.service';
import { ErrorHandlingService } from '../error-handling/error-handling.service';

@Module({
  controllers: [UserController],
  providers: [UserService, ErrorHandlingService, AchievementService, ErrorHandlingService],
  exports: [UserService, AchievementService],
  imports: [forwardRef(() => LoginModule), PrismaModule]
})
export class UserModule {}
