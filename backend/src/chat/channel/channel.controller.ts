import { Controller, Get, NotFoundException, InternalServerErrorException, Param, ParseIntPipe } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChannelService } from './channel.service';


@Controller('chat/channel')
export class ChannelController {

    constructor(
      private readonly prisma: PrismaService,
      private readonly channelService: ChannelService
    ) {}

    @Get()
    async getChannels() {
      try {
        const channels = await this.prisma.channel.findMany( {} );
        if (!channels)
            throw new NotFoundException('No channels found');
        return channels;
      } catch (error) {
        throw new InternalServerErrorException('An error occurred while fetching channels');
      }
    }

    @Get(':channelID/:token')
    async getChannel(@Param('channelID', ParseIntPipe) channelID: number, @Param('token') token: string) {
      return this.channelService.getChannelAddMember(channelID, token)
    }

    @Get('/member/:channelID/:token')
    async getChannelMember(@Param('channelID', ParseIntPipe) channelID: number, @Param('token') token: string) {
      return this.channelService.getChannelMember(channelID, token)
    }
}
