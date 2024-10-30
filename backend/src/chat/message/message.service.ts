import { Injectable } from '@nestjs/common';
import { Socket, Namespace } from 'socket.io';
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

    async sendMessage(server: Namespace, data: { channelID: number, ownerToken: string, content: string }) {
      const sender = await this.userService.getUserBySocketId(data.ownerToken)
      const newMessage: Message = await this.createMessage(data.channelID, sender.id, data.content)
      server.to(String(data.channelID)).emit('newMessage', newMessage)
    }

}
