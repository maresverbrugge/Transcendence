import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { LoginModule } from './authentication/authentication.module';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';
import { MatchmakingGateway } from './matchmaking/matchmaking.gateway';

@Module({
  imports: [PrismaModule, LoginModule, UserModule, ChatModule],
  providers: [PrismaService, MatchmakingGateway],
  exports: [PrismaService],
  controllers: [],
})
export class AppModule {}
