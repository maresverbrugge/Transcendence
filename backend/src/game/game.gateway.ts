import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Namespace } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserStatus, MatchStatus } from '@prisma/client';
import { GameService } from './game.service';
import { LoginService } from 'src/authentication/login/login.service';
import { ErrorHandlingService } from 'src/error-handling/error-handling.service';
import { UserService } from 'src/user/user.service';

@WebSocketGateway({
  namespace: 'game',
  cors: {
    origin: `${process.env.URL_FRONTEND}`, // Update with your client's origin
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private prisma: PrismaService,
    private readonly gameService: GameService,
	private readonly loginService: LoginService,
    private readonly errorHandlingService: ErrorHandlingService,
	private readonly userService: UserService
  ) {}

  @WebSocketServer() server: Namespace;
  private logger: Logger = new Logger('GameGateway');

  @SubscribeMessage('getGameID')
  async handleGetGameID(client: Socket, token: string) {
	try {
		const memberID: number = await this.loginService.getUserIDFromCache(token);
		const gameID: number = this.gameService.getGameID(memberID);
		client.emit('gameID', gameID);
		const side: number = await this.gameService.getSide(gameID, token, this.server);
		client.emit('side', side);
	} catch (error) {
		console.error('I was not able to find the game associated with this user, sorry about that');
		this.errorHandlingService.emitHttpException(error, client);
	}
  }

  @SubscribeMessage('start')
  handleGameStart(client: Socket, payload: { token: string; gameID: number }) {
	const { token, gameID } = payload;
    this.gameService.handleStart(gameID, token, this.server);
  }

  @SubscribeMessage('key')
  async handleKey(client: Socket, payload: {move: string; gameID: number; token: string }) {
	const { move, gameID, token } = payload;
    this.gameService.handleKey(this.server, move, token, gameID);
  }

  @SubscribeMessage('left scored')
  async handleScoreLeft(client: Socket, payload: {gameID: number; token: string }) {
	const { gameID, token } = payload;
    this.gameService.handleScore(this.server, gameID, 1, token);
  }

  @SubscribeMessage('right scored')
  async handleScoreRight(client: Socket, payload: {gameID: number; token: string }) {
	const { gameID, token } = payload;
    this.gameService.handleScore(this.server, gameID, 0, token);
  }

  @SubscribeMessage('hit paddle')
  async handleHitPaddle(client: Socket, payload: {gameID: number; value: number; oldHigh: number; token: string }) {
	const { gameID, value, oldHigh, token } = payload;
	await this.gameService.handleHitPaddle(gameID, value, oldHigh, token, this.server);
  }

  @SubscribeMessage('reverse ball speedY')
  async handleReverseSpeedY(client: Socket, payload: {gameID: number; token: string }) {
	const { gameID, token } = payload;
	await this.gameService.handleReverseSpeedY(gameID, token, this.server);
  }

  @SubscribeMessage('done')
  handleGameEnd(client: Socket, payload: {gameID: number; token: string }) {
	const { gameID, token } = payload;
	this.gameService.handleEnd(this.server, gameID, client, token);
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
	//   await this.gameService.updateSocket(token, client.id);
    } catch (error) {
		this.errorHandlingService.emitHttpException(error, client);
    }
  }
  async handleDisconnect(client: Socket): Promise<void> {
    try {
		//check if other player disconnected
		let token = client.handshake.query.token;
        if (Array.isArray(token)) token = token[0];
		const userID = await this.loginService.getUserIDFromCache(token);
		const gameID: number = this.gameService.getGameID(userID);
		this.gameService.handleDisconnection(this.server, gameID, client, token);

		console.log(`Client disconnected: ${client.id}`);
		await this.prisma.user.update({
        where: { ID: userID },
        data: { websocketID: null, status: UserStatus.ONLINE },
      });
    } catch (error) {
		this.errorHandlingService.emitHttpException(error, client);
    }
  }
}
