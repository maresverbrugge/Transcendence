import { Injectable } from '@nestjs/common';
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
  firstPlayerReady: boolean,
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
			return;
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
		this.matches.push({ID: newGame.matchID, leftPlayerID: userID1, leftSocketID: socketLeft, rightPlayerID: userID2, rightSocketID: socketRight, ballspeedx: 0, ballspeedy: 0, paddlerightspeedy: 0, paddleleftspeedy: 0, scoreLeft: 0, scoreRight: 0, firstPlayerReady: false});
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

  async handleStart(gameID: number, server: Namespace) {
    var game: MatchInstance = this.matches.find((instance) => instance.ID === gameID);
	if (!game) {
        console.error(`Game with ID ${gameID} not found.`);
        return; // Exit the function to prevent further execution
    }
	console.log("start game", game)
	if (game.firstPlayerReady)
	{
		game.ballspeedy = Math.floor(Math.random() * 6 - 3);
		game.ballspeedx = 5;
		const socketLeft = await this.userService.getSocketIDByUserID(game.leftPlayerID);
		console.log(socketLeft)
		console.log(game.leftSocketID)
		// game.leftSocketID = socketLeft;
		const socketRight = await this.userService.getSocketIDByUserID(game.rightPlayerID);
		console.log(socketRight)
		console.log(game.rightSocketID)
		// game.rightSocketID = socketRight;
		server.to(socketRight).to(socketLeft).emit('ballSpeedY', game.ballspeedy);
		server.to(socketRight).to(socketLeft).emit('ballSpeedX', game.ballspeedx);
	}
	else
	{
		game.firstPlayerReady = true;
	}
  }

  //detect if gamecontrol component unmounted while finished == false, then send a notification to the other player

//   handleReconnection(gameID: number, server: Namespace) {
//     var game: MatchInstance = this.matches.find((instance) => instance.ID === gameID);
// 	server.to(game.leftSocketID).to(game.rightSocketID).emit('ballSpeedY', game.ballspeedy);
// 	server.to(game.leftSocketID).to(game.rightSocketID).emit('ballSpeedX', game.ballspeedx);
//   }

  map_range(value: number, low1: number, high1: number, low2: number, high2: number) {
	return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
  }

  handleHitPaddle(gameID: number, value: number, oldHigh: number): number {
    var game: MatchInstance = this.matches.find((instance) => instance.ID === gameID);
	if (!game) {
        console.error(`Game with ID ${gameID} not found.`);
        return; // Exit the function to prevent further execution
    }
    game.ballspeedy = this.map_range(value, -oldHigh, oldHigh, -10, 10);
    return game.ballspeedy;
  }

  async handleScoreLeft(gameID: number) {
    var game: MatchInstance = this.matches.find((instance) => instance.ID === gameID);
	if (!game) {
        console.error(`Game with ID ${gameID} not found.`);
        return; // Exit the function to prevent further execution
    }
    game.scoreLeft += 1;
  }

  async handleScoreRight(gameID: number) {
    var game: MatchInstance = this.matches.find((instance) => instance.ID === gameID);
	if (!game) {
        console.error(`Game with ID ${gameID} not found.`);
        return; // Exit the function to prevent further execution
    }
    game.scoreRight += 1;
  }

  handleReverseSpeedY(gameID: number) {
    var game: MatchInstance = this.matches.find((instance) => instance.ID === gameID);
	if (!game) {
        console.error(`Game with ID ${gameID} not found.`);
        return; // Exit the function to prevent further execution
    }
    game.ballspeedy *= -1;
  }

  handleReverseSpeedX(gameID: number) {
    var game: MatchInstance = this.matches.find((instance) => instance.ID === gameID);
	if (!game) {
        console.error(`Game with ID ${gameID} not found.`);
        return; // Exit the function to prevent further execution
    }
    game.ballspeedx *= -1;
  }

  async handleKey(server: Namespace, move: string, token: string, gameID: number) {
    const playerID = await this.loginService.getUserIDFromCache(token);
    var game: MatchInstance = this.matches.find((instance) => instance.ID === gameID);
	if (!game) {
        console.error(`Game with ID ${gameID} not found.`);
        return; // Exit the function to prevent further execution
    }
	// const socketLeft = await this.userService.getSocketIDByUserID(game.leftPlayerID);
	// const socketRight = await this.userService.getSocketIDByUserID(game.rightPlayerID);
	const socketLeft = game.leftSocketID;
	const socketRight = game.rightSocketID;
    if (game.rightPlayerID === playerID) {
		if (move === 'up')
		{
			game.paddlerightspeedy = 2;
			server.to(socketRight).to(socketLeft).emit('right up');
		}
      else
	  {
	      game.paddlerightspeedy = -2;
		  server.to(socketRight).to(socketLeft).emit('right down');
	  }
    } else {
      if (move === 'up')
		{
			game.paddleleftspeedy = 2;
			server.to(socketRight).to(socketLeft).emit('left up');
		}
      else
	  {
	      game.paddleleftspeedy = -2;
		  server.to(socketRight).to(socketLeft).emit('left down');
	  }
    }
  }

  async handleEnd(gameID: number, client: Socket): Promise<void> {
	  var game: MatchInstance = this.matches.find((instance) => instance.ID === gameID);
	  if (!game) {
        console.error(`Game with ID ${gameID} not found.`);
        return; // Exit the function to prevent further execution
    }
	  try {
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
		} catch (error) {
			console.error("couldn't save game to the database, too bad");
			console.error(error);
			client.emit('error');
		}
	const index = this.matches.indexOf(game);
	this.matches.splice(index, 1);
  }
}
