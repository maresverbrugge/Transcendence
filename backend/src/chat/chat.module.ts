import { Module, forwardRef } from '@nestjs/common';
import { FriendsController } from './friends/friends.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChannelController } from './channel/channel.controller';
import { ChannelService } from './channel/channel.service';
import { UserService } from './user/user.service';
import { UserController } from './user/user.controller';
import { ChannelMemberService } from './channel-member/channel-member.service';

@Module({
  controllers: [FriendsController, ChannelController, UserController],
  providers: [
    PrismaService, 
    ChannelService, 
    UserService, 
    ChannelMemberService,
  ],
  exports: [ChannelService, ChannelMemberService],
  imports: [
    forwardRef(() => ChatModule), // Handle circular dependencies if these services use each other
  ],
})
export class ChatModule {}

