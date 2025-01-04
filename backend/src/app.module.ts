import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { LoginModule } from './authentication/authentication.module';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';
import { GameModule } from './game/game.module';

@Module({
  imports: [PrismaModule, LoginModule, UserModule, ChatModule, GameModule],
  providers: [PrismaService],
  exports: [PrismaService],
  controllers: [],
})
export class AppModule {}
