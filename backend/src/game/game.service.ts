import { Injectable, ForbiddenException } from '@nestjs/common';
import { Socket, Namespace } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { Match, MatchStatus } from '@prisma/client';
import { LoginService } from 'src/authentication/login/login.service';
import { ErrorHandlingService } from 'src/error-handling/error-handling.service';

interface MatchInstance
{
  ID: number,
  leftPlayerID: number,
  leftSocketID: string,
  rightPlayerID: number,
  rightSocketID: string,
  ballspeedx: number,
  ballspeedy: number,
  scoreLeft: number,
  scoreRight: number,
  firstPlayerReady: boolean,
}

@Injectable()
export class GameService {
  private matches: MatchInstance[] = [];
  constructor(
    private prisma: PrismaService,
    private readonly userService: UserService,
	private readonly loginService: LoginService,
    private readonly errorHandlingService: ErrorHandlingService
  ) {}
  async createGame(userID1: number, userID2: number, token: string): Promise<Match | null> {
	try {
		var ongoingGame: number = this.matches.findIndex((instance) => instance.leftPlayerID === userID1 || instance.rightPlayerID === userID1 || instance.leftPlayerID === userID2 || instance.rightPlayerID === userID2);
		if (ongoingGame > -1)
			throw new ForbiddenException("this user is already playing a game, can't add another one");
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
		this.matches.push({ID: newGame.matchID, leftPlayerID: userID1, leftSocketID: null, rightPlayerID: userID2, rightSocketID: null, ballspeedx: 0, ballspeedy: 0, scoreLeft: 0, scoreRight: 0, firstPlayerReady: false});
		return newGame;
	} catch (error) {
		this.errorHandlingService.throwHttpException(error);
	}
  }

  getGameID(playerID: number): number {
	var game: MatchInstance = this.matches.find((instance) => instance.leftPlayerID === playerID || instance.rightPlayerID === playerID);
	return game.ID;
  }

  async getSide(gameID: number, token: string): Promise<number> {
	try {
		const playerID = await this.loginService.getUserIDFromCache(token);
	  var game: MatchInstance = this.matches.find((instance) => instance.leftPlayerID === playerID || instance.rightPlayerID === playerID);
	  if (playerID == game.leftPlayerID)
		  return 0;
	  else
		  return 1;
	} catch(error) {
		this.errorHandlingService.throwHttpException(error);
	}
  }

  async handleStart(gameID: number, token: string, server: Namespace) {
    var game: MatchInstance = this.matches.find((instance) => instance.ID === gameID);
	if (!game) {
        console.error(`Game with ID ${gameID} not found.`);
        return; // Exit the function to prevent further execution
    }
	if (game.firstPlayerReady)
	{
		try {
			while (game.ballspeedy == 0)
				game.ballspeedy = Math.floor(Math.random() * 6 - 3);
			game.ballspeedx = 5;
			const socketLeft = await this.userService.getSocketIDByUserID(game.leftPlayerID, token);
			// console.log(socketLeft)
			// console.log(game.leftSocketID)
			// game.leftSocketID = socketLeft;
			const socketRight = await this.userService.getSocketIDByUserID(game.rightPlayerID, token);
			// console.log(socketRight)
			// console.log(game.rightSocketID)
			// game.rightSocketID = socketRight;
			server.to(socketRight).to(socketLeft).emit('ballSpeedY', game.ballspeedy);
			server.to(socketRight).to(socketLeft).emit('ballSpeedX', game.ballspeedx);
		} catch(error) {
			this.errorHandlingService.throwHttpException(error);
		}
	}
	else
	{
		game.firstPlayerReady = true;
	}
  }	

  map_range(value: number, low1: number, high1: number, low2: number, high2: number) {
	return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
  }

  async handleHitPaddle(server: Namespace, gameID: number, value: number, oldHigh: number, token: string) {
    var game: MatchInstance = this.matches.find((instance) => instance.ID === gameID);
	if (!game) {
        console.error(`Game with ID ${gameID} not found.`);
        return; // Exit the function to prevent further execution
    }
	try {
		game.ballspeedy = this.map_range(value, -oldHigh, oldHigh, -10, 10);
		const socketLeft = await this.userService.getSocketIDByUserID(game.leftPlayerID, token);
		const socketRight = await this.userService.getSocketIDByUserID(game.rightPlayerID, token);
		server.to(socketRight).to(socketLeft).emit('ballSpeedY', game.ballspeedy);
		server.to(socketRight).to(socketLeft).emit('ballSpeedX', game.ballspeedx * -1);
		game.ballspeedx *= -1;
	} catch(error) {
		this.errorHandlingService.throwHttpException(error);
	}
  }

  async handleScore(server: Namespace, gameID: number, side: number, token: string) {
	try {
		const playerID = await this.loginService.getUserIDFromCache(token);
		var game: MatchInstance = this.matches.find((instance) => instance.ID === gameID);
		if (!game || playerID == game.rightPlayerID) {
			console.error(`Game with ID ${gameID} not found.`);
			return; // Exit the function to prevent further execution
		}
		if (side === 1) {
			game.scoreLeft += 1;
		} else {
			game.scoreRight += 1;
		}
		const socketLeft = await this.userService.getSocketIDByUserID(game.leftPlayerID, token);
		const socketRight = await this.userService.getSocketIDByUserID(game.rightPlayerID, token);
		if (side === 1) {
			server.to(socketRight).to(socketLeft).emit('left score');
		} else {
			server.to(socketRight).to(socketLeft).emit('right score');
		}
		game.ballspeedy = 0;
		while (game.ballspeedy == 0)
			game.ballspeedy = Math.floor(Math.random() * 6 - 3);
		game.ballspeedx = 5;
		server.to(socketRight).to(socketLeft).emit('ballSpeedY', game.ballspeedy);
		server.to(socketRight).to(socketLeft).emit('ballSpeedX', game.ballspeedx);
	} catch(error) {
		this.errorHandlingService.throwHttpException(error);
	}
  }

