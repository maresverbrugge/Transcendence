import { WebSocketServer, SubscribeMessage, WebSocketGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Socket, Namespace } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { UserStatus } from '@prisma/client';
import { GameService } from 'src/game/game.service';
import { LoginService } from 'src/authentication/login/login.service';
import { ErrorHandlingService } from 'src/error-handling/error-handling.service';
  
  @WebSocketGateway({
	namespace: 'matchmaking',
	cors: {
	  origin: `${process.env.URL_FRONTEND}`,
	  methods: ['GET', 'POST'],
	  credentials: true,
	},
  })
  export class MatchmakingGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor(
	  private readonly userService: UserService,
	  private readonly gameService: GameService,
	  private readonly prismaService: PrismaService,
	  private readonly loginService: LoginService,
	  private readonly errorHandlingService: ErrorHandlingService
	) {}
	@WebSocketServer() server: Namespace;
	private queue: number[] = [];
	private logger: Logger = new Logger('GameGateway');
  
	@SubscribeMessage('joinqueue')
	async handleJoinQueue(client: any, token: string) {
		try {
			let token = client.handshake.query.token;
			if (Array.isArray(token)) token = token[0];
			const userID = await this.loginService.getUserIDFromCache(token);
			if (this.queue.length >= 1 && this.queue.indexOf(userID) === -1)
			{
				const otherID: number = this.queue.shift();
				const game = await this.gameService.createGame(userID, otherID, token);
				if (game == null)
					throw new InternalServerErrorException('Error creating the game');
				const userSocketID: string = await this.userService.getSocketIDByUserID(userID, token);
				const otherSocketID: string = await this.userService.getSocketIDByUserID(otherID, token);
				this.server.to(userSocketID).to(otherSocketID).emit('newGame');
				await this.prismaService.user.update({
					where: { ID: userID },
					data: { status: UserStatus.IN_GAME },
				});
				await this.prismaService.user.update({
					where: { ID: otherID },
					data: { status: UserStatus.IN_GAME },
				});
			}
			else
			{
				if (this.queue.indexOf(userID) > -1)
					return;
			  this.queue.push(userID);
			}
		} catch (error) {
			this.errorHandlingService.emitHttpException(error, client);
		}
	}

	@SubscribeMessage('leavequeue')
	async handleLeaveQueue(client: any, token: string) {
		try {
			const userID = await this.loginService.getUserIDFromCache(token);
			if (this.queue.indexOf(userID) >= 0)
			{
			  this.queue.splice(this.queue.indexOf(userID));
			}
		} catch(error) {
			this.errorHandlingService.emitHttpException(error, client);
		}
	}
  
	afterInit(server: Namespace) {
	  this.logger.log('WebSocket Gateway Initialized');
	}
  
	async handleConnection(client: Socket): Promise<void> {
		try {
			let token = client.handshake.query.token;
			if (Array.isArray(token)) token = token[0];
			const userID = await this.loginService.getUserIDFromCache(token);
			await this.prismaService.user.update({where: {ID: userID}, data: {websocketID: client.id}})
		  } catch (error) {
			this.errorHandlingService.emitHttpException(error, client);
		  }
	  }
	  async handleDisconnect(client: Socket): Promise<void> {
		try {
			const user = await this.prismaService.user.findUnique({where: {websocketID: client.id}, select: {ID: true}});
			if (!user) {
			  throw new NotFoundException('User not found')
			}
			await this.prismaService.user.update({
			  where: { ID: user.ID },
			  data: { websocketID: null, status: UserStatus.ONLINE },
			});
		  } catch (error) {
			this.errorHandlingService.emitHttpException(error, client);
		  }
	  }
  }
