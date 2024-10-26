import { Module } from '@nestjs/common';
import { FriendsController } from './friends/friends.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChannelController } from './channel/channel.controller';


@Module({
  controllers: [FriendsController, ChannelController],
  providers: [PrismaService],

})
export class ChatModule {}
