  import { WebSocketServer, SubscribeMessage, MessageBody, WebSocketGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
  import { Logger } from '@nestjs/common';
  import { Socket, Namespace } from 'socket.io';
  import { PrismaService } from 'src/prisma/prisma.service';
  import { UserService } from 'src/user/user.service';
  import { User, Match } from '@prisma/client';
  import { GameService } from 'src/game/game.service';
  
  @WebSocketGateway({
	namespace: 'matchmaking',
	cors: {
	  origin: 'http://localhost:3000', // Update with your client's origin
	  methods: ['GET', 'POST'],
	  transports: ['websocket'],
	  credentials: true,
	},
  })
  export class MatchmakingGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor(
	  private readonly userService: UserService,
	  private readonly gameService: GameService
	) {}
	@WebSocketServer() server: Namespace;
	private queue: number[];
	private logger: Logger = new Logger('GameGateway');
  
	// @SubscribeMessage('message')
	// handleMessage(@MessageBody() data: { sender: string; message: string }) {
	//   this.logger.log(`Message received from ${data.sender}: ${data.message}`);
	//   // Broadcast the message to all connected clients
	//   this.server.emit('message', data);
	// }
  
	@SubscribeMessage('joinqueue')
	async handleJoinQueue(client: any, token: string) {
	  const userID = await this.userService.getUserIDByToken(token);
	  if (this.queue.length >= 1)
	  {
		const otherID: number = this.queue.pop();
		// make game
		await this.gameService.createGame(userID, otherID);
		const userSocketID: string = await this.userService.getSocketIDByUserID(userID);
		const otherSocketID: string = await this.userService.getSocketIDByUserID(otherID);
		this.server.to(userSocketID).to(otherSocketID).emit('newGame');
	  }
	  else
	  {
		this.queue.push(userID);
	  }
	}

	@SubscribeMessage('leavequeue')
	async handleLeaveQueue(client: any, token: string) {
	  const userID = await this.userService.getUserIDByToken(token);
	  if (this.queue.includes(userID))
	  {
		this.queue.splice(this.queue.indexOf(userID));
	  }
	}
  
	afterInit(server: Namespace) {
	  this.logger.log('WebSocket Gateway Initialized');
	}
  
	async handleConnection(client: Socket, ...args: any[]) {
	  console.log(`Client connected: ${client.id}`);
	  let token = client.handshake.query.token; // er komt een identifiyer via de token
	  if (Array.isArray(token)) {
		token = token[0]; // Use the first element if token is an array
	  }
	  const user = await this.userService.assignSocketAndTokenToUserOrCreateNewUser(
		client.id,
		token as string,
		this.server
	  ); // voor nu om de socket toe te wijzen aan een user zonder token
	  this.server.emit('userStatusChange', user.ID, 'ONLINE'); //dit moet worden verplaats naar de plek waar je in en uitlogd, niet waar je connect met de Socket
	  client.emit('token', client.id); //even socketID voor token vervangen tijdelijk
	}
  
	async handleDisconnect(client: Socket) {
	  console.log(`Client disconnected: ${client.id}`);
	  const user = await this.userService.getUserBySocketID(client.id);
	  await this.userService.removewebsocketIDFromUser(client.id);
	  if (user) {
		this.server.emit('userStatusChange', user.ID, 'OFFLINE'); //dit moet worden verplaats naar de plek waar je in en uitlogd, niet waar je connect met de Socket
	  }
	}
  }
