import { Injectable, Inject, forwardRef, NotFoundException, ConflictException } from '@nestjs/common';
import { UserService } from '../blockedUser/user.service';
import { ChatGateway } from '../chat.gateway';
import { Socket } from 'socket.io';

@Injectable()
export class GameInviteService {

    constructor(
        private readonly userService: UserService,
        @Inject(forwardRef(() => ChatGateway))
        private readonly chatGateway: ChatGateway,
      ) {}
    
    async sendGameInvite(client: Socket, receiverUserID: number, token: string): Promise<void> {
        const sender = await this.userService.getUserBySocketID(token); //change to token later
        const receiver = await this.chatGateway.getWebSocketByUserID(receiverUserID);
        if (receiver.connected) {
            receiver.emit('gameInvite', {senderUsername: sender.username, senderUserID: sender.ID});
        } else {
            client.emit('gameInviteResponse', {accepted: false, message: 'user not available', receiverUserID});
        }
    }

    async cancelGameInvite(receiverUserID: number, token: string): Promise<void> {
        const sender = await this.userService.getUserBySocketID(token); //change to token later
        try {
            const receiver = await this.chatGateway.getWebSocketByUserID(receiverUserID);
            if (receiver.connected) {
                receiver.emit('cancelGameInvite', {senderUserID: sender.ID});
            }
        } catch (error) {
            if (! (error instanceof NotFoundException)) {
                throw error;
            }
        }
    }

    async declineGameInvite(senderUserID: number, message: string, token): Promise<void> {
        const receiver = await this.userService.getUserBySocketID(token); //change to token later
        const sender = await this.chatGateway.getWebSocketByUserID(senderUserID);
        if (sender.connected) {
            sender.emit('gameInviteResponse', {accepted: false, message, receiverUserID: receiver.ID});
        }
    }

    async acceptGameInvite(senderUserID: number, token): Promise<void> {
        const receiver = await this.userService.getUserBySocketID(token); //change to token later
        const sender = await this.chatGateway.getWebSocketByUserID(senderUserID);
        if (sender.connected) {
            sender.emit('gameInviteResponse', {accepted: true, message: '', receiverUserID: receiver.ID});
        }
    }

    async handleGameCreated(receiverUserID: number, created: boolean, token: string): Promise<void> {
        const receiver = await this.chatGateway.getWebSocketByUserID(receiverUserID);
        if (receiver.connected) {
            receiver.emit('gameCreated', created);
        }
    }
}
