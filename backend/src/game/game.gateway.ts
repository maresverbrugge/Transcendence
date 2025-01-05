import {
  SubscribeMessage,
  MessageBody,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Namespace } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { User, UserStatus, Match, MatchStatus } from '@prisma/client';
import { GameService } from './game.service';
import { LoginService } from 'src/authentication/login/login.service';

@WebSocketGateway({
  namespace: 'game',
  cors: {
    origin: 'http://localhost:3000', // Update with your client's origin
    methods: ['GET', 'POST'],
    transports: ['websocket'],
    credentials: true,
  },
})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private prisma: PrismaService,
    private readonly userService: UserService,
    private readonly gameService: GameService,
	private readonly loginService: LoginService
  ) {}

  @WebSocketServer() server: Namespace;
  private logger: Logger = new Logger('GameGateway');

  // @SubscribeMessage('message')
  // handleMessage(@MessageBody() data: { sender: string; message: string }) {
  //   this.logger.log(`Message received from ${data.sender}: ${data.message}`);
  //   // Broadcast the message to all connected clients
  //   this.server.emit('message', data);
  // }

  @SubscribeMessage('getGameID')
  async handleGetGameID(client: Socket, token: string) {
    const memberID: number = await this.loginService.getUserIDFromCache(token);
	const user = await this.prisma.user.findUnique({
		where: {
			ID: memberID,
		},
		select: {
			matches: {
				select: {
					matchID: true,
					status: true,
				}
			}
		}
	});
	const game = user.matches.filter(x => x.status == MatchStatus.PENDING)[0];
    client.emit('gameID', game.matchID);
  }

  @SubscribeMessage('start')
  handleGameStart(client: Socket, gameID: number) {
    this.gameService.handleStart(gameID, this.server);
  }

  @SubscribeMessage('reconnected')
  handleReconnection(client: Socket, gameID: number) {
    this.gameService.handleReconnection(gameID, this.server);
  }

  @SubscribeMessage('key')
  async handleKey(@MessageBody() data: { move: string; gameID: number; socketID: string }) {
    this.gameService.handleKey(data[0], data[2], data[1]);
  }

  @SubscribeMessage('left scored')
  async handleScoreLeft(client: Socket, gameID: number) {
    this.gameService.handleScoreLeft(gameID);
  }

  @SubscribeMessage('right scored')
  async handleScoreRight(client: Socket, gameID: number) {
    this.gameService.handleScoreRight(gameID);
  }

  @SubscribeMessage('hit paddle')
  async handleHitPaddle(client: Socket, gameID: number, value: number, oldHigh: number) {
    this.server.emit('ballSpeedY', this.gameService.handleHitPaddle(gameID, value, oldHigh));
  }

  @SubscribeMessage('reverse ball speedy')
  async handleReverseSpeedY(client: Socket, gameID: number) {
    this.server.emit('ballSpeedY', this.gameService.handleReverseSpeedY(gameID));
  }

  @SubscribeMessage('done')
  async handleGameEnd(client: Socket, gameID: number) {
    await this.prisma.match.update({
		where: {
		  matchID: gameID,
		},
		data: {
		  status: MatchStatus.FINISHED,
		  updatedAt: new Date(),
		},
	  });
	this.gameService.handleEnd(gameID);
  }

  afterInit(server: Namespace) {
    this.logger.log('WebSocket Gateway Initialized');
  }

  async handleConnection(client: Socket): Promise<void> {
    try {
      console.log(`Client connected: ${client.id}`);
      let token = client.handshake.query.token;
      if (Array.isArray(token)) token = token[0];
      const userID = await this.loginService.getUserIDFromCache(token);
      await this.prisma.user.update({where: {ID: userID}, data: {status: UserStatus.IN_GAME, websocketID: client.id}})
    } catch (error) {
    //   if (!(error instanceof HttpException)) error = new InternalServerErrorException('An unexpected error occurred', error.message);
      console.error(error)
      client.emit('error', error)
    }
  }
  async handleDisconnect(client: Socket): Promise<void> {
    try {
		const playerID: number = await this.userService.getUserIDBySocketID(client.id);
		const user = await this.prisma.user.findUnique({
			where: {
				ID: playerID,
			},
			select: {
				matches: {
					select: {
						status: true,
						players: {
							select: {
								websocketID: true,
							}
						}
					}
				}
			}
		});
		const game = user.matches.filter(x => x.status == MatchStatus.PENDING)[0];
		for (client in game.players)
		{
			if (client.websocketID != playerID)
				this.server.to(client.websocketID).emit('pause');
		}
		console.log(`Client disconnected: ${client.id}`);
		await this.prisma.user.update({
        where: { ID: playerID },
        data: { websocketID: null, status: UserStatus.ONLINE },
      });
    } catch (error) {
    //   if (!(error instanceof HttpException)) error = new InternalServerErrorException('An unexpected error occurred', error.message);
      console.error(error)
      client.emit('error', error)
    }
  }
}
