import {
  WebSocketServer,
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Inject, NotFoundException, forwardRef } from '@nestjs/common';
import { Socket, Namespace } from 'socket.io';
import { Channel, ChannelMember, User, Message, UserStatus } from '@prisma/client';

import { ChannelService } from './channel/channel.service';
import { MessageService } from './message/message.service';
import { ChannelMemberService } from './channel-member/channel-member.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { GameInviteService } from './gameInvite/game-invite.service';
import { LoginService } from 'src/authentication/login/login.service';
import { MessagePipe } from './pipes/message.pipe';
import { ErrorHandlingService } from 'src/error-handling/error-handling.service';

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
    origin: process.env.URL_FRONTEND,
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Namespace;

  constructor(
    @Inject(forwardRef(() => ChannelService))
    private readonly channelService: ChannelService,
    private readonly loginService: LoginService,
    @Inject(forwardRef(() => MessageService))
    private readonly messageService: MessageService,
    @Inject(forwardRef(() => ChannelMemberService))
    private readonly channelMemberService: ChannelMemberService,
    @Inject(forwardRef(() => GameInviteService))
    private readonly gameInviteService: GameInviteService,
    private prisma: PrismaService,
    private readonly errorHandlingService: ErrorHandlingService,
  ) {}

  @SubscribeMessage('newChannel')
  async handleNewChannel(client: Socket, channel: ChannelWithMembersAndMessages): Promise<void> {
    try {
      await this.channelService.emitNewChannel(this.server, channel);
    } catch (error) {
      this.errorHandlingService.emitHttpException(error, client);
    }
  }

  @SubscribeMessage('joinChannel')
  async handleJoinChannel(client: Socket, data: { channelID: number; token: string }): Promise<void> {
    try {
      const channelMember = await this.channelMemberService.getChannelMemberByToken(data.token, data.channelID);
      await this.channelService.joinChannel(data.channelID, client, channelMember.user.username);
    } catch (error) {
      this.errorHandlingService.emitHttpException(error, client);
    }
  }

  @SubscribeMessage('leaveChannel')
  async handleLeaveChannel(client: Socket, data: { channelID: number; token: string }): Promise<void> {
    try {
        await this.channelService.removeChannelMemberFromChannel(data.channelID, client, data.token);
    } catch (error) {
      this.errorHandlingService.emitHttpException(error, client);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: Socket, data: { channelID: number; token: string; content: string }): Promise<void> {
    try {
      const messagePipe = new MessagePipe();
      data.content = messagePipe.transform(data.content as string);
      await this.messageService.sendMessage(client, data);
    } catch (error) {
      this.errorHandlingService.emitHttpException(error, client);
    }
  }

  @SubscribeMessage('channelAction')
  async handleChannelAction(client: Socket, data: { action: action; channelMemberID: number; token: string; channelID: number }
  ): Promise<void> {
    try {
      const { action, channelMemberID, token, channelID } = data;
      await this.channelMemberService.action(this.server, channelMemberID, token, channelID, action);
    } catch (error) {
      this.errorHandlingService.emitHttpException(error, client);
    }
  }

  @SubscribeMessage('updateChannel')
  async handleAddMember(client: Socket, userID: number): Promise<void> {
    try {
      await this.channelService.updateChannel(userID);
    } catch (error) {
      this.errorHandlingService.emitHttpException(error, client);
    }
  }

  @SubscribeMessage('sendGameInvite')
  async sendGameInvite(client: Socket, data: {receiverUserID: number, token: string}): Promise<void> {
    try {
      await this.gameInviteService.sendGameInvite(client, data.receiverUserID, data.token);
    } catch (error) {
      this.errorHandlingService.emitHttpException(error, client);
    }
  }

  @SubscribeMessage('cancelGameInvite')
  async cancelGameInvite(client: Socket, data: {receiverUserID: number, token: string}): Promise<void> {
    try {
      await this.gameInviteService.cancelGameInvite(data.receiverUserID, data.token);
    } catch (error) {
      this.errorHandlingService.emitHttpException(error, client);
    }
  }

  @SubscribeMessage('declineGameInvite')
  async declineGameInvite(client: Socket, data: {senderUserID: number, message: string, token: string}): Promise<void> {
    try {
      await this.gameInviteService.declineGameInvite(data.senderUserID, data.message, data.token);
    } catch (error) {
      this.errorHandlingService.emitHttpException(error, client);
    }
  }

  @SubscribeMessage('acceptGameInvite')
  async acceptGameInvite(client: Socket, data: {senderUserID: number, token: string}): Promise<void> {
    try {
      await this.gameInviteService.acceptGameInvite(data.senderUserID, data.token);
    } catch (error) {
      this.errorHandlingService.emitHttpException(error, client);
    }
  }

  @SubscribeMessage('gameCreated')
  async handleGameCreated(client: Socket, data: {receiverUserID: number, created: boolean, token: string}): Promise<void> {
    try {
      await this.gameInviteService.handleGameCreated(data.receiverUserID, data.created, data.token)
    } catch (error) {
      this.errorHandlingService.emitHttpException(error, client);
    }
  }

  afterInit(): void {
    console.log('Chat Gateway Initialized');
  }

  async handleConnection(client: Socket): Promise<void> {
    try {
      console.log(`Client connected: ${client.id}`);
      let token = client.handshake.query.token;
      if (Array.isArray(token)) token = token[0];
      const userID = await this.loginService.getUserIDFromCache(token);
      const user = await this.prisma.user.findUnique({where: {ID: userID}, select: {ID: true}});
      if (!user) {
        throw new NotFoundException('User not found')
      }
      await this.prisma.user.update({where: {ID: userID}, data: {status: UserStatus.IN_CHAT, websocketID: client.id}})
      this.updateUserStatus(userID, 'IN_CHAT');
      await this.channelMemberService.addSocketToAllRooms(client, userID);
    } catch (error) {
      this.errorHandlingService.emitHttpException(error, client);
    }
  }

  async handleDisconnect(client: Socket): Promise<void> {
    try {
      console.log(`Client disconnected: ${client.id}`);
      const user = await this.prisma.user.findUnique({where: {websocketID: client.id}, select: {ID: true}});
      if (!user) {
        throw new NotFoundException('User not found')
      }
      await this.prisma.user.update({
        where: { ID: user.ID },
        data: { websocketID: null, status: UserStatus.ONLINE },
        select: {ID: true},
      });
      this.updateUserStatus(user.ID, 'IN_CHAT');
    } catch (error) {
      this.errorHandlingService.emitHttpException(error, client);
    }
  }

  async addSocketToRoom(userID: number, channelID: number): Promise<void> {
    const socket = await this.getWebSocketByUserID(userID);
    const user = await this.prisma.user.findUnique({where: {ID: userID}, select: {username: true}});
    if (socket && socket.connected) this.channelService.joinChannel(channelID, socket, user.username);
  }

  async getWebSocketByUserID(userID: number): Promise<Socket | null> {
    try {
      const user = await this.prisma.user.findUnique({ where: { ID: userID }, select: { websocketID: true } });
      if (!user) throw new NotFoundException('User not found');
      const socket: Socket = this.server.sockets.get(user.websocketID);
      if (! socket || !socket.connected) {
        return null;
      }
      return socket;
    } catch (error) {
      this.errorHandlingService.throwHttpException(error);
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

  async deleteChannel(channelID: number): Promise<void> {
    await this.prisma.channel.delete({where: {ID: channelID}});
    this.server.emit('updateChannel');
  }

  updateUserStatus(userID: number, status: ('ONLINE' | 'OFFLINE' | 'IN_GAME' | 'IN_CHAT')): void {
    this.server.emit('userStatusChange', userID, status);
  }
}
