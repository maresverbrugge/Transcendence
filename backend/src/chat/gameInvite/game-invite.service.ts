import { Injectable, Inject, forwardRef, NotFoundException } from '@nestjs/common';
import { ChatGateway } from '../chat.gateway';
import { Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginService } from 'src/authentication/login/login.service';

@Injectable()
export class GameInviteService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly loginService: LoginService,
        @Inject(forwardRef(() => ChatGateway))
        private readonly chatGateway: ChatGateway,
      ) {}
    
    async sendGameInvite(client: Socket, receiverUserID: number, token: string): Promise<void> {
        const senderID = await this.loginService.getUserIDFromCache(token);
        const sender = await this.prisma.user.findUnique({
            where: {ID: senderID},
            select: {username: true}
        })
        const receiver = await this.chatGateway.getWebSocketByUserID(receiverUserID);
        if (receiver && receiver.connected) {
            receiver.emit('gameInvite', {senderUsername: sender.username, senderUserID: senderID});
        } else {
            client.emit('gameInviteResponse', {accepted: false, message: 'user not available', receiverUserID});
        }
    }

    async cancelGameInvite(receiverUserID: number, token: string): Promise<void> {
        const senderID = await this.loginService.getUserIDFromCache(token);
        try {
            const receiver = await this.chatGateway.getWebSocketByUserID(receiverUserID);
            if (receiver && receiver.connected) {
                receiver.emit('cancelGameInvite', {senderUserID: senderID});
            }
        } catch (error) {
            if (! (error instanceof NotFoundException)) {
                throw error;
            }
        }
    }

    async declineGameInvite(senderUserID: number, message: string, token): Promise<void> {
        const receiverID = await this.loginService.getUserIDFromCache(token);
        const sender = await this.chatGateway.getWebSocketByUserID(senderUserID);
        if (sender && sender.connected) {
            sender.emit('gameInviteResponse', {accepted: false, message, receiverUserID: receiverID});
        }
    }

    async acceptGameInvite(senderUserID: number, token): Promise<void> {
        const receiverID = await this.loginService.getUserIDFromCache(token);
        const sender = await this.chatGateway.getWebSocketByUserID(senderUserID);
        if (sender && sender.connected) {
            sender.emit('gameInviteResponse', {accepted: true, message: '', receiverUserID: receiverID});
        }
    }

    async handleGameCreated(receiverUserID: number, created: boolean, token: string): Promise<void> {
        const senderID = await this.loginService.getUserIDFromCache(token)
        const receiver = await this.chatGateway.getWebSocketByUserID(receiverUserID);
        if (receiver && receiver.connected) {
            receiver.emit('gameCreated', {created, senderID});
        }
    }
}
