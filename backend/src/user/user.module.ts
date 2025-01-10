import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ErrorHandlingService } from 'src/error-handling/error-handling.service';
import { LoginModule } from 'src/authentication/authentication.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [UserController],
  providers: [UserService, ErrorHandlingService],
  exports: [UserService], // If other modules need to use UserService
  imports: [forwardRef(() => LoginModule), PrismaModule]
})
export class UserModule {}
