import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { Socket } from 'socket.io';
import { User, Message } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

import { ChatGateway } from '../chat.gateway';
import { BlockedUserService } from '../blockedUser/blockedUser.service';
import { UserService } from '../blockedUser/user.service';
import { ChannelService } from '../channel/channel.service';

type action = 'demote' | 'makeAdmin' | 'mute' | 'kick' | 'ban' | 'join' | 'leave';

@Injectable()
export class MessageService {
  constructor(
    private prisma: PrismaService,
    private readonly userService: UserService,
    private readonly blockedUserService: BlockedUserService,
    @Inject(forwardRef(() => ChannelService))
    private readonly channelService: ChannelService,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway
  ) {}

  async getMessage(messageID: number, token: string): Promise<Message | null> {
    const blockedUserIDs = await this.blockedUserService.getBlockedUserIDsByWebsocketID(token); //change to token later
    const message = await this.prisma.message.findUnique({
      where: {
        ID: messageID,
      },
    });
    return blockedUserIDs.includes(message.senderID) ? null : message;
  }

  async getMessages(channelID: number, token: string): Promise<Message[]> {
    const blockedUserIDs = await this.blockedUserService.getBlockedUserIDsByWebsocketID(token); //change to token later
    const channel = await this.channelService.getChannelByID(channelID);
    const messages = channel.messages.filter((message) => !blockedUserIDs.includes(message.senderID));
    return messages;
  }

  async createMessage(channelID: number, senderID: number, content: string): Promise<Message> {
    const sender: User = await this.userService.getUserByUserID(senderID);
    if (!sender) throw new NotFoundException('User not found');

    return this.prisma.message.create({
      data: {
        content: content,
        senderName: sender.username,
        sender: {
          connect: { ID: senderID },
        },

        channel: {
          connect: { ID: channelID },
        },
      },
    });
  }

  async sendMessage(client: Socket, data: { channelID: number; token: string; content: string }) {
    try {
      await this.channelService.checkIsMuted(data.channelID, data.token);
      const sender = await this.userService.getUserBySocketID(data.token);
      const message = await this.createMessage(data.channelID, sender.ID, data.content);
      this.chatGateway.emitToRoom('newMessage', String(data.channelID), {
        channelID: data.channelID,
        messageID: message.ID,
      });
    } catch (error) {
      client.emit('error', error);
    }
  }

  async createActionLogMessage(channelID: number, username: string, action: action): Promise<Message> {
    const actionMessageMap = {
      demote: `${username} is no longer an Admin.`,
      makeAdmin: `${username} is now an Admin.`,
      mute: `${username} is now muted for 60 seconds.`,
      kick: `${username} has been kicked from the channel.`,
      ban: `${username} is now banned from the channel.`,
      join: `${username} has joined the channel.`,
      leave: `${username} has left the channel.`,
    };
    return this.prisma.message.create({
      data: {
        content: actionMessageMap[action],
        senderName: 'actionLog',
        channel: {
          connect: { ID: channelID },
        },
        sender: undefined,
      },
    });
  }

  async sendActionLogMessage(channelID: number, username: string, action: action) {
    const message = await this.createActionLogMessage(channelID, username, action);
    this.chatGateway.emitToRoom('newMessage', String(channelID), { channelID: channelID, messageID: message.ID });
  }
}
