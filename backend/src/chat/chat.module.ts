import { Module } from '@nestjs/common';
import { FriendsController } from './friends/friends.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChannelController } from './channel/channel.controller';
import { ChannelService } from './channel/channel.service';
import { UserService } from './user/user.service';


@Module({
  controllers: [FriendsController, ChannelController],
  providers: [PrismaService, ChannelService, UserService],
})
export class ChatModule {}
