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

@WebSocketGateway({
	cors: {
	  origin: 'http://localhost:3001', // Update with your client's origin
	  methods: ['GET', 'POST'],
	  credentials: true,
	},
})
export class GameGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
	{
	@WebSocketServer() server: Server;
	private logger: Logger = new Logger('GameGateway');

	@SubscribeMessage('message')
	handleMessage(@MessageBody() data: { sender: string; message: string }) {
	  this.logger.log(`Message received from ${data.sender}: ${data.message}`);
	  // Broadcast the message to all connected clients
	  this.server.emit('message', data);
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