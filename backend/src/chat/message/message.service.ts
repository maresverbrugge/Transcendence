import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Message } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { BlockedUserService } from '../blockedUser/blockedUser.service';
import { ChannelService } from '../channel/channel.service';
import { LoginService } from 'src/authentication/login/login.service';
import { ErrorHandlingService } from 'src/error-handling/error-handling.service';
import { GatewayService } from '../gateway/gateway.service';

type action = 'demote' | 'makeAdmin' | 'mute' | 'kick' | 'ban' | 'join' | 'leave';

@Injectable()
export class MessageService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => LoginService))
    private readonly loginService: LoginService,
    private readonly blockedUserService: BlockedUserService,
    @Inject(forwardRef(() => ChannelService))
    private readonly channelService: ChannelService,
    @Inject(forwardRef(() => GatewayService))
    private readonly gatewayService: GatewayService,
    private readonly errorHandlingService: ErrorHandlingService,
  ) {}

  async getMessage(messageID: number, token: string): Promise<Message | null> {
    try {
      const blockedUserIDs = await this.blockedUserService.getBlockedUserIDsByToken(token);
      const message = await this.prisma.message.findUnique({
        where: { ID: messageID },
      });
      if (message)
        return blockedUserIDs.includes(message.senderID) ? null : message;
    } catch (error) {
      this.errorHandlingService.throwHttpException(error);
    }
  }

  async getMessages(channelID: number, token: string): Promise<Message[]> {
    const blockedUserIDs = await this.blockedUserService.getBlockedUserIDsByToken(token);
    const channel = await this.channelService.getChannelWithMembersAndMessagesByID(channelID);
    const messages = channel.messages.filter((message) => !blockedUserIDs.includes(message.senderID));
    return messages;
  }

  async enforceMessageLimit(channelID: number): Promise<void> {
    const messageCount = await this.prisma.message.count({
      where: { channelID },
    });
  
    if (messageCount > 80) {
      const oldestMessage = await this.prisma.message.findFirst({
        where: { channelID },
        orderBy: { createdAt: 'asc' },
      });
  
      if (oldestMessage) {
        await this.prisma.message.delete({
          where: { ID: oldestMessage.ID },
        });
      }
    }
  }

  async createMessage(channelID: number, senderID: number, content: string): Promise<Message> {
    try {
      const sender = await this.prisma.user.findUnique({where: {ID: senderID}, select: {ID:true, username: true, messagesSend: true}});
      const message = await this.prisma.message.create({
        data: {
          content: content,
          senderName: sender.username,
          sender: { connect: { ID: senderID } },
          channel: { connect: { ID: channelID } },
        },
      });
      await this.enforceMessageLimit(channelID);
      return message;
    } catch (error) {
      this.errorHandlingService.throwHttpException(error);
    }
  }

  async updateSendMessageAchievement(userID: number): Promise<void> {
    const user = await this.prisma.user.update({
      where: { ID: userID },
      data: { messagesSend: { increment: 1 } },
      select: { messagesSend: true }
    });

    const messageAchievements = [
      { name: 'Sent First Message', threshold: 1 },
      { name: 'Sent 10 Messages', threshold: 10 },
      { name: 'Sent 100 Messages', threshold: 100 },
    ];

    for (const achievement of messageAchievements) {
      if (user.messagesSend == achievement.threshold) {
        const achievementData = await this.prisma.achievement.findUnique({
          where: { name: achievement.name },
        });
        if (!achievementData) {
          throw new Error(`Achievement "${achievement.name}" not found.`);
        }
        await this.prisma.userAchievement.create({
          data: { userID, achievementID: achievementData.ID },
        });
      }
    }
  }

  async sendMessage(client: Socket, data: { channelID: number; token: string; content: string }): Promise<void> {
    await this.channelService.checkIsMuted(data.channelID, data.token);
    const senderID = await this.loginService.getUserIDFromCache(data.token);
    const message = await this.createMessage(data.channelID, senderID, data.content);
    this.gatewayService.emitToRoom('newMessage', String(data.channelID), {
      channelID: data.channelID,
      messageID: message.ID,
    });
    await this.updateSendMessageAchievement(senderID);
  }

  async createActionLogMessage(channelID: number, username: string, action: action): Promise<Message> {
    try  {
      const actionMessageMap = {
        demote: `${username} is no longer an Admin.`,
        makeAdmin: `${username} is now an Admin.`,
        mute: `${username} is now muted for 60 seconds.`,
        kick: `${username} has been kicked from the channel.`,
        ban: `${username} is now banned from the channel.`,
        join: `${username} has joined the channel.`,
        leave: `${username} has left the channel.`,
      };
      await this.enforceMessageLimit(channelID);
      return await this.prisma.message.create({
        data: {
          content: actionMessageMap[action],
          senderName: 'actionLog',
          channel: { connect: { ID: channelID } },
          sender: undefined,
        },
      });
    } catch (error) {
      this.errorHandlingService.throwHttpException(error);
    }
  }

  async sendActionLogMessage(channelID: number, username: string, action: action): Promise<void> {
    const message = await this.createActionLogMessage(channelID, username, action);
    this.gatewayService.emitToRoom('newMessage', String(channelID), { channelID: channelID, messageID: message.ID });
  }
}
