import { Module, forwardRef } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { PrismaService } from '../prisma/prisma.service';
import { GameService } from './game.service';
import { LoginService } from 'src/authentication/login/login.service';
import { GameController } from './game.controller';
import { MatchmakingGateway } from 'src/matchmaking/matchmaking.gateway';
import { GameGateway } from './game.gateway';
import { UserModule } from 'src/user/user.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LoginModule } from 'src/authentication/authentication.module';
import { ErrorHandlingService } from 'src/error-handling/error-handling.service';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  controllers: [GameController],
  providers: [UserService, PrismaService, LoginService, GameService, ErrorHandlingService, GameGateway, MatchmakingGateway],
  exports: [],
  imports: [
	  PrismaModule,
	  forwardRef(() => ChatModule),
	  forwardRef(() => UserModule),
	  forwardRef(() => LoginModule),
	],
})
export class GameModule {}