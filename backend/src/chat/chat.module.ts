import { Module, forwardRef } from '@nestjs/common';
import { FriendsController } from './friends/friends.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChannelController } from './channel/channel.controller';
import { ChannelService } from './channel/channel.service';
import { UserService } from './blockedUser/user.service';
import { UserController } from './blockedUser/blockedUser.controller';
import { ChannelMemberService } from './channel-member/channel-member.service';
import { ChatGateway } from './chat.gateway';
import { MessageService } from './message/message.service';
import { MessageController } from './message/message.controller';
import { BlockedUserService } from './blockedUser/blockedUser.service';

@Module({
  controllers: [FriendsController, ChannelController, UserController, MessageController],
  providers: [
    PrismaService, 
    ChannelService, 
    UserService, 
    ChannelMemberService,
    MessageService,
    ChatGateway,
    BlockedUserService,
  ],
  exports: [],
  imports: [
    forwardRef(() => ChatModule), // Handle circular dependencies if these services use each other
  ],
})
export class ChatModule {}

