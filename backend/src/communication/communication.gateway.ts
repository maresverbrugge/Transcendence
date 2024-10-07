import {WebSocketServer, SubscribeMessage, WebSocketGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { CommunicationService } from './communication.service';
import { User, Channel } from '@prisma/client'

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000', // Update with your client's origin
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

export class CommunicationGateway 
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  
  @WebSocketServer() server: Server;

  constructor(private readonly communicationService: CommunicationService) {}
  
  @SubscribeMessage('chatInvite')
    handleChatInvite(client: Socket, member: string ) {
      console.log('Chat invite received from:', client.id);

      // If the member is connected, send the chat invite to them
      this.server.to(member).emit('chatInvite', {
        owner: client.id,
        member: member,
    });
      
      console.log(`Chat invite sent to ${member}`);
    }

  @SubscribeMessage('acceptChatInvite')
    async handleAcceptChatInvite(client: Socket, invite: { owner: string; member: string }) {
      const { owner, member } = invite;
      console.log(`${member} accepted ${owner} invitation`)
      const newChannel: Channel = await this.communicationService.createChannel(owner, member)
      this.server.to(owner).emit ('newChannel', newChannel)
      this.server.to(member).emit('newChannel', newChannel)
    }

  afterInit(server: Server) {
    console.log('Communication Gateway Initialized');
  }

  async handleConnection(client: Socket, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);

      const users: User[] = await this.communicationService.getUsers();
      client.emit('users', users);

      const user = await this.communicationService.createUser(client.id)
      this.server.emit('userOnline', user)
  }

  async handleDisconnect(client: Socket) {
    const user = await this.communicationService.deleteUserByUsername(client.id)
    console.log(`Client disconnected: ${client.id}`);
    this.server.emit('userOffline', user)
  }

}
