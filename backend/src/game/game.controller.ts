import { Controller, Get, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('game/matches')
export class GameController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getMatches() {
    try {
      const matches = await this.prisma.match.findMany({
        where: {
          status: 'PENDING',
        },
        select: {
          matchID: true,
        },
      });
      if (!matches) {
        throw new NotFoundException('No matches found');
      }
      return matches;
    } catch (error) {
      throw new InternalServerErrorException('An error occurred while fetching matches');
    }
  }
}
