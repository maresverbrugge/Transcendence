var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { WebSocketServer, SubscribeMessage, MessageBody, WebSocketGateway } from '@nestjs/websockets';
import { Socket, Namespace } from 'socket.io';
import { UserService } from './user/user.service';
import { ChannelService } from './channel/channel.service';
import { MessageService } from './message/message.service';
import { ChannelMemberService } from './channel-member/channel-member.service';
let ChatGateway = class ChatGateway {
    constructor(channelService, userService, messageService, channelMemberService) {
        this.channelService = channelService;
        this.userService = userService;
        this.messageService = messageService;
        this.channelMemberService = channelMemberService;
    }
    // @SubscribeMessage('channelInvite')
    //   handleChannelInvite(client: Socket, memberID: number ) {
    //     this.channelService.sendChannelInvite(client, this.server, memberID)
    //   }
    // @SubscribeMessage('acceptChannelInvite')
    //   async handleAcceptChannelInvite(client: Socket, data: { ownerID: number, memberID: number , channelName: string}) {
    //     this.channelService.acceptChannelInvite(this.server, data.memberID, data.ownerID, data.channelName)
    //   }
    async handleNewChannel(client, data) {
        try {
            await this.channelService.newChannel(this.server, data);
        }
        catch (error) {
            client.emit('error', error);
        }
    }
    async handleJoinChannel(client, data) {
        this.channelService.joinChannel(this.server, data.channelID, client, data.token);
    }
    async handleLeaveChannel(client, data) {
        this.channelService.removeChannelMemberFromChannel(this.server, data.channelID, client, data.token);
    }
    async handleSendMessage(client, data) {
        this.messageService.sendMessage(this.server, client, data);
    }
    async handleChannelAction(data) {
        const { action, channelMemberID, token, channelID } = data;
        await this.channelMemberService.action(this.server, channelMemberID, token, channelID, action);
    }
    afterInit(server) {
        console.log('Chat Gateway Initialized');
    }
    async handleConnection(client, ...args) {
        console.log(`Client connected: ${client.id}`);
        let token = client.handshake.query.token; // er komt een IDentifiyer via de token
        if (Array.isArray(token))
            token = token[0]; // Use the first element if token is an array
        const user = await this.userService.assignSocketAndTokenToUserOrCreateNewUser(client.id, token, this.server); // voor nu om de socket toe te wijzen aan een user zonder token
        this.server.emit('userStatusChange', user.ID, 'ONLINE'); //dit moet worden verplaats naar de plek waar je in en uitlogd, niet waar je connect met de Socket
        client.emit('token', client.id); //even socketID voor token vervangen tijdelijk
    }
    async handleDisconnect(client) {
        console.log(`Client disconnected: ${client.id}`);
        const user = await this.userService.getUserBySocketID(client.id);
        await this.userService.removeWebsocketIDFromUser(client.id);
        if (user)
            this.server.emit('userStatusChange', user.ID, 'OFFLINE'); //dit moet worden verplaats naar de plek waar je in en uitlogd, niet waar je connect met de Socket
    }
};
__decorate([
    WebSocketServer(),
    __metadata("design:type", Namespace)
], ChatGateway.prototype, "server", void 0);
__decorate([
    SubscribeMessage('newChannel'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleNewChannel", null);
__decorate([
    SubscribeMessage('joinChannel'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleJoinChannel", null);
__decorate([
    SubscribeMessage('leaveChannel'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleLeaveChannel", null);
__decorate([
    SubscribeMessage('sendMessage'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleSendMessage", null);
__decorate([
    SubscribeMessage('channelAction'),
    __param(0, MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleChannelAction", null);
ChatGateway = __decorate([
    WebSocketGateway({
        namespace: 'chat',
        cors: {
            origin: 'http://localhost:3000', // Update with your client's origin
            methods: ['GET', 'POST'],
            credentials: true,
        },
    }),
    __metadata("design:paramtypes", [ChannelService,
        UserService,
        MessageService,
        ChannelMemberService])
], ChatGateway);
export { ChatGateway };
