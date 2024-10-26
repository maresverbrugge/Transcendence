import {WebSocketServer, SubscribeMessage, WebSocketGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { UserService } from './user/user.service';
import { ChannelService } from './channel/channel.service'
import { MessageService } from './message/message.service'

@WebSocketGateway({
  namespace: 'chat',
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

  constructor(
    private readonly channelService: ChannelService,
    private readonly userService: UserService,
    private readonly messageService: MessageService,
  ) {}
  
  // @SubscribeMessage('channelInvite')
  //   handleChannelInvite(client: Socket, memberID: number ) {
  //     this.channelService.sendChannelInvite(client, this.server, memberID)
  //   }

  // @SubscribeMessage('acceptChannelInvite')
  //   async handleAcceptChannelInvite(client: Socket, data: { ownerID: number, memberID: number , channelName: string}) {
  //     this.channelService.acceptChannelInvite(this.server, data.memberID, data.ownerID, data.channelName)
  //   }

  @SubscribeMessage('newChannel')
  async handleNewChannel(client: Socket, data: {name: string, isPrivate: boolean, password?: string, ownerID: number, memberIDs: number[] }) {
    this.channelService.newChannel(this.server, data)
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: Socket, data: { channelID: number, senderID: number, content: string }) {
    this.messageService.sendMessage(this.server, data)
  }

  afterInit(server: Server) {
    console.log('Communication Gateway Initialized');
  }

  async handleConnection(client: Socket, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);
    const token = client.handshake.query.token;
    const userID = 1; //Hier komt een identifier via de token!
    this.userService.createUser(client.id); // voor nu even create user. Dit wordt update user om socket aan user toe te voegen
    this.server.emit('userStatusChange', userID, 'ONLINE') //dit moet worden verplaats naar de plek waar je in en uitlogd, niet waar je connect met de Socket
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.userService.deleteUserBySocketID(client.id)
    const userID = 1; //Hier komt een identifier via de token!
    this.server.emit('userStatusChange', userID, 'OFFLINE') //dit moet worden verplaats naar de plek waar je in en uitlogd, niet waar je connect met de Socket
  }

}
