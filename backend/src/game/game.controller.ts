import { Controller, Get, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { GameService } from 'src/game/game.service';

@Controller('game/matches')
export class GameController {
  constructor(
	private readonly prisma: PrismaService,
	private readonly game: GameService,
	private readonly user: UserService
  ) {}

  @Post('/creategame/:token/:userid2')
  async createGame(
    @Param('token') token: string,
    @Param('userid2') userid2: number) {
      const userid1: number = await this.user.getUserIDByToken(token);
      this.game.newGame(userid1, userid2);
  }
}
