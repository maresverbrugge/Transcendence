import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { Socket } from 'socket.io';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginService } from '../../authentication/login/login.service';
import { GatewayService } from '../gateway/gateway.service';

@Injectable()
export class GameInviteService {

    constructor(
        private readonly prisma: PrismaService,
        @Inject(forwardRef(() => LoginService))
        private readonly loginService: LoginService,
        @Inject(forwardRef(() => GatewayService))
        private readonly gatewayService: GatewayService,
      ) {}

    async sendGameInvite(client: Socket, receiverUserID: number, token: string): Promise<void> {
        const senderID = await this.loginService.getUserIDFromCache(token);
        const sender = await this.prisma.user.findUnique({
            where: {ID: senderID},
            select: {username: true}
        })
        const receiver = await this.gatewayService.getWebSocketByUserID(receiverUserID);
        if (receiver && receiver.connected) {
            receiver.emit('gameInvite', {senderUsername: sender.username, senderUserID: senderID});
        } else {
            client.emit('gameInviteResponse', {accepted: false, message: 'user not available', receiverUserID});
        }
    }

    async cancelGameInvite(receiverUserID: number, token: string): Promise<void> {
        const senderID = await this.loginService.getUserIDFromCache(token);
        try {
            const receiver = await this.gatewayService.getWebSocketByUserID(receiverUserID);
            if (receiver && receiver.connected) {
                receiver.emit('cancelGameInvite', {senderUserID: senderID});
            }
        } catch (error) {
            if (! (error instanceof NotFoundException)) {
                throw error;
            }
        }
    }

    async declineGameInvite(senderUserID: number, message: string, token: string): Promise<void> {
        const receiverID = await this.loginService.getUserIDFromCache(token);
        const sender = await this.gatewayService.getWebSocketByUserID(senderUserID);
        if (sender && sender.connected) {
            sender.emit('gameInviteResponse', {accepted: false, message, receiverUserID: receiverID});
        }
    }

    async acceptGameInvite(senderUserID: number, token: string): Promise<void> {
        const receiverID = await this.loginService.getUserIDFromCache(token);
        const sender = await this.gatewayService.getWebSocketByUserID(senderUserID);
        if (sender && sender.connected) {
            sender.emit('gameInviteResponse', {accepted: true, message: '', receiverUserID: receiverID});
        }
    }

    async handleGameCreated(receiverUserID: number, created: boolean, token: string): Promise<void> {
        const senderID = await this.loginService.getUserIDFromCache(token)
        const receiver = await this.gatewayService.getWebSocketByUserID(receiverUserID);
        if (receiver && receiver.connected) {
            receiver.emit('gameCreated', {created, senderID});
        }
    }
}
