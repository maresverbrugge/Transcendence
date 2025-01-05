import { Injectable } from '@nestjs/common';
import { Namespace } from 'socket.io';
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
    const newGame = await this.prisma.match.create({
      data: {
        status: 'PENDING',
		players: {
            connect: [{ ID: userID1 }, { ID: userID2 }]
          },
      },
    });
    this.matches.push({ID: newGame.matchID, leftPlayerID: userID1, rightPlayerID: userID2, ballspeedx: 0, ballspeedy: 0, paddlerightspeedy: 0, paddleleftspeedy: 0, scoreLeft: 0, scoreRight: 0});
    return newGame;
  }

  handleStart(gameID: number, server: Namespace) {
    var game: MatchInstance = this.matches.find((instance) => instance.ID === gameID);
    game.ballspeedy = Math.floor(Math.random() * 6 - 3);
    game.ballspeedx = 5;
	server.emit('ballSpeedY', game.ballspeedy);
	server.emit('ballSpeedX', game.ballspeedx);
  }

  handleReconnection(gameID: number, server: Namespace) {
    var game: MatchInstance = this.matches.find((instance) => instance.ID === gameID);
	const socketLeft = this.userService.getWebSocketByUserID(server, game.leftPlayerID);
	const socketRight = this.userService.getWebSocketByUserID(server, game.rightPlayerID);
	socketLeft.emit('ballSpeedY', game.ballspeedy);
	socketLeft.emit('ballSpeedX', game.ballspeedx);
	socketRight.emit('ballSpeedY', game.ballspeedy);
	socketRight.emit('ballSpeedX', game.ballspeedx);
  }

  map_range(value: number, low1: number, high1: number, low2: number, high2: number) {
	return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
  }

  handleHitPaddle(gameID: number, value: number, oldHigh: number): number {
    var game: MatchInstance = this.matches.find((instance) => instance.ID === gameID);
    game.ballspeedy = map_range(value, -oldHigh, oldHigh, -10, 10);
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
        scoreLeft: {
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
        scoreRight: {
          increment: 1,
        },
      },
    });
  }

  handleReverseSpeedY(gameID: number): number {
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

  handleEnd(gameID: number): void {
    var game: MatchInstance = this.matches.find((instance) => instance.ID === gameID);
    game.ballspeedy = 0;
    game.ballspeedx = 0;
	game.paddleleftspeedy = 0;
	game.paddlerightspeedy = 0;
  }
}
