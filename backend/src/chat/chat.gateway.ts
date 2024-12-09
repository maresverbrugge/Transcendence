import {WebSocketServer, SubscribeMessage, MessageBody, WebSocketGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import {Inject, forwardRef } from '@nestjs/common'
import { Socket, Namespace } from 'socket.io';
import { UserService } from './user/user.service';
import { ChannelService } from './channel/channel.service'
import { MessageService } from './message/message.service'
import { ChannelMemberService } from './channel-member/channel-member.service';
import { Channel, ChannelMember, User, Message } from '@prisma/client'

type ChannelWithMembersAndMessages = Channel & {
  members: (ChannelMember & {
      user: Pick<User, 'ID' | 'username'>;
  })[];
  messages: Message[];
};

type action = 'demote' | 'makeAdmin' | 'mute' | 'kick' | 'ban' | 'join' | 'leave'

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

export class ChatGateway 
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  
  @WebSocketServer() server: Namespace;

  constructor(
    @Inject(forwardRef(() => ChannelService))
    private readonly channelService: ChannelService,
    private readonly userService: UserService,
    @Inject(forwardRef(() => MessageService))
    private readonly messageService: MessageService,
    @Inject(forwardRef(() => ChannelMemberService))
    private readonly channelMemberService: ChannelMemberService,
  ) {}

  @SubscribeMessage('newChannel')
  async handleNewChannel(client: Socket, channel: ChannelWithMembersAndMessages) {
    this.channelService.emitNewChannel(this. server, channel)
  }

  @SubscribeMessage('joinChannel')
  async handleJoinChannel(client: Socket, data: { channelID: number, token:string }) {
    const channelMember = await this.channelMemberService.getChannelMemberBySocketID(data.token, data.channelID) //change to token later
    this.channelService.joinChannel(data.channelID, client, channelMember.user.username, channelMember.isOwner)
  }

  @SubscribeMessage('leaveChannel')
  async handleLeaveChannel(client: Socket, data: { channelID: number, token:string }) {
    this.channelService.removeChannelMemberFromChannel(data.channelID, client, data.token)
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: Socket, data: { channelID: number, token: string, content: string }) {
    this.messageService.sendMessage(client, data)
  }

  @SubscribeMessage('channelAction')
  async handleChannelAction(@MessageBody() data: { action: action, channelMemberID: number; token: string; channelID: number }) {
  const { action, channelMemberID, token, channelID } = data;
  await this.channelMemberService.action(this.server, channelMemberID, token, channelID, action);
}

  @SubscribeMessage('updateChannel')
  async handleAddMember(@MessageBody() userID: number) {
    this.channelService.updateChannel(userID)
  }

  afterInit(server: Namespace) {
    console.log('Chat Gateway Initialized');
  }

  async handleConnection(client: Socket, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);
    let token = client.handshake.query.token; // er komt een IDentifiyer via de token
    if (Array.isArray(token))
      token = token[0]; // Use the first element if token is an array
    const user = await this.userService.assignSocketAndTokenToUserOrCreateNewUser(client.id, token as string, this.server) // voor nu om de socket toe te wijzen aan een user zonder token
    this.server.emit('userStatusChange', user.ID, 'ONLINE') //dit moet worden verplaats naar de plek waar je in en uitlogd, niet waar je connect met de Socket
    client.emit('token', client.id) //even socketID voor token vervangen tijdelijk
    await this.channelMemberService.addSocketToAllRooms(client, token)
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    const user = await this.userService.getUserBySocketID(client.id);
    await this.userService.removeWebsocketIDFromUser(client.id)
    if (user)
      this.server.emit('userStatusChange', user.ID, 'OFFLINE') //dit moet worden verplaats naar de plek waar je in en uitlogd, niet waar je connect met de Socket
  }

  async addSocketToRoom(userID: number, channelID: number) {
    const socket = await this.getWebSocketByUserID(userID)
    if (socket) {
      const user = await this.userService.getUserByUserID(userID)
      this.channelService.joinChannel(channelID, socket, user.username, false)
    }
  }

  async getWebSocketByUserID(userID: number): Promise<Socket | null> {
    return this.userService.getWebSocketByUserID(this.server, userID)
  }

  emitToRoom(message: string, room: string, body? :any) {
    if (body)
      this.server.to(room).emit(message, body)
    else
      this.server.to(room).emit(message);
  }
}
