import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GameService } from './game.service';
import { LoginService } from '../authentication/login/login.service';
import { GameController } from './game.controller';
import { MatchmakingGateway } from '../game/matchmaking/matchmaking.gateway';
import { GameGateway } from './game.gateway';
import { UserModule } from '../user/user.module';
import { ChatModule } from '../chat/chat.module';
import { ErrorHandlingService } from '../error-handling/error-handling.service';

@Module({
  controllers: [GameController],
  providers: [PrismaService, LoginService, GameService, ErrorHandlingService, GameGateway, MatchmakingGateway],
  exports: [],
  imports: [UserModule, ChatModule]
})
export class GameModule {}