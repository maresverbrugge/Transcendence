import {
  WebSocketServer,
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Inject, forwardRef } from '@nestjs/common';
import { Socket, Namespace } from 'socket.io';
import { Channel, ChannelMember, User, Message } from '@prisma/client';

import { ChannelService } from '../channel/channel.service';
import { MessageService } from '../message/message.service';
import { ChannelMemberService } from '../channel-member/channel-member.service';
import { GameInviteService } from '../gameInvite/game-invite.service';
import { MessagePipe } from '../pipes/message.pipe';
import { ErrorHandlingService } from '../../error-handling/error-handling.service';
import { GatewayService } from './gateway.service';

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
    private readonly channelService: ChannelService,
    private readonly messageService: MessageService,
    private readonly channelMemberService: ChannelMemberService,
    private readonly gameInviteService: GameInviteService,
    private readonly errorHandlingService: ErrorHandlingService,
    @Inject(forwardRef(() => GatewayService))
    private readonly gatewayService: GatewayService
  ) {}

  public getServer(): Namespace {
    return this.server;
  }

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

  afterInit(): void {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      await this.gatewayService.handleConnection(client);
    } catch (error) {
      this.errorHandlingService.emitHttpException(error, client);
    }
  }

  async handleDisconnect(client: Socket): Promise<void> {
    try {
      await this.gatewayService.handleDisconnect(client);
    } catch (error) {
      this.errorHandlingService.emitHttpException(error, client);
    }
  }
}
