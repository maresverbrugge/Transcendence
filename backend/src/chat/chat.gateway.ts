import {
  WebSocketServer,
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { HttpException, Inject, InternalServerErrorException, NotFoundException, forwardRef } from '@nestjs/common';
import { Socket, Namespace } from 'socket.io';
import { Channel, ChannelMember, User, Message } from '@prisma/client';

import { UserService } from './blockedUser/user.service';
import { ChannelService } from './channel/channel.service';
import { MessageService } from './message/message.service';
import { ChannelMemberService } from './channel-member/channel-member.service';
import { PrismaService } from 'src/prisma/prisma.service';

type ChannelWithMembersAndMessages = Channel & {
  members: (ChannelMember & {
    user: Pick<User, 'ID' | 'username'>;
  })[];
  messages: Message[];
};

type action = 'demote' | 'makeAdmin' | 'mute' | 'kick' | 'ban' | 'join' | 'leave';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Namespace;

  constructor(
    @Inject(forwardRef(() => ChannelService))
    private readonly channelService: ChannelService,
    private readonly userService: UserService,
    @Inject(forwardRef(() => MessageService))
    private readonly messageService: MessageService,
    @Inject(forwardRef(() => ChannelMemberService))
    private readonly channelMemberService: ChannelMemberService,
    private prisma: PrismaService
  ) {}

  @SubscribeMessage('newChannel')
  async handleNewChannel(client: Socket, channel: ChannelWithMembersAndMessages): Promise<void> {
    try {
      this.channelService.emitNewChannel(this.server, channel);
    } catch (error) {
      if (!(error instanceof HttpException)) error = new InternalServerErrorException('An unexpected error occurred', error.message);
      client.emit('error', error)
    }
  }

  @SubscribeMessage('joinChannel')
  async handleJoinChannel(client: Socket, data: { channelID: number; token: string }): Promise<void> {
    try {
      const channelMember = await this.channelMemberService.getChannelMemberBySocketID(data.token, data.channelID); //change to token later
      await this.channelService.joinChannel(data.channelID, client, channelMember.user.username);
    } catch (error) {
      if (!(error instanceof HttpException)) error = new InternalServerErrorException('An unexpected error occurred', error.message);
      client.emit('error', error)
    }
  }

  @SubscribeMessage('leaveChannel')
  async handleLeaveChannel(client: Socket, data: { channelID: number; token: string }): Promise<void> {
    try {
        await this.channelService.removeChannelMemberFromChannel(data.channelID, client, data.token);
    } catch (error) {
      if (!(error instanceof HttpException)) error = new InternalServerErrorException('An unexpected error occurred', error.message);
      client.emit('error', error)
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: Socket, data: { channelID: number; token: string; content: string }): Promise<void> {
    try {
      await this.messageService.sendMessage(client, data);
    } catch (error) {
      if (!(error instanceof HttpException)) error = new InternalServerErrorException('An unexpected error occurred', error.message);
      client.emit('error', error)
    }
  }

  @SubscribeMessage('channelAction')
  async handleChannelAction(client: Socket, data: { action: action; channelMemberID: number; token: string; channelID: number }
  ): Promise<void> {
    try {
      const { action, channelMemberID, token, channelID } = data;
      await this.channelMemberService.action(this.server, channelMemberID, token, channelID, action);
    } catch (error) {
      if (!(error instanceof HttpException)) error = new InternalServerErrorException('An unexpected error occurred', error.message);
      client.emit('error', error)
    }
  }

  @SubscribeMessage('updateChannel')
  async handleAddMember(client: Socket, userID: number): Promise<void> {
    try {
      await this.channelService.updateChannel(userID);
    } catch (error) {
      if (!(error instanceof HttpException)) error = new InternalServerErrorException('An unexpected error occurred', error.message);
      client.emit('error', error)
    }
  }

  afterInit(): void {
    console.log('Chat Gateway Initialized');
  }

  async handleConnection(client: Socket): Promise<void> {
    try {
      console.log(`Client connected: ${client.id}`);
      let token = client.handshake.query.token; // er komt een IDentifiyer via de token
      if (Array.isArray(token)) token = token[0]; // Use the first element if token is an array
      const user = await this.userService.assignSocketAndTokenToUserOrCreateNewUser(
        client.id,
        token as string,
        this.server
      ); // voor nu om de socket toe te wijzen aan een user zonder token
      this.server.emit('userStatusChange', user.ID, 'ONLINE'); //dit moet worden verplaats naar de plek waar je in en uitlogd, niet waar je connect met de Socket
      client.emit('token', client.id); //even socketID voor token vervangen tijdelijk
      await this.channelMemberService.addSocketToAllRooms(client, token);
    } catch (error) {
      if (!(error instanceof HttpException)) error = new InternalServerErrorException('An unexpected error occurred', error.message);
      client.emit('error', error)
    }
  }

  async handleDisconnect(client: Socket): Promise<void> {
    try {
      console.log(`Client disconnected: ${client.id}`);
      const user = await this.userService.getUserBySocketID(client.id);
      await this.prisma.user.update({
        where: { ID: user.ID },
        data: { websocketID: null },
      });
      this.server.emit('userStatusChange', user.ID, 'OFFLINE');
    } catch (error) {
      if (!(error instanceof HttpException)) error = new InternalServerErrorException('An unexpected error occurred', error.message);
      client.emit('error', error)
    }
  }

  async addSocketToRoom(userID: number, channelID: number): Promise<void> {
    const socket = await this.getWebSocketByUserID(userID);
    const user = await this.userService.getUserByUserID(userID);
    this.channelService.joinChannel(channelID, socket, user.username);
  }

  async getWebSocketByUserID(userID: number): Promise<Socket> {
    try {
      const user = await this.prisma.user.findUnique({ where: { ID: userID }, select: { websocketID: true } });
      if (!user) throw new NotFoundException('User not found');
      const socket: Socket = this.server.sockets.get(user.websocketID);
      if (!socket?.connected) throw new NotFoundException('Websocket not found');
      return socket;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('An unexpected error occurred', error.message);
    }
  }

  emitToRoom(message: string, room: string, body?: any): void {
    if (body) this.server.to(room).emit(message, body);
    else this.server.to(room).emit(message);
  }

  emitToSocket(message: string, socket: Socket, body?: any): void {
    if (socket.connected) {
      if (body) socket.emit(message, body);
      else socket.emit(message);
    }
  }
}
