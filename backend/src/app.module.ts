import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { LoginModule } from './login/login.module';
import { ChatGateway } from './chat/chat.gateway';
import { ChannelService } from './chat/channel/channel.service';
import { MessageService } from './chat/message/message.service';
import { ChatModule } from './chat/chat.module';
import { UserModule } from './user/user.module';
import { TwoFactorModule } from './two-factor/two-factor.module';

@Module({
  imports: [PrismaModule, LoginModule, ChatModule, TwoFactorModule, UserModule],
  providers: [PrismaService, ChatGateway, ChannelService, MessageService],
  exports: [PrismaService],
  controllers: [],
})
export class AppModule {}
