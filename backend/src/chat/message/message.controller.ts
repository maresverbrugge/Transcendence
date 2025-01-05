import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { Message } from '@prisma/client';

import { MessageService } from './message.service';

@Controller('chat/message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get(':messageID/:token')
  async getMessage(
    @Param('messageID', ParseIntPipe) messageID: number,
    @Param('token') token: string
  ): Promise<Message> {
    return this.messageService.getMessage(messageID, token);
  }

  @Get('channel/:channelID/:token')
  async getMessages(
    @Param('channelID', ParseIntPipe) channelID: number,
    @Param('token') token: string
  ): Promise<Message[]> {
    return this.messageService.getMessages(channelID, token);
  }
}
