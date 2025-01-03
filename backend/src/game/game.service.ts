import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { User, Match } from '@prisma/client';

interface MatchInstance
{
  ID: number,
  leftPlayerID: number,
  rightPlayerID: number,
  ballspeedx: number,
  ballspeedy: number,
  paddlerightspeedy: number,
  paddleleftspeedy: number,
  scoreLeft: number,
  scoreRight: number,
}

@Injectable()
export class GameService {
  private matches: MatchInstance[] = [];
  constructor(
    private prisma: PrismaService,
    private readonly userService: UserService
  ) {}
  async createGame(userID1: number, userID2: number): Promise<Match | null> {
    const newGame: Match = await this.prisma.match.create({
      data: {
        status: 'ACCEPTED',
        players: [userID1, userID2],
      },
    });
    this.matches.push({ID: newGame.matchID, leftPlayerID: userID1, rightPlayerID: userID2, ballspeedx: 0, ballspeedy: 0, paddlerightspeedy: 0, paddleleftspeedy: 0, scoreLeft: 0, scoreRight: 0});
    return newGame;
  }

  handleStart(gameID: number): number {
    var game: MatchInstance = this.matches.find((instance) => instance.ID === gameID);
    game.ballspeedy = Math.floor(Math.random() * 6 - 3);
    game.ballspeedx = 5;
    return game.ballspeedy;
  }

  async handleScoreLeft(gameID: number) {
    var game: MatchInstance = this.matches.find((instance) => instance.ID === gameID);
    game.scoreLeft += 1;
    await this.prisma.match.update({
      where: {
        matchID: gameID,
      },
      data: {
        scorePlayer1: {
          increment: 1,
        },
      },
    });
  }

  async handleScoreRight(gameID: number) {
    var game: MatchInstance = this.matches.find((instance) => instance.ID === gameID);
    game.scoreLeft += 1;
    await this.prisma.match.update({
      where: {
        matchID: gameID,
      },
      data: {
        scorePlayer1: {
          increment: 1,
        },
      },
    });
  }

  handleReverseSpeedY(gameID: number) {
    var game: MatchInstance = this.matches.find((instance) => instance.ID === gameID);
    game.ballspeedy *= -1;
  }

  handleReverseSpeedX(gameID: number) {
    var game: MatchInstance = this.matches.find((instance) => instance.ID === gameID);
    game.ballspeedx *= -1;
  }

  async handleKey(move: string, socketID: string, gameID: number) {
    const playerID: number = await this.userService.getUserIDBySocketID(socketID);
    var game: MatchInstance = this.matches.find((instance) => instance.ID === gameID);
    if (game.rightPlayerID === playerID) {
      if (move === 'up')
	      game.paddlerightspeedy = 1;
      else
	      game.paddlerightspeedy = -1;
    } else {
      if (move === 'up')
	      game.paddleleftspeedy = 1;
      else
	      game.paddleleftspeedy = -1;
    }
  }
}
