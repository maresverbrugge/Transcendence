import { Controller, Get, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';

@Controller('game/matches')
export class GameController {
  constructor(
	private readonly prisma: PrismaService,
	private readonly game: GameService
  ) {}

  @Post('/creategame/:userid1/:userid2')
  async createGame(
    @Param('userid1') userid1: number,
    @Param('userid2') userid2: number) {
      this.game.newGame(userid1, userid2);
      new this.game.matchinstance();
  }
}
