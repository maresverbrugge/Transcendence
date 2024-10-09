import {WebSocketServer, SubscribeMessage, WebSocketGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { UserService } from './user/user.service';
import { ChannelService } from './channel/channel.service'
import { MessageService } from './message/message.service'
import { User, Channel, Message } from '@prisma/client'

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

  constructor(
    private readonly channelService: ChannelService,
    private readonly userService: UserService,
    private readonly messageService: MessageService,
  ) {}

  @SubscribeMessage('getUsers')
    handleGetUsers(client: Socket) {this.userService.getUsers(client)}
  
  @SubscribeMessage('channelInvite')
    handleChannelInvite(client: Socket, memberId: number ) {
      this.channelService.sendChannelInvite(client, this.server, memberId)
    }

  @SubscribeMessage('acceptChannelInvite')
    async handleAcceptChannelInvite(memberSocket: Socket, ownerSocketId: string) {
      this.channelService.acceptChannelInvite(this.server, memberSocket, ownerSocketId)
    }

  @SubscribeMessage('joinChannel')
    handleJoinChannel(client: Socket, channelId: string) {
      client.join(String(channelId))
      console.log(`socket ${client.id} joined room ${channelId}`)
    }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: Socket, data: {content: string, channelId: number}) {
      const senderId = await this.userService.getUserIdBySocketId(client.id)
      const newMessage: Message = await this.messageService.createMessage(data.content, senderId, data.channelId)
      this.server.to(String(data.channelId)).emit('newMessage', newMessage)
  }

  afterInit(server: Server) {
    console.log('Communication Gateway Initialized');
  }

  async handleConnection(client: Socket, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);
      //for now: create new users and let other users know theres a new user online
      const user = await this.userService.createUser(client.id)
      this.server.emit('userOnline', user)
  }

  async handleDisconnect(client: Socket) {
    const user = await this.userService.deleteUserByUsername(client.id)
    console.log(`Client disconnected: ${client.id}`);
    this.server.emit('userOffline', user)
  }

}
