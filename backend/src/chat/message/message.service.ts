import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Namespace, Socket } from 'socket.io';
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

    async createMessage(channelID: number, senderID: number, content: string): Promise<Message> {
        
      const sender: User = await this.userService.getUserByUserID(senderID)
      if (!sender)
        throw new NotFoundException('User not found');
    
      return this.prisma.message.create({
        data: {
          content: content,
          senderName: sender.username,
          sender: {
            connect: { id: senderID }
          },


          channel: {
            connect: { id: channelID }
          }
        }
      });
    }

    async sendMessage(server: Namespace, client: Socket, data: { channelID: number, token: string, content: string }) {
      try {
        await this.channelService.checkIsMuted(data.channelID, data.token)
        const sender = await this.userService.getUserBySocketID(data.token)
        const newMessage: Message = await this.createMessage(data.channelID, sender.id, data.content)
        server.to(String(data.channelID)).emit('newMessage', newMessage)
        // server.emit('newMessageOnChannel', data.channelID)
      } catch (error) {
        client.emit('error', error)
      }
    }
}
