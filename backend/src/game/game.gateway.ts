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
    const memberID: number = await this.userService.getUserIDByToken(token);
	const user = await this.prisma.user.findUnique({
		where: {
			ID: memberID,
		},
		select: {
			matchHistory: {
				select: {
					matchID: true,
					status: true,
				}
			}
		}
	});
	const game = user.matchHistory.filter(x => x.status == MatchStatus.PENDING)[0];
    client.emit('gameID', game.matchID);
  }

  @SubscribeMessage('start')
  handleGameStart(client: Socket, gameID: number) {
    this.server.emit('ballSpeedY', this.gameService.handleStart(gameID));
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

  afterInit(server: Namespace) {
    this.logger.log('WebSocket Gateway Initialized');
  }

  async handleConnection(client: Socket): Promise<void> {
    try {
      console.log(`Client connected: ${client.id}`);
      let token = client.handshake.query.token;
      if (Array.isArray(token)) token = token[0];
      const userID = await this.userService.getUserIDByToken(token);
      await this.prisma.user.update({where: {ID: userID}, data: {status: UserStatus.IN_GAME, websocketID: client.id}})
      this.server.emit('userStatusChange', userID, 'IN_GAME');
    } catch (error) {
    //   if (!(error instanceof HttpException)) error = new InternalServerErrorException('An unexpected error occurred', error.message);
      console.error(error)
      client.emit('error', error)
    }
  }
  async handleDisconnect(client: Socket): Promise<void> {
    try {
      console.log(`Client disconnected: ${client.id}`);
      const user = await this.userService.getUserBySocketID(client.id);
      await this.prisma.user.update({
        where: { ID: user.ID },
        data: { websocketID: null, status: UserStatus.ONLINE },
      });
      this.server.emit('userStatusChange', user.ID, 'ONLINE');
    } catch (error) {
    //   if (!(error instanceof HttpException)) error = new InternalServerErrorException('An unexpected error occurred', error.message);
      console.error(error)
      client.emit('error', error)
    }
  }
}
