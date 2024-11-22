import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { LoginModule } from './authentication/authentication.module';
import { UserModule } from './user/user.module';
// import { ChatGateway } from './chat/chat.gateway';
// import { ChannelService } from './chat/channel/channel.service';
// import { MessageService } from './chat/message/message.service';
// import { ChatModule } from './chat/chat.module';
import { UserService } from './user/user.service';
import { GameGateway } from './game/game.gateway';
import { GameController } from './game/game.controller';
// import { ChannelMemberService } from './chat/channel-member/channel-member.service';

@Module({
  imports: [PrismaModule, LoginModule, UserModule],
  providers: [PrismaService, UserService, GameGateway],
  exports: [PrismaService],
  controllers: [GameController],
})
export class AppModule {}
