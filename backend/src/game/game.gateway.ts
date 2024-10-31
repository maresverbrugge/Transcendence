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
import { Socket, Server } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/chat/user/user.service';
import { User, Match } from '@prisma/client'

@WebSocketGateway({
	namespace: 'game',
	cors: {
	  origin: 'http://localhost:3000', // Update with your client's origin
	  methods: ['GET', 'POST'],
	  transports: ['websocket'],
	  credentials: true,
	},
})
export class GameGateway
implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	// private paddleRightY: number = 250;
	// private paddleLeftY: number = 250;
	constructor(
        private prisma: PrismaService,
        private readonly userService: UserService,
    ) {}
	@WebSocketServer() server: Server;
	private logger: Logger = new Logger('GameGateway');

	// @SubscribeMessage('message')
	// handleMessage(@MessageBody() data: { sender: string; message: string }) {
	//   this.logger.log(`Message received from ${data.sender}: ${data.message}`);
	//   // Broadcast the message to all connected clients
	//   this.server.emit('message', data);
	// }

	@SubscribeMessage('createNewGame')
	async handleNewGame(client: any, clientId: string) {
		// const member: User = await this.userService.getUserBySocketId(clientId)
		// const member1: User = await this.userService.getUserByUserId(memberId1)
		// const memberSocket1: Socket = this.server.sockets.sockets.get(member1.websocketId);
		// const member2: User = await this.userService.getUserByUserId(memberId2)
		// const memberSocket2: Socket = this.server.sockets.sockets.get(member2.websocketId);
		const newGame : Match = await this.prisma.match.create({
			data: {
				status: "PENDING",
			}
		});
		this.server.emit('newGame', {
			gameId: newGame.matchId
        });
	}

	@SubscribeMessage('acceptGame')
	async handleNewGameAccept(client: any, gameId: string) {
		const id: number = parseInt(gameId);
		const updatedMatch: Match = await this.prisma.match.update({
			where: {
				matchId: id,
			},
			data: {
				status: "ACCEPTED",
				updatedAt: new Date(),
			},
		})
	}

	@SubscribeMessage('frame')
	handleFrame() {
		console.log('a frame is made in the backend');
	}

	@SubscribeMessage('up')
	handleUpKey() {
		// this.paddleRightY -= 3;
		// this.server.emit('paddleY', this.paddleRightY);
		// console.log('the up arrow has been pressed');
	}

	afterInit(server: Server) {
	  this.logger.log('WebSocket Gateway Initialized');
	}

	handleConnection(client: Socket, ...args: any[]) {
	  this.logger.log(`Client connected: ${client.id}`);
	}

	handleDisconnect(client: Socket) {
	  this.logger.log(`Client disconnected: ${client.id}`);
	}
}