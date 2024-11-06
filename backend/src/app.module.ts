import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { LoginModule } from './login/login.module';
import { ChatGateway } from './chat/chat.gateway';
import { ChannelService } from './chat/channel/channel.service';
import { UserService } from './chat/user/user.service';
import { MessageService } from './chat/message/message.service';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [PrismaModule, LoginModule, ChatModule],
  providers: [PrismaService, ChatGateway, ChannelService, UserService, MessageService],
  exports: [PrismaService],
})
export class AppModule {}
