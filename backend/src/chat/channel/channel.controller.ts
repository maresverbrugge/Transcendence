import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { Channel, User, Message, ChannelMember } from '@prisma/client';

import { ChannelService } from './channel.service';
import { ChannelMemberService } from '../channel-member/channel-member.service';

type ChannelWithMembersAndMessages = Channel & {
  members: (ChannelMember & {
    user: Pick<User, 'ID' | 'username'>;
  })[];
  messages: Message[];
};

@Controller('chat/channel')
export class ChannelController {
  constructor(
    private readonly channelService: ChannelService,
    private readonly channelMemberService: ChannelMemberService
  ) {}

  @Post()
  async newChannel(
    @Body()
    body: {
      newChannelData: {
        name: string;
        isPrivate: boolean;
        isDM: boolean;
        password?: string;
        token: string;
        memberIDs: number[];
      };
    }
  ): Promise<ChannelWithMembersAndMessages> {
    return this.channelService.newChannel(body.newChannelData);
  }

  @Post('/newMember')
  async newMember(@Body() body: { newMemberData: { channelID: number; memberID: number; token: string } }) {
    await this.channelService.newChannelMember(body.newMemberData);
  }

  @Get('/:token')
  async getChannels(@Param('token') token: string) {
    return this.channelService.getChannelsOfUser(token);
  }

  @Get(':channelID/:token')
  async getChannel(@Param('channelID', ParseIntPipe) channelID: number, @Param('token') token: string) {
    return this.channelService.getChannelAddMember(channelID, token);
  }

  @Get('/memberID/:channelID/:token')
  async getChannelMemberID(@Param('channelID', ParseIntPipe) channelID: number, @Param('token') token: string) {
    return this.channelService.getChannelMemberID(channelID, token);
  }

  @Get('/members/:channelID/:token')
  async getChannelMembers(@Param('channelID', ParseIntPipe) channelID: number, @Param('token') token: string) {
    return this.channelMemberService.getChannelMembers(channelID, token);
  }
}
