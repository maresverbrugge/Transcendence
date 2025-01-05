import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { LoginModule } from './authentication/authentication.module';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [PrismaModule, LoginModule, UserModule, ChatModule],
  providers: [],
  exports: [],
  controllers: [],
})
export class AppModule {}