  async handleReverseSpeedY(server: Namespace, gameID: number, token: string) {
    var game: MatchInstance = this.matches.find((instance) => instance.ID === gameID);
	if (!game) {
        console.error(`Game with ID ${gameID} not found.`);
        return; // Exit the function to prevent further execution
    }
    game.ballspeedy *= -1;
	const socketLeft = await this.userService.getSocketIDByUserID(game.leftPlayerID, token);
	const socketRight = await this.userService.getSocketIDByUserID(game.rightPlayerID, token);
	server.to(socketRight).to(socketLeft).emit('ballSpeedY', game.ballspeedy);
  }

  async handleKey(server: Namespace, move: string, token: string, gameID: number) {
	try {
		const playerID = await this.loginService.getUserIDFromCache(token);
		var game: MatchInstance = this.matches.find((instance) => instance.ID === gameID);
		if (!game) {
			console.error(`Game with ID ${gameID} not found.`);
			return; // Exit the function to prevent further execution
		}
		const socketLeft = await this.userService.getSocketIDByUserID(game.leftPlayerID, token);
		const socketRight = await this.userService.getSocketIDByUserID(game.rightPlayerID, token);
		// const socketLeft = game.leftSocketID;
		// const socketRight = game.rightSocketID;
		if (game.rightPlayerID === playerID) {
			if (move === 'up')
			{
				server.to(socketRight).to(socketLeft).emit('right up');
			}
		  else
		  {
			  server.to(socketRight).to(socketLeft).emit('right down');
		  }
		} else {
		  if (move === 'up')
			{
				server.to(socketRight).to(socketLeft).emit('left up');
			}
		  else
		  {
			  server.to(socketRight).to(socketLeft).emit('left down');
		  }
		}
	} catch(error) {
		this.errorHandlingService.throwHttpException(error);
	}
  }

  async handleEnd(server: Namespace, gameID: number, client: Socket, token: string): Promise<void> {
	  var game: MatchInstance = this.matches.find((instance) => instance.ID === gameID);
	  try {
		const playerID = await this.loginService.getUserIDFromCache(token);
		  if (!game || playerID == game.rightPlayerID) {
			console.error(`Game with ID ${gameID} not found.`);
			return; // Exit the function to prevent further execution
		}
		const socketLeft = await this.userService.getSocketIDByUserID(game.leftPlayerID, token);
		const socketRight = await this.userService.getSocketIDByUserID(game.rightPlayerID, token);
		server.to(socketRight).to(socketLeft).emit('finished');
		  await this.prisma.match.update({
			  where: {
				  matchID: gameID,
				},
				data: {
					status: MatchStatus.FINISHED,
					updatedAt: new Date(),
					scoreLeft: game.scoreLeft,
					scoreRight: game.scoreRight,
				},
			});
			if (game.scoreLeft > game.scoreRight){
				await this.prisma.statistics.update({where: {userID: game.leftPlayerID}, data: {wins: {increment: 1}, gamesPlayed: {increment: 1}}});
				await this.prisma.statistics.update({where: {userID: game.rightPlayerID}, data: {losses: {increment: 1}, gamesPlayed: {increment: 1}}});
			}
			else if (game.scoreRight > game.scoreLeft){
				await this.prisma.statistics.update({where: {userID: game.rightPlayerID}, data: {wins: {increment: 1}, gamesPlayed: {increment: 1}}});
				await this.prisma.statistics.update({where: {userID: game.leftPlayerID}, data: {losses: {increment: 1}, gamesPlayed: {increment: 1}}});
			}
		} catch (error) {
			console.error("couldn't save game to the database, too bad");
			this.errorHandlingService.emitHttpException(error, client);
		}
	const index = this.matches.indexOf(game);
	this.matches.splice(index, 1);
  }

  async handleDisconnection(server: Namespace, gameID: number, client: Socket, token: string): Promise<void> {
	var game: MatchInstance = this.matches.find((instance) => instance.ID === gameID);
	if (!game) {
	  console.error(`Game with ID ${gameID} not found.`);
	  return; // Exit the function to prevent further execution
  }
  try {
	const socketLeft = await this.userService.getSocketIDByUserID(game.leftPlayerID, token);
	const socketRight = await this.userService.getSocketIDByUserID(game.rightPlayerID, token);
	server.to(socketRight).to(socketLeft).emit('disconnection');
	await this.prisma.match.update({
		where: {
			matchID: gameID,
		  },
		  data: {
			  status: MatchStatus.CANCELED,
			  updatedAt: new Date(),
		  },
	  });
	  console.error("this game got interrupted by something, who closed the tab?");
} catch (error) {
	console.error("couldn't save game to the database, too bad");
	this.errorHandlingService.emitHttpException(error, client);
}
  const index = this.matches.indexOf(game);
  this.matches.splice(index, 1);
}
}
