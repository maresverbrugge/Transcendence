import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { User, Match } from '@prisma/client';

@Injectable()
export class GameService {
  matchinstance
  {
	  ID: number,
	  leftPlayerID: number,
	  rightPlayerID: number,
	  ballx: number,
	  bally: number,
	  ballspeedx: number,
	  ballspeedy: number,
	  paddlerightspeedy: number,
	  paddleleftspeedy: number,
	  scoreLeft: number,
	  scoreRight: number,
  }
  constructor(
    private prisma: PrismaService,
    private readonly userService: UserService
    private matches = matchinstance[];
  ) {}
  async newGame(userID1: number, userID2: number): Promise<Match | null> {
    const member1: User = await this.userService.getUserByUserID(userID1);
    const member2: User = await this.userService.getUserByUserID(userID2);
    const newGame: Match = await this.prisma.match.create({
      data: {
        status: 'ACCEPTED',
        players: {
          connect: member1,
	  connect: member2
        },
      },
    });
    return newGame;
    this.matches.push({ID: newGame.matchID, leftPlayerID: userID1, rightPlayerID: userID2, ballx: 250, bally: 250, ballspeedx: 0, ballspeedy: 0, paddlerightspeedy: 0, paddleleftspeedy: 0, scoreLeft: 0, scoreRight: 0});
  }

  async handleScoreLeft(gameID: string) {
    game = matches.find(gameID);
    game.scoreLeft += 1;
    await this.prisma.match.update({
      where: {
        matchID: parseInt(gameID),
      },
      data: {
        scorePlayer1: {
          increment: 1,
        },
      },
    });
  }

  async handleKey(move: string, socketID: string, gameID: number) {
    game = matches.find(gameID);
    if (game.rightPlayerID === playerID) {
      if (data[0] === 'up')
	      this.server.emit('right up');
      else
	      this.server.emit('right down');
    } else {
      if (data[0] === 'up')
	      this.server.emit('left up');
      else
	      this.server.emit('left down');
    }
  }
}
