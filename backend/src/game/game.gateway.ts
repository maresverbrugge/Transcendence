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
import { User, Match } from '@prisma/client';
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
    const member: user = await this.userService.getUserByToken(token);
    const game = await this.prisma.match.findunique({
      where: {
        players: {
	  has: member
	},
      },
      select: {
        matchID: true,
      },
    });
    client.emit('gameID', game.matchID);
  }

  @SubscribeMessage('start')
  handleGameStart() {
	this.ballspeedy = Math.floor(Math.random() * 6 - 3)
    this.server.emit('ballSpeedY', this.ballspeedy);
  }

  @SubscribeMessage('key')
  async handleKey(@MessageBody() data: { move: string; gameID: number; socketID: string }) {
    const playerID: number = await this.userService.getUserIDBySocketID(data[2]);
    const game = await this.gameService.getPlayers(parseInt(data[1]));
    if (game.players[0].ID === playerID) {
      if (data[0] === 'up') this.server.emit('right up');
      else this.server.emit('right down');
    } else {
      if (data[0] === 'up') this.server.emit('left up');
      else this.server.emit('left down');
    }
  }

  @SubscribeMessage('left scored')
  async handleScoreLeft(client: Socket, gameID: string) {
    await this.prisma.match.update({
      where: {
        matchID: parseInt(gameID),
      },
      data: {
        scorePlayer1: {
          increment: 1,
        },
      },
    });
  }

  @SubscribeMessage('right scored')
  async handleScoreRight(client: Socket, gameID: string) {
    await this.prisma.match.update({
      where: {
        matchID: parseInt(gameID),
      },
      data: {
        scorePlayer2: {
          increment: 1,
        },
      },
    });
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
    client.emit('token', client.id); //even socketID voor token vervangen tijdelijk
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    const user = await this.userService.getUserBySocketID(client.id);
    await this.userService.removewebsocketIDFromUser(client.id);
  }
}
