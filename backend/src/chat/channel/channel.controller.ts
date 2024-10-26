import { Controller, Get, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';


@Controller('chat/channels')
export class ChannelController {

    constructor(private readonly prisma: PrismaService) {}

    @Get()
    async getChannels() {
      try {
        const channels = await this.prisma.channel.findMany({
          include: {
            members: {
              include: {
                user: true,
              },
            },
            messages: true
          },
        });
        if (!channels) {
            throw new NotFoundException('No channels found');
          }
        return channels;
      } catch (error) {
        throw new InternalServerErrorException('An error occurred while fetching channels');
    }
    }
}
