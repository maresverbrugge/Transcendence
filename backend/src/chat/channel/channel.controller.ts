import { Controller, Get, Post, Body, NotFoundException, InternalServerErrorException, Param, ParseIntPipe } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChannelService } from './channel.service';
import { Channel, User, Message, ChannelMember } from '@prisma/client'

type ChannelWithMembersAndMessages = Channel & {
  members: (ChannelMember & {
      user: Pick<User, 'ID' | 'username'>;
  })[];
  messages: Message[];
};

@Controller('chat/channel')
export class ChannelController {

    constructor(
      private readonly prisma: PrismaService,
      private readonly channelService: ChannelService
    ) {}

    @Post()
    async newChannel(@Body() body: {newChannelData: {name: string, isPrivate: boolean, isDM: boolean, password?: string, token: string, memberIDs: number[]}}): Promise<ChannelWithMembersAndMessages> {
      return this.channelService.newChannel(body.newChannelData)
    }

    @Get('/:token')
    async getChannels(@Param('token') token: string) {
      return this.channelService.getChannelsOfUser(token)
    }

    @Get(':channelID/:token')
    async getChannel(@Param('channelID', ParseIntPipe) channelID: number, @Param('token') token: string) {
      return this.channelService.getChannelAddMember(channelID, token)
    }

    @Get('/memberID/:channelID/:token')
    async getChannelMember(@Param('channelID', ParseIntPipe) channelID: number, @Param('token') token: string) {
      return this.channelService.getChannelMemberID(channelID, token)
    }
}
