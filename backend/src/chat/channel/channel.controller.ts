import { Controller, Get, NotFoundException, InternalServerErrorException, Param, ParseIntPipe } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';


@Controller('chat/channels')
export class ChannelController {

    constructor(private readonly prisma: PrismaService) {}

    @Get()
    async getChannels() {
      try {
        const channels = await this.prisma.channel.findMany( {} );
        if (!channels) {
            throw new NotFoundException('No channels found');
          }
        return channels;
      } catch (error) {
        throw new InternalServerErrorException('An error occurred while fetching channels');
      }
    }

    @Get(':channelID')
    async getChannel(@Param('channelID', ParseIntPipe) channelID: number) {
      const channel = await this.prisma.channel.findUnique({
        where: {id: channelID},
        include: {
          members: {
            include: {
              user: true,
            },
          },
          messages: true
        },
      })
      if (!channel) {
        throw new NotFoundException('User not found');
      }
      return (channel)
    }
}
