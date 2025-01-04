import { Module, forwardRef } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import { FriendsController } from './friends/friends.controller';
import { ChannelController } from './channel/channel.controller';
import { ChannelService } from './channel/channel.service';
import { UserService } from 'src/user/user.service';
import { UserController } from './blockedUser/blockedUser.controller';
import { ChannelMemberService } from './channel-member/channel-member.service';
import { ChatGateway } from './chat.gateway';
import { MessageService } from './message/message.service';
import { MessageController } from './message/message.controller';
import { BlockedUserService } from './blockedUser/blockedUser.service';
import { HashingService } from './hashing/hashing.service';
import { GameInviteService } from './gameInvite/game-invite.service';
import { LoginService } from 'src/authentication/login/login.service';

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
    HashingService,
    GameInviteService,
    LoginService,
  ],
  exports: [],
  imports: [
    forwardRef(() => ChatModule), // Handle circular dependencies if these services use each other
  ],
})
export class ChatModule {}
