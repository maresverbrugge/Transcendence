import { Injectable } from '@nestjs/common';
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
        
      const channel = await this.channelService.getChannelByChannelId(channelId)
      const sender: User = await this.userService.getUserByUserId(senderId)
      if (!channel || !sender) {
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

}
