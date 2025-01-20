import { Module } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { PrismaService } from '../prisma/prisma.service';
import { GameService } from './game.service';
import { LoginService } from 'src/authentication/login/login.service';
import { GameController } from './game.controller';
import { MatchmakingGateway } from 'src/matchmaking/matchmaking.gateway';
import { GameGateway } from './game.gateway';

@Module({
  controllers: [GameController],
  providers: [UserService, PrismaService, LoginService, GameService, GameGateway, MatchmakingGateway],
  exports: [UserService], // If other modules need to use UserService
})
export class GameModule {}