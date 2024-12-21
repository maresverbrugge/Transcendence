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

type ChannelMemberResponse = ChannelMember & {
  user: Pick<User, 'ID' | 'username' | 'websocketID'>;
};

type newChannelData = {
  name: string;
  isPrivate: boolean;
  isDM: boolean;
  password?: string;
  token: string;
  memberIDs: number[];
};

type newMemberData = {
  channelID: number;
  memberID: number;
  token: string
}

@Controller('chat/channel')
export class ChannelController {
  constructor(
    private readonly channelService: ChannelService,
    private readonly channelMemberService: ChannelMemberService
  ) {}

  @Post()
  async newChannel(@Body() body: { newChannelData: newChannelData }): Promise<ChannelWithMembersAndMessages> {
    return this.channelService.newChannel(body.newChannelData);
  }

  @Post('/newMember')
  async newMember(@Body() body: { newMemberData: newMemberData }): Promise<ChannelMember> {
    return this.channelService.newChannelMember(body.newMemberData);
  }

  @Get('/all/:token')
  async getChannels(@Param('token') token: string): Promise<Channel[]> {
    return this.channelService.getChannelsOfUser(token);
  }
  
  @Post('/:channelID/add-member')
  async addChannelMember(
    @Param('channelID', ParseIntPipe) channelID: number,
    @Body('token') token: string,
  ): Promise<ChannelMember> {
    return this.channelMemberService.addChannelMemberIfNotExists(channelID, token);
  }

  @Get('/:channelID')
  async getChannel(@Param('channelID', ParseIntPipe) channelID: number): Promise<Channel> {
    return this.channelService.getChannelByID(channelID);
  }


  @Get('/memberID/:channelID/:token')
  async getChannelMemberID(@Param('channelID', ParseIntPipe) channelID: number, @Param('token') token: string): Promise<number> {
    return this.channelService.getChannelMemberID(channelID, token);
  }

  @Get('/members/:channelID/:token')
  async getChannelMembers(@Param('channelID', ParseIntPipe) channelID: number, @Param('token') token: string): Promise<ChannelMemberResponse[]> {
    return this.channelMemberService.getChannelMembers(channelID, token);
  }
}
