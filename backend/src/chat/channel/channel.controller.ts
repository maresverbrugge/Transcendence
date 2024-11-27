import { Controller, Get, NotFoundException, InternalServerErrorException, Param, ParseIntPipe } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChannelService } from './channel.service';


@Controller('chat/channel')
export class ChannelController {

    constructor(
      private readonly prisma: PrismaService,
      private readonly channelService: ChannelService
    ) {}

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
