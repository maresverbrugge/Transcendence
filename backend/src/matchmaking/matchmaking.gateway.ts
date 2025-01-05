  import { WebSocketServer, SubscribeMessage, MessageBody, WebSocketGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
  import { Logger } from '@nestjs/common';
  import { Socket, Namespace } from 'socket.io';
  import { PrismaService } from 'src/prisma/prisma.service';
  import { UserService } from 'src/user/user.service';
  import { User, UserStatus, Match } from '@prisma/client';
  import { GameService } from 'src/game/game.service';
import { LoginService } from 'src/authentication/login/login.service';
  
  @WebSocketGateway({
	namespace: 'matchmaking',
	cors: {
	  origin: process.env.REACT_APP_URL_FRONTEND, // Update with your client's origin
	  methods: ['GET', 'POST'],
	  transports: ['websocket'],
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
  
	// @SubscribeMessage('message')
	// handleMessage(@MessageBody() data: { sender: string; message: string }) {
	//   this.logger.log(`Message received from ${data.sender}: ${data.message}`);
	//   // Broadcast the message to all connected clients
	//   this.server.emit('message', data);
	// }
  
	@SubscribeMessage('joinqueue')
	async handleJoinQueue(client: any, token: string) {
	  const userID = await this.loginService.getUserIDFromCache(token);
	  if (this.queue.length >= 1)
	  {
		const otherID: number = this.queue.pop();
		// make game
		await this.gameService.createGame(userID, otherID);
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
		} catch (error) {
		//   if (!(error instanceof HttpException)) error = new InternalServerErrorException('An unexpected error occurred', error.message);
		  console.error(error)
		  client.emit('error', error)
		}
	  }
	  async handleDisconnect(client: Socket): Promise<void> {
		try {
		  console.log(`Client disconnected: ${client.id}`);
		} catch (error) {
		//   if (!(error instanceof HttpException)) error = new InternalServerErrorException('An unexpected error occurred', error.message);
		  console.error(error)
		  client.emit('error', error)
		}
	  }
  }
