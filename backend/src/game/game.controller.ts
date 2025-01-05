import { Controller, Post, Param, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { GameService } from 'src/game/game.service';
import { LoginService } from 'src/authentication/login/login.service';

@Controller('game/matches')
export class GameController {
  constructor(
	private readonly game: GameService,
	private readonly login: LoginService
  ) {}

  @Post('/creategame/:token/:userid2')
  async createGame(
    @Param('token') token: string,
    @Param('userid2') userid2: number) {
      const userid1: number = await this.login.getUserIDFromCache(token);
      this.game.createGame(userid1, userid2);
  }
}
