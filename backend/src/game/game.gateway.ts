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
	@WebSocketServer() server: Namespace;
	private logger: Logger = new Logger('GameGateway');

	// @SubscribeMessage('message')
	// handleMessage(@MessageBody() data: { sender: string; message: string }) {
	//   this.logger.log(`Message received from ${data.sender}: ${data.message}`);
	//   // Broadcast the message to all connected clients
	//   this.server.emit('message', data);
	// }

	@SubscribeMessage('createNewGame')
	async handleNewGame(client: any, socketID: string) {
		const member: User = await this.userService.getUserBySocketID(socketID);
		const newGame : Match = await this.prisma.match.create({
			data: {
				status: "PENDING",
				players: [member]
			}
		});
		this.server.emit('newGame', {
			gameID: newGame,
        });
	}

	@SubscribeMessage('acceptGame')
	async handleNewGameAccept(client: any, gameID: string, socketID: string) {
		const member: User = await this.userService.getUserBySocketID(socketID);
		const updatedMatch: Match = await this.prisma.match.update({
			where: {
				matchID: parseInt(gameID),
			},
			data: {
				status: "ACCEPTED",
				updatedAt: new Date(),
				players: {
					push: member
				}
			},
		})
	}

	@SubscribeMessage('start')
	handleGameStart() {
		this.server.emit('ballSpeedY', Math.floor(Math.random() * 6 - 3));
	}

	@SubscribeMessage('up')
	async handleUpKey(client: any, gameID: string, socketID: string) {
		const playerID: number = await this.userService.getUserIDBySocketID(socketID);
		const game = this.prisma.match.findUnique({
			where: { matchID: parseInt(gameID) },
		  });
		if (game.players[0].ID === playerID)
		{
			this.server.emit('right up');
		}
		else
		{
			this.server.emit('left up');
		}
	}

	@SubscribeMessage('down')
	async handleDownKey(client: any, gameID: string, socketID: string) {
		const playerID: number = await this.userService.getUserIDBySocketID(socketID);
		const game = this.prisma.match.findUnique({
			where: { matchID: parseInt(gameID) },
		  });
		if (game.players[0].ID === playerID)
		{
			this.server.emit('right down');
		}
		else
		{
			this.server.emit('left down');
		}
	}

	@SubscribeMessage('left scored')
	async handleScoreLeft(client: any, gameID: string) {
		const updatedMatch: Match = await this.prisma.match.update({
			where: {
				matchID: parseInt(gameID),
			},
			data: {
				scorePlayer1: {
					increment: 1
				}
			},
		})
	}

	@SubscribeMessage('right scored')
	async handleScoreRight(client: any, gameID: string) {
		const updatedMatch: Match = await this.prisma.match.update({
			where: {
				matchID: parseInt(gameID),
			},
			data: {
				scorePlayer2: {
					increment: 1
				}
			},
		})
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
		const user = await this.userService.assignSocketAndTokenToUserOrCreateNewUser(client.id, token as string, this.server) // voor nu om de socket toe te wijzen aan een user zonder token
		this.server.emit('userStatusChange', user.ID, 'ONLINE') //dit moet worden verplaats naar de plek waar je in en uitlogd, niet waar je connect met de Socket
		client.emit('token', client.id) //even socketID voor token vervangen tijdelijk
	}

	async handleDisconnect(client: Socket) {
		console.log(`Client disconnected: ${client.id}`);
		const user = await this.userService.getUserBySocketID(client.id);
		await this.userService.removeWebsocketIDFromUser(client.id)
		if (user) {
		  this.server.emit('userStatusChange', user.ID, 'OFFLINE') //dit moet worden verplaats naar de plek waar je in en uitlogd, niet waar je connect met de Socket
		}
	}
}