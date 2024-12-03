import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { Namespace, Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from '../user/user.service';
import { ChannelService } from '../channel/channel.service';
import { User, Message } from '@prisma/client'

type action = 'demote' | 'makeAdmin' | 'mute' | 'kick' | 'ban' | 'join' | 'leave'

@Injectable()
export class MessageService {

    constructor(
      private prisma: PrismaService,
      private readonly userService: UserService,
      @Inject(forwardRef(() => ChannelService))
      private readonly channelService: ChannelService,    ) {}  

    async createMessage(channelID: number, senderID: number, content: string): Promise<Message> {
        
      const sender: User = await this.userService.getUserByUserID(senderID)
      if (!sender)
        throw new NotFoundException('User not found');
    
      return this.prisma.message.create({
        data: {
          content: content,
          senderName: sender.username,
          sender: {
            connect: { ID: senderID }
          },


          channel: {
            connect: { ID: channelID }
          }
        }
      });
    }

    async sendMessage(server: Namespace, client: Socket, data: { channelID: number, token: string, content: string }) {
      try {
        await this.channelService.checkIsMuted(data.channelID, data.token)
        const sender = await this.userService.getUserBySocketID(data.token)
        const newMessage: Message = await this.createMessage(data.channelID, sender.ID, data.content)
        server.to(String(data.channelID)).emit('newMessage', newMessage)
        // server.emit('newMessageOnChannel', data.channelID)
      } catch (error) {
        client.emit('error', error)
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
        leave: `${username} has left the channel.`
      }
      return this.prisma.message.create({
        data: {
          content: actionMessageMap[action],
          senderName: 'actionLog',
          channel: {
            connect: { ID: channelID }
          },
          sender: undefined
        }
      });
    }

    async sendActionLogMessage(server: Namespace, channelID: number, username: string, action: action) {
      const message = await this.createActionLogMessage(channelID, username, action)
      server.to(String(channelID)).emit('newMessage', message)
    }
}
