import { Injectable, ForbiddenException } from '@nestjs/common';
import { Socket, Namespace } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { User, Match, MatchStatus } from '@prisma/client';
import { LoginService } from 'src/authentication/login/login.service';

interface MatchInstance
{
  ID: number,
  leftPlayerID: number,
  leftSocketID: string,
  rightPlayerID: number,
  rightSocketID: string,
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
    private readonly userService: UserService,
	private readonly loginService: LoginService,
  ) {}
  async createGame(userID1: number, userID2: number): Promise<Match | null> {
	try {
		var ongoingGame: number = this.matches.findIndex((instance) => instance.leftPlayerID === userID1 || instance.rightPlayerID === userID1 || instance.leftPlayerID === userID2 || instance.rightPlayerID === userID2);
		if (ongoingGame > -1)
			throw ForbiddenException("this user is already playing a game, can't add another one");
		const socketLeft = await this.userService.getSocketIDByUserID(userID1);
		const socketRight = await this.userService.getSocketIDByUserID(userID2);
		const newGame = await this.prisma.match.create({
		  data: {
			status: 'PENDING',
			players: {
				connect: [{ ID: userID1 }, { ID: userID2 }]
			  },
		  },
		});
		//add match to players matchhistory
		const user = await this.prisma.user.update({
			where: {
				ID: userID1,
			},
			data: {
				matches: {
					connect: { matchID: newGame.matchID }
				  },
			  },
		});
		const user2 = await this.prisma.user.update({
			where: {
				ID: userID2,
			},
			data: {
				matches: {
					connect: { matchID: newGame.matchID }
				  },
			  },
		});
		this.matches.push({ID: newGame.matchID, leftPlayerID: userID1, leftSocketID: socketLeft, rightPlayerID: userID2, rightSocketID: socketRight, ballspeedx: 0, ballspeedy: 0, paddlerightspeedy: 0, paddleleftspeedy: 0, scoreLeft: 0, scoreRight: 0});
		console.log(this.matches)
		return newGame;
	} catch (error) {
		console.error(error);
		return null;
	}
  }

  getGameID(playerID: number): number {
	var game: MatchInstance = this.matches.find((instance) => instance.leftPlayerID === playerID || instance.rightPlayerID === playerID);
	return game.ID;
  }
}