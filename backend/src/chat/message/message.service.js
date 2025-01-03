var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from "../../prisma/prisma.service";
import { UserService } from '../user/user.service';
import { ChannelService } from '../channel/channel.service';
let MessageService = class MessageService {
    constructor(prisma, userService, channelService) {
        this.prisma = prisma;
        this.userService = userService;
        this.channelService = channelService;
    }
    async createMessage(channelID, senderID, content) {
        const sender = await this.userService.getUserByUserID(senderID);
        if (!sender)
            throw new NotFoundException('User not found');
        return this.prisma.message.create({
            data: {
                content: content,
                senderName: sender.username,
                sender: {
                    connect: { ID: senderID }
                },
                channel: {
                    connect: { ID: channelID }
                }
            }
        });
    }
    async sendMessage(server, client, data) {
        try {
            await this.channelService.checkIsMuted(data.channelID, data.token);
            const sender = await this.userService.getUserBySocketID(data.token);
            const newMessage = await this.createMessage(data.channelID, sender.ID, data.content);
            server.to(String(data.channelID)).emit('newMessage', newMessage);
            // server.emit('newMessageOnChannel', data.channelID)
        }
        catch (error) {
            client.emit('error', error);
        }
    }
};
MessageService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [typeof (_a = typeof PrismaService !== "undefined" && PrismaService) === "function" ? _a : Object, UserService,
        ChannelService])
], MessageService);
export { MessageService };
