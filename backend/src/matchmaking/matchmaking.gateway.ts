  import { WebSocketServer, SubscribeMessage, WebSocketGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
  import { Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
  import { Socket, Namespace } from 'socket.io';
  import { PrismaService } from 'src/prisma/prisma.service';
  import { UserService } from 'src/user/user.service';
  import { User, UserStatus, Match } from '@prisma/client';
  import { GameService } from 'src/game/game.service';
import { LoginService } from 'src/authentication/login/login.service';
  
  @WebSocketGateway({
	namespace: 'matchmaking',
	cors: {
	  origin: 'http://localhost:3000', // Update with your client's origin
	  methods: ['GET', 'POST'],
	  credentials: true,
	},
  })
  export class MatchmakingGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor(
	  private readonly userService: UserService,
	  private readonly gameService: GameService,
	  private readonly prismaService: PrismaService,
	  private readonly loginService: LoginService
	) {}
	@WebSocketServer() server: Namespace;
	private queue: number[] = [];
	private logger: Logger = new Logger('GameGateway');
  
	@SubscribeMessage('joinqueue')
	async handleJoinQueue(client: any, token: string) {
		try {
			const userID = await this.loginService.getUserIDFromCache(token);
			console.log(this.queue);
			if (this.queue.length >= 1)
			{
				const otherID: number = this.queue.shift();
				// make game
				const game = await this.gameService.createGame(userID, otherID);
				if (game == null)
					throw new InternalServerErrorException('Error creating the game');
				const userSocketID: string = await this.userService.getSocketIDByUserID(userID);
				const otherSocketID: string = await this.userService.getSocketIDByUserID(otherID);
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
			  this.queue.push(userID);
			}
		} catch (error) {
			console.log(error);
			client.emit('error');
		}
	}

	@SubscribeMessage('leavequeue')
	async handleLeaveQueue(client: any, token: string) {
	  const userID = await this.loginService.getUserIDFromCache(token);
	  if (this.queue.indexOf(userID) >= 0)
	  {
		this.queue.splice(this.queue.indexOf(userID));
	  }
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
			await this.prismaService.user.update({where: {ID: userID}, data: {websocketID: client.id}})
		  } catch (error) {
			// this.errorHandlingService.emitHttpException(error, client);
		  }
	  }
	  async handleDisconnect(client: Socket): Promise<void> {
		try {
			console.log(`Client disconnected: ${client.id}`);
			const user = await this.prismaService.user.findUnique({where: {websocketID: client.id}, select: {ID: true}});
			if (!user) {
			  throw new NotFoundException('User not found')
			}
			await this.prismaService.user.update({
			  where: { ID: user.ID },
			  data: { websocketID: null, status: UserStatus.ONLINE },
			});
		  } catch (error) {
			// this.errorHandlingService.emitHttpException(error, client);
		  }
	  }
  }
