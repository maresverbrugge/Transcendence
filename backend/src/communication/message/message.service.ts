import { Injectable } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from '../user/user.service';
import { ChannelService } from '../channel/channel.service';
import { User, Message } from '@prisma/client'



@Injectable()
export class MessageService {

    constructor(
      private prisma: PrismaService,
      private readonly userService: UserService,
      private readonly channelService: ChannelService
    ) {}  

    async createMessage(content: string, senderId: number, channelId: number): Promise<Message> {
        
      const sender: User = await this.userService.getUserByUserId(senderId)
      if (!sender) {
        throw new Error('Channel not found');
      }
    
      return this.prisma.message.create({
        data: {
          content: content,
          senderName: sender.username,
          sender: {
            connect: { id: senderId }
          },
          channel: {
            connect: { id: channelId }
          }
        }
      });
    }

    async sendMessage(server: Server, senderSocketId: string, content: string, channelId: number) {
      const senderId = await this.userService.getUserIdBySocketId(senderSocketId)
      const newMessage: Message = await this.createMessage(content, senderId, channelId)
      server.to(String(channelId)).emit('newMessage', newMessage)
    }

}
