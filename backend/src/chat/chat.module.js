var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module, forwardRef } from '@nestjs/common';
import { FriendsController } from './friends/friends.controller';
import { PrismaService } from "../prisma/prisma.service";
import { ChannelController } from './channel/channel.controller';
import { ChannelService } from './channel/channel.service';
import { UserService } from './user/user.service';
import { UserController } from './user/user.controller';
import { ChannelMemberService } from './channel-member/channel-member.service';
import { ChatGateway } from './chat.gateway';
import { MessageService } from './message/message.service';
let ChatModule = class ChatModule {
};
ChatModule = __decorate([
    Module({
        controllers: [FriendsController, ChannelController, UserController],
        providers: [
            PrismaService,
            ChannelService,
            UserService,
            ChannelMemberService,
            MessageService,
            ChatGateway,
        ],
        exports: [ChannelService, ChannelMemberService],
        imports: [
            forwardRef(() => ChatModule), // Handle circular dependencies if these services use each other
        ],
    })
], ChatModule);
export { ChatModule };
