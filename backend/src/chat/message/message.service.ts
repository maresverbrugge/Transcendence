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

    async createMessage(channelID: number, senderID: number, content: string): Promise<Message> {
        
      const sender: User = await this.userService.getUserByUserId(senderID)
      if (!sender) {
        throw new Error('User not found');
      }
    
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

    async sendMessage(server: Server, data: { channelID: number, senderID: number, content: string }) {
      const newMessage: Message = await this.createMessage(data.channelID, data.senderID, data.content)
      server.to(String(data.channelID)).emit('newMessage', newMessage)
    }

}
