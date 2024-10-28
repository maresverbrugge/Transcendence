import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { LoginModule } from './login/login.module';
import { GameGateway } from './game/game.gateway';
import { CommunicationGateway } from './communication/communication.gateway';
import { ChannelService } from './communication/channel/channel.service';
import { UserService } from './communication/user/user.service';
import { MessageService } from './communication/message/message.service';

@Module({
  imports: [PrismaModule, LoginModule],
  providers: [PrismaService, CommunicationGateway, ChannelService, UserService, MessageService, GameGateway],
  exports: [PrismaService],
})
export class AppModule {}
