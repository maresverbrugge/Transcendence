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
import { ForbiddenException, Injectable, NotFoundException, Inject, forwardRef, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from "../../prisma/prisma.service";
import { UserService } from '../user/user.service';
import { ChannelService } from '../channel/channel.service';
let ChannelMemberService = class ChannelMemberService {
    constructor(prisma, userService, channelService) {
        this.prisma = prisma;
        this.userService = userService;
        this.channelService = channelService;
    }
    async getChannelMember(channelMemberID) {
        return this.prisma.channelMember.findUnique({
            where: { ID: channelMemberID },
            select: {
                ID: true,
                websocketID: true,
                isAdmin: true,
                isBanned: true,
                isMuted: true,
                isOwner: true,
                banUntil: true,
                muteUntil: true,
                userID: true,
                channelID: true,
                user: { select: { ID: true, websocketID: true, username: true } }
            },
        });
    }
    async getChannelMemberBySocketID(token, channelID) {
        const userID = await this.userService.getUserIDBySocketID(token); //change to Token later
        const channelMember = await this.prisma.channelMember.findFirst({
            where: {
                userID: userID,
                channelID: channelID
            },
            select: {
                ID: true,
                websocketID: true,
                isAdmin: true,
                isBanned: true,
                isMuted: true,
                isOwner: true,
                banUntil: true,
                muteUntil: true,
                userID: true,
                channelID: true,
                user: { select: { ID: true, websocketID: true, username: true } }
            },
        });
        if (!channelMember)
            throw new NotFoundException('ChannelMember not found');
        return channelMember;
    }
    async createChannelMember(token, channelID) {
        const userID = await this.userService.getUserIDBySocketID(token); //change to Token later (+ error check?)
        const channelMember = await this.prisma.channelMember.create({
            data: {
                userID: userID,
                channelID: channelID
            },
            select: {
                ID: true,
                websocketID: true,
                isAdmin: true,
                isBanned: true,
                isMuted: true,
                isOwner: true,
                banUntil: true,
                muteUntil: true,
                userID: true,
                channelID: true,
                user: { select: { ID: true, websocketID: true, username: true } }
            },
        });
        if (!channelMember)
            throw new InternalServerErrorException('Error creating channelMember');
        return channelMember;
    }
    async deleteChannelMember(channelMemberID) {
        try {
            return await this.prisma.channelMember.delete({
                where: { ID: channelMemberID },
            });
        }
        catch (error) {
            throw new NotFoundException('ChannelMember not found');
        }
    }
    async isAdmin(token, channelID) {
        const channelMember = await this.getChannelMemberBySocketID(token, channelID); //later veranderen naar token
        return channelMember.isAdmin;
    }
    async isOwner(token, channelID) {
        const channelMember = await this.getChannelMemberBySocketID(token, channelID); //later veranderen naar token
        return channelMember.isOwner;
    }
    async updateChannelMember(memberID, updateData) {
        return await this.prisma.channelMember.update({
            where: { ID: memberID },
            data: updateData,
            select: {
                ID: true,
                websocketID: true,
                isAdmin: true,
                isBanned: true,
                isMuted: true,
                isOwner: true,
                banUntil: true,
                muteUntil: true,
                channelID: true,
                userID: true,
                user: { select: { ID: true, websocketID: true, username: true } }
            },
        });
    }
    async updateChannelMemberEmit(server, channelID, memberID, updateData) {
        const updatedChannelMember = await this.updateChannelMember(memberID, updateData);
        server.to(String(channelID)).emit('channelMember', updatedChannelMember);
    }
    async checkBanOrKick(channelMember) {
        if (!channelMember.isBanned)
            return;
        if (!channelMember.banUntil)
            throw new ForbiddenException('You are banned from this channel');
        else {
            const timeLeft = channelMember.banUntil.getTime() - new Date().getTime();
            if (timeLeft > 0) {
                const secondsLeft = Math.floor(timeLeft / 1000);
                throw new ForbiddenException(`You are kicked from this channel. Try again in ${secondsLeft} seconds.`);
            }
            else
                await this.updateChannelMember(channelMember.ID, { isBanned: false, banUntil: null });
        }
    }
    async checkPermissions(token, channelID, targetIsAdmin, requiredRole, action) {
        const isAllowed = requiredRole === 'owner'
            ? await this.isOwner(token, channelID)
            : await this.isAdmin(token, channelID);
        if (!isAllowed)
            throw new ForbiddenException(`You don't have ${requiredRole} permissions`);
        if (action === 'ban' || action === 'kick' || action === 'mute') {
            if (targetIsAdmin)
                throw new ForbiddenException(`You can't ${action} another admin`);
        }
    }
    actionGetUpdateData(action) {
        switch (action) {
            case 'ban':
                return { isBanned: true };
            case 'mute': {
                const muteUntil = new Date(Date.now() + 60 * 1000);
                return { isMuted: true, muteUntil };
            }
            case 'kick': {
                const banUntil = new Date(Date.now() + 120 * 1000);
                return { isBanned: true, banUntil };
            }
            case 'makeAdmin':
                return { isAdmin: true };
            case 'demote':
                return { isAdmin: false };
            default:
                throw new Error(`Unknown action: ${action}`);
        }
    }
    async action(server, channelMemberID, token, channelID, action) {
        try {
            const targetChannelMember = await this.getChannelMember(channelMemberID);
            await this.checkPermissions(token, channelID, targetChannelMember.isAdmin, 'admin', action);
            const updateData = this.actionGetUpdateData(action);
            await this.updateChannelMemberEmit(server, channelID, channelMemberID, updateData);
            if (action === 'ban' || action === 'kick') {
                const socket = server.sockets.get(targetChannelMember.user.websocketID);
                if (socket)
                    socket.leave(String(channelID));
            }
            server.to(String(channelID)).emit('action', { action, username: targetChannelMember.user.username });
        }
        catch (error) {
            server.to(String(channelID)).emit('error', error);
        }
    }
};
ChannelMemberService = __decorate([
    Injectable(),
    __param(2, Inject(forwardRef(() => ChannelService))),
    __metadata("design:paramtypes", [typeof (_a = typeof PrismaService !== "undefined" && PrismaService) === "function" ? _a : Object, UserService,
        ChannelService])
], ChannelMemberService);
export { ChannelMemberService };
