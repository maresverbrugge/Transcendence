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
var _a;
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { PrismaService } from "../../prisma/prisma.service";
import { ChannelService } from './channel.service';
let ChannelController = class ChannelController {
    constructor(prisma, channelService) {
        this.prisma = prisma;
        this.channelService = channelService;
    }
    async getChannels(token) {
        return this.channelService.getChannelsOfUser(token);
    }
    async getChannel(channelID, token) {
        return this.channelService.getChannelAddMember(channelID, token);
    }
    async getChannelMember(channelID, token) {
        return this.channelService.getChannelMemberID(channelID, token);
    }
};
__decorate([
    Get('/:token'),
    __param(0, Param('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "getChannels", null);
__decorate([
    Get(':channelID/:token'),
    __param(0, Param('channelID', ParseIntPipe)),
    __param(1, Param('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "getChannel", null);
__decorate([
    Get('/memberID/:channelID/:token'),
    __param(0, Param('channelID', ParseIntPipe)),
    __param(1, Param('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "getChannelMember", null);
ChannelController = __decorate([
    Controller('chat/channel'),
    __metadata("design:paramtypes", [typeof (_a = typeof PrismaService !== "undefined" && PrismaService) === "function" ? _a : Object, ChannelService])
], ChannelController);
export { ChannelController };
