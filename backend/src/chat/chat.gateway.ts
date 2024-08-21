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
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000', // Update with your client's origin
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ChatGateway');

  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('message')
  async handleMessage(@MessageBody() data: { sender: string; message: string }) {
    this.logger.log(`Message received from ${data.sender}: ${data.message}`);

    //save message to the database
    await this.chatService.createMessage(data.sender, data.message);

    // Broadcast the message to all connected clients
    this.server.emit('message', data);
  }

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Initialized');
  }

  async handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);

      // Send chat history to the new client
      const messages = await this.chatService.getMessages();
      client.emit('chatHistory', messages);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
}
